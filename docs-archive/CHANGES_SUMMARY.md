# Multi-Extension Support - Changes Summary

This document summarizes the changes made to support multiple ChurchTools extensions on the same page.

## Problem

Previously, all extensions built with this boilerplate would export to the same UMD global name `ChurchToolsExtension`, causing namespace collisions when multiple extensions were loaded on the same page.

## Solution

Each extension now uses its unique `KEY` (from `VITE_KEY` environment variable) to create a unique global namespace: `ChurchToolsExtension_{KEY}`

## Key Changes

### 1. Vite Configuration (vite.config.ts:13)

```typescript
const key = process.env.VITE_KEY || 'default';
const globalName = `ChurchToolsExtension_${key}`;

// Used in defineConfig
build: {
  lib: {
    name: globalName,
    // ...
  }
}
```

**Impact:** Each extension built with a different `VITE_KEY` gets a unique global name.

### 2. Example Usage

**Before:**
```javascript
// Could only load one extension
const { renderExtension } = ChurchToolsExtension;
```

**After:**
```javascript
// Can load multiple extensions
const calendar = ChurchToolsExtension_calendar;
const events = ChurchToolsExtension_events;

calendar.renderExtension('cal-div', calendar.welcomeEntryPoint);
events.renderExtension('events-div', events.welcomeEntryPoint);
```

## New Files

### Documentation
- **MULTI_EXTENSION_GUIDE.md** - Comprehensive guide for multi-extension support
- **MULTI_EXTENSION_EXAMPLE.html** - Working HTML example with 3 extensions
- **CHANGES_SUMMARY.md** - This file

### Scripts
- **scripts/build-multi-test.sh** - Helper script to build multiple extensions for testing

### Updated Documentation
- **README.md** - Added features section and multi-extension usage
- **INTEGRATION_EXAMPLE.md** - Updated UMD examples with correct global names

## How It Works

### Building Extensions

Each extension developer creates their extension with a unique KEY:

```bash
# Extension 1: Calendar
VITE_KEY=calendar npm run build
# Produces: ChurchToolsExtension_calendar

# Extension 2: Events
VITE_KEY=events npm run build
# Produces: ChurchToolsExtension_events
```

### Loading in ChurchTools

ChurchTools can load multiple extensions simultaneously:

```html
<!-- Load extensions -->
<script src="/ccm/calendar/extension.umd.js"></script>
<script src="/ccm/events/extension.umd.js"></script>
<script src="/ccm/users/extension.umd.js"></script>

<script>
  // All are available with unique global names
  ChurchToolsExtension_calendar.renderExtension('div1', entryPoint1);
  ChurchToolsExtension_events.renderExtension('div2', entryPoint2);
  ChurchToolsExtension_users.renderExtension('div3', entryPoint3);
</script>
```

## Verification

You can verify the global name in a built UMD bundle:

```bash
npm run build
grep -o "ChurchToolsExtension_[a-zA-Z0-9_]*" dist/extension.umd.js
# Output: ChurchToolsExtension_multitest (or your VITE_KEY value)
```

## Testing Multi-Extension Setup

Use the provided helper script:

```bash
./scripts/build-multi-test.sh
```

This builds three test extensions (calendar, events, users) in `dist-multi-test/` directory.

## Backward Compatibility

### Breaking Changes

For **UMD users**, the global name has changed from:
- `ChurchToolsExtension` (old)
- to `ChurchToolsExtension_{KEY}` (new)

### Non-Breaking

For **ES module users**, nothing changes:
```javascript
import { renderExtension } from './extension.es.js';
// Still works the same way
```

## Migration Guide

If you have existing ChurchTools code using the old global name:

**Old Code:**
```javascript
const { renderExtension } = ChurchToolsExtension;
```

**New Code (if VITE_KEY=myextension):**
```javascript
const { renderExtension } = ChurchToolsExtension_myextension;
```

**Or use a helper:**
```javascript
function getExtension(key) {
  return window[`ChurchToolsExtension_${key}`];
}

const { renderExtension } = getExtension('myextension');
```

## Benefits

1. ✅ Multiple extensions can coexist on same page
2. ✅ No namespace collisions
3. ✅ Each extension is independently manageable
4. ✅ Clear identification of which extension is which
5. ✅ Easier debugging (global name shows extension KEY)

## Implementation Details

### Global Name Pattern

```
ChurchToolsExtension_{KEY}
```

Where `{KEY}` is the value of `VITE_KEY` from `.env` file or environment.

### Examples

| VITE_KEY | UMD Global Name |
|----------|----------------|
| calendar | ChurchToolsExtension_calendar |
| events | ChurchToolsExtension_events |
| attendance-tracker | ChurchToolsExtension_attendance-tracker |
| custom_reports | ChurchToolsExtension_custom_reports |

### Default Fallback

If `VITE_KEY` is not set, defaults to:
```
ChurchToolsExtension_default
```

## Architecture

```
ChurchTools Page
├── Extension 1 (calendar)
│   ├── Global: ChurchToolsExtension_calendar
│   ├── Renders to: #calendar-widget
│   └── Entry Point: calendarDashboard
├── Extension 2 (events)
│   ├── Global: ChurchToolsExtension_events
│   ├── Renders to: #events-sidebar
│   └── Entry Point: eventsList
└── Extension 3 (users)
    ├── Global: ChurchToolsExtension_users
    ├── Renders to: #users-panel
    └── Entry Point: usersOverview
```

Each extension:
- Has its own global namespace
- Can render to multiple DIVs
- Has multiple entry points
- Shares ChurchTools API client
- Is isolated from other extensions

## Questions & Answers

**Q: Can I use the same KEY for different extensions?**
A: No, each extension should have a unique KEY to prevent collisions.

**Q: What if I use ES modules instead of UMD?**
A: ES modules don't have this issue - you import each extension from its own URL.

**Q: Can extensions communicate with each other?**
A: Yes, but it should be done through:
- ChurchTools API
- Custom events
- Shared state management (if ChurchTools provides it)

**Q: Do I need to change my extension code?**
A: No, only the global name changes. Your extension code remains the same.

**Q: How does ChurchTools know which extensions are installed?**
A: ChurchTools maintains an extension registry server-side and generates the appropriate script tags.

## See Also

- [MULTI_EXTENSION_GUIDE.md](MULTI_EXTENSION_GUIDE.md) - Complete guide
- [USAGE.md](USAGE.md) - General usage guide
- [INTEGRATION_EXAMPLE.md](INTEGRATION_EXAMPLE.md) - Integration examples
