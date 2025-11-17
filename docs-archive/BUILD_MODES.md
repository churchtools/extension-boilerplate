# Build Modes Guide

This extension boilerplate supports two build modes to accommodate different extension sizes and use cases.

## Table of Contents

- [Overview](#overview)
- [Simple Mode (Default)](#simple-mode-default)
- [Advanced Mode](#advanced-mode)
- [Choosing the Right Mode](#choosing-the-right-mode)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)

## Overview

The boilerplate provides two build strategies:

1. **Simple Mode** - Single bundle with all entry points (best for small extensions)
2. **Advanced Mode** - Code splitting with lazy loading (best for large extensions)

## Simple Mode (Default)

### What It Does

Bundles all entry points into a single file. When ChurchTools loads your extension, all entry points are immediately available.

### When to Use

✅ **Use Simple Mode when:**
- Extension is small (< 100KB total)
- You have few entry points (< 10)
- Entry points share most of their code
- You want the simplest setup
- First-time extension developers

### Pros

- ✅ Simplest setup - no configuration needed
- ✅ Single file to deploy
- ✅ Automatic code deduplication
- ✅ Great caching - one file for entire extension
- ✅ Synchronous access to all entry points

### Cons

- ❌ Loads all code upfront
- ❌ Not optimal for large, diverse extensions
- ❌ Users download code they might not use

### Build Command

```bash
npm run build
# or explicitly
npm run build:simple
```

### Configuration

In `.env`:
```bash
VITE_BUILD_MODE=simple
```

Or leave it unset (simple is default).

### Usage

```javascript
// ChurchTools loads the extension
import {
  renderExtension,
  welcomeEntryPoint,
  userInfoEntryPoint,
  dataViewerEntryPoint
} from '/ccm/your-key/extension.es.js';

// All entry points are immediately available
await renderExtension('div1', welcomeEntryPoint);
await renderExtension('div2', userInfoEntryPoint);
```

### Bundle Output

```
dist/
├── extension.es.js    (ES module - ~2-50KB depending on your code)
└── extension.umd.js   (UMD - for script tags)
```

---

## Advanced Mode

### What It Does

Uses Vite's automatic code splitting to create separate chunks for each entry point. Entry points are loaded on-demand when ChurchTools requests them.

### When to Use

✅ **Use Advanced Mode when:**
- Extension is large (> 100KB total)
- You have many entry points (> 10)
- Entry points are independent (little shared code)
- Different pages use different entry points
- Performance is critical

### Pros

- ✅ Only loads code that's needed
- ✅ Optimal first-page load performance
- ✅ Better for large, diverse extensions
- ✅ Automatic code splitting by Vite
- ✅ Shared code extracted into separate chunks

### Cons

- ❌ Multiple files to manage
- ❌ Async loading required
- ❌ Slightly more complex usage
- ❌ More HTTP requests (mitigated by HTTP/2)

### Build Command

```bash
npm run build:advanced
```

### Configuration

In `.env`:
```bash
VITE_BUILD_MODE=advanced
```

### Usage

```javascript
// ChurchTools loads the extension
import {
  renderExtension,
  loadEntryPoint
} from '/ccm/your-key/extension.es.js';

// Load entry points dynamically
const welcomeEntry = await loadEntryPoint('welcome');
await renderExtension('div1', welcomeEntry);

// Only loads the code for 'userInfo' when this runs
const userInfoEntry = await loadEntryPoint('userInfo');
await renderExtension('div2', userInfoEntry);
```

### Bundle Output

```
dist/
├── extension.es.js              (Main bundle - ~1-5KB)
├── extension.umd.js             (UMD entry point)
├── welcome-[hash].js            (Welcome entry point chunk)
├── userInfo-[hash].js           (User info entry point chunk)
├── dataViewer-[hash].js         (Data viewer entry point chunk)
└── shared-[hash].js             (Shared code chunk)
```

---

## Choosing the Right Mode

### Decision Flow Chart

```
Start: How large is your extension?

├─ Small (< 50KB)
│  └─ Use Simple Mode ✓
│
├─ Medium (50-100KB)
│  ├─ Few entry points (< 5)?
│  │  └─ Use Simple Mode ✓
│  └─ Many entry points (≥ 5)?
│     └─ Use Advanced Mode ✓
│
└─ Large (> 100KB)
   └─ Use Advanced Mode ✓
```

### Quick Comparison

| Aspect | Simple Mode | Advanced Mode |
|--------|-------------|---------------|
| **Bundle Size** | Single file | Multiple chunks |
| **Load Time** | All upfront | On-demand |
| **Complexity** | Low | Medium |
| **HTTP Requests** | 1 | 2-10+ |
| **Best For** | Small extensions | Large extensions |
| **Setup** | Zero config | Minimal config |
| **Caching** | Excellent | Good |
| **First Load** | Slower (if large) | Faster |

### Real-World Examples

#### Simple Mode Example
**Extension:** Person Details Widget
- 3 entry points
- Shared UI components
- Total size: 35KB
- All pages use similar code

→ **Use Simple Mode**

#### Advanced Mode Example
**Extension:** Complete Church Management Suite
- 20 entry points
- Calendar, Events, Persons, Reports, etc.
- Total size: 250KB
- Each page uses different features

→ **Use Advanced Mode**

---

## Configuration

### Environment Variables

Set in `.env` file:

```bash
# Extension key (required)
VITE_KEY=my-extension

# Build mode (optional, defaults to 'simple')
VITE_BUILD_MODE=simple   # or 'advanced'

# ChurchTools URL for development
VITE_BASE_URL=https://your.church.tools
VITE_USERNAME=youruser
VITE_PASSWORD=yourpass
```

### Switching Between Modes

You can change modes without modifying code:

```bash
# Build in simple mode
VITE_BUILD_MODE=simple npm run build

# Build in advanced mode
VITE_BUILD_MODE=advanced npm run build
```

Or use the convenience scripts:

```bash
npm run build:simple
npm run build:advanced
```

---

## Usage Examples

### Simple Mode Usage

```javascript
// ChurchTools integration
import {
  renderExtension,
  welcomeEntryPoint,
  userInfoEntryPoint,
  dataViewerEntryPoint
} from '/ccm/calendar/extension.es.js';

// Synchronous - all entry points are ready
await renderExtension('welcome-div', welcomeEntryPoint);
await renderExtension('user-div', userInfoEntryPoint);
await renderExtension('data-div', dataViewerEntryPoint);
```

### Advanced Mode Usage

#### Option 1: Using loadEntryPoint

```javascript
import { renderExtension, loadEntryPoint } from '/ccm/calendar/extension.es.js';

// Load entry point by name
const entryPoint = await loadEntryPoint('welcome');
await renderExtension('welcome-div', entryPoint);

// Load another entry point
const userEntry = await loadEntryPoint('userInfo');
await renderExtension('user-div', userEntry);
```

#### Option 2: Helper Function

```javascript
import { renderExtension, loadEntryPoint } from '/ccm/calendar/extension.es.js';

// Helper to load and render in one call
async function loadExtension(divId, entryPointName) {
  const entryPoint = await loadEntryPoint(entryPointName);
  await renderExtension(divId, entryPoint);
}

// Usage
await loadExtension('welcome-div', 'welcome');
await loadExtension('user-div', 'userInfo');
```

#### Option 3: Conditional Loading

```javascript
import { renderExtension, loadEntryPoint, hasEntryPoint } from '/ccm/calendar/extension.es.js';

// Check if entry point exists before loading
if (hasEntryPoint('welcome')) {
  const entryPoint = await loadEntryPoint('welcome');
  await renderExtension('welcome-div', entryPoint);
} else {
  console.warn('Welcome entry point not found');
}
```

#### Option 4: Discovery

```javascript
import { getAvailableEntryPoints } from '/ccm/calendar/extension.es.js';

// Get list of all available entry points
const entryPoints = getAvailableEntryPoints();
console.log('Available entry points:', entryPoints);
// Output: ['welcome', 'userInfo', 'dataViewer']
```

---

## ChurchTools Integration Patterns

### Pattern 1: Page-Based Loading (Advanced Mode)

```javascript
// ChurchTools determines which entry points to load based on current page
const pageEntryPoints = {
  '/persons': ['personDetails', 'personSidebar'],
  '/calendar': ['calendarWidget'],
  '/events': ['eventsList', 'eventDetails'],
};

const currentPage = window.location.pathname;
const entryPointsToLoad = pageEntryPoints[currentPage] || [];

// Load only the entry points for this page
for (const name of entryPointsToLoad) {
  const entryPoint = await loadEntryPoint(name);
  await renderExtension(`${name}-container`, entryPoint);
}
```

### Pattern 2: Lazy Loading on User Interaction

```javascript
// Load entry point when user clicks a tab
document.getElementById('calendar-tab').addEventListener('click', async () => {
  if (!calendarLoaded) {
    const entryPoint = await loadEntryPoint('calendarWidget');
    await renderExtension('calendar-content', entryPoint);
    calendarLoaded = true;
  }
});
```

### Pattern 3: Simple Mode with Multiple Extensions

```javascript
// Load multiple extensions, each in simple mode
const calendar = await import('/ccm/calendar/extension.es.js');
const events = await import('/ccm/events/extension.es.js');

// All entry points immediately available
await calendar.renderExtension('cal-div', calendar.welcomeEntryPoint);
await events.renderExtension('events-div', events.welcomeEntryPoint);
```

---

## Migration Guide

### From Simple to Advanced

**Step 1:** Update `.env`
```bash
VITE_BUILD_MODE=advanced
```

**Step 2:** Update ChurchTools integration code

**Before (Simple Mode):**
```javascript
import { renderExtension, welcomeEntryPoint } from './extension.es.js';
await renderExtension('div', welcomeEntryPoint);
```

**After (Advanced Mode):**
```javascript
import { renderExtension, loadEntryPoint } from './extension.es.js';
const entryPoint = await loadEntryPoint('welcome');
await renderExtension('div', entryPoint);
```

**Step 3:** Rebuild
```bash
npm run build:advanced
```

**Step 4:** Deploy all generated chunks (not just main bundle)

### From Advanced to Simple

**Step 1:** Update `.env`
```bash
VITE_BUILD_MODE=simple
```

**Step 2:** Update ChurchTools integration code

**Before (Advanced Mode):**
```javascript
import { renderExtension, loadEntryPoint } from './extension.es.js';
const entryPoint = await loadEntryPoint('welcome');
await renderExtension('div', entryPoint);
```

**After (Simple Mode):**
```javascript
import { renderExtension, welcomeEntryPoint } from './extension.es.js';
await renderExtension('div', welcomeEntryPoint);
```

**Step 3:** Rebuild
```bash
npm run build:simple
```

---

## Performance Comparison

### Scenario: Extension with 10 entry points, 200KB total

#### Simple Mode
```
Initial Load: 200KB (all code)
Page 1: 0KB (already loaded)
Page 2: 0KB (already loaded)
Total: 200KB
```

#### Advanced Mode
```
Initial Load: 10KB (main bundle)
Page 1 (uses 2 entry points): 40KB
Page 2 (uses 1 entry point): 20KB
Total: 70KB (if user only visits 2 pages)
```

**Winner:** Advanced mode if users don't use all features.

### Scenario: Extension with 3 entry points, 40KB total

#### Simple Mode
```
Initial Load: 40KB (all code)
Page 1: 0KB
Total: 40KB
```

#### Advanced Mode
```
Initial Load: 5KB (main bundle)
Page 1: 15KB (entry point chunk)
Page 2: 12KB (entry point chunk)
Total: 32KB (using 2 entry points)
But requires 3 HTTP requests
```

**Winner:** Simple mode (lower overhead, better caching).

---

## Advanced Mode Entry Point Registry

When using advanced mode, register your entry points in `src/loaders.ts`:

```typescript
const entryPointRegistry: Record<string, EntryPointLoader> = {
    welcome: () => import('./entry-points/welcome'),
    userInfo: () => import('./entry-points/user-info'),
    dataViewer: () => import('./entry-points/data-viewer'),

    // Add your custom entry points here:
    // myCustomEntry: () => import('./entry-points/my-custom-entry'),
};
```

### Adding New Entry Points

1. Create your entry point file:
```typescript
// src/entry-points/my-feature.ts
import type { EntryPoint } from '../main';

const myFeatureEntryPoint: EntryPoint = ({ user, element }) => {
  element.innerHTML = `<h1>My Feature for ${user.firstName}</h1>`;
};

export { myFeatureEntryPoint };
export default myFeatureEntryPoint;
```

2. Register it in `src/loaders.ts`:
```typescript
const entryPointRegistry = {
  // ... existing entries
  myFeature: () => import('./entry-points/my-feature'),
};
```

3. Export it from `src/entry-points/index.ts`:
```typescript
export { myFeatureEntryPoint } from './my-feature';
```

4. Use it:
```javascript
const entryPoint = await loadEntryPoint('myFeature');
await renderExtension('my-div', entryPoint);
```

---

## Troubleshooting

### "Entry point not found" error

**Problem:** `loadEntryPoint('myEntry')` throws an error.

**Solution:** Make sure the entry point is registered in `src/loaders.ts`.

### Advanced mode not creating chunks

**Problem:** Building with `VITE_BUILD_MODE=advanced` produces single bundle.

**Solution:**
1. Verify `.env` has `VITE_BUILD_MODE=advanced`
2. Clear build cache: `rm -rf dist node_modules/.vite`
3. Rebuild: `npm run build:advanced`

### Simple mode bundle too large

**Problem:** Single bundle is > 100KB.

**Solution:** Consider switching to advanced mode or reducing dependencies.

### Chunks loading slowly

**Problem:** In advanced mode, chunks take time to load.

**Solution:**
1. Ensure HTTP/2 is enabled on server
2. Use CDN for better caching
3. Preload critical chunks

---

## Best Practices

### For Simple Mode

1. ✅ Keep extension small (< 100KB)
2. ✅ Use for extensions with tightly coupled features
3. ✅ Optimize bundle size with tree-shaking
4. ✅ Minimize dependencies

### For Advanced Mode

1. ✅ Use for large extensions (> 100KB)
2. ✅ Register all entry points in loaders.ts
3. ✅ Test lazy loading behavior
4. ✅ Monitor chunk sizes (aim for < 30KB per chunk)
5. ✅ Use descriptive entry point names

### General

1. ✅ Start with simple mode
2. ✅ Switch to advanced mode when bundle exceeds 50-100KB
3. ✅ Profile both modes to measure actual performance
4. ✅ Document which mode you're using for other developers

---

## Summary

| If you... | Use this mode |
|-----------|---------------|
| Are just starting | Simple Mode |
| Have < 50KB extension | Simple Mode |
| Have > 100KB extension | Advanced Mode |
| Have many independent features | Advanced Mode |
| Want easiest setup | Simple Mode |
| Need best performance | Advanced Mode |
| Are unsure | Simple Mode (switch later if needed) |

**Remember:** You can switch between modes anytime by changing `VITE_BUILD_MODE` and rebuilding. Your extension code stays the same!
