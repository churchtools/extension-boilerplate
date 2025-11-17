# ChurchTools Asset Path Handling

This document explains how extension assets are loaded and how ChurchTools can flexibly control the deployment path without requiring extensions to be rebuilt.

## Overview

Extensions are built with **relative paths** that automatically adapt to wherever ChurchTools deploys them. This means:

✅ ChurchTools can change the asset path at any time
✅ Extensions don't need to be rebuilt
✅ Path changes are transparent to extensions
✅ Multiple deployment strategies are supported

## Current and Future Paths

### Current Path
```
/ccm/<key>/assets/
```

### Planned Future Path
```
/extensions/<key>/assets/
```

**Both work without rebuilding extensions!**

## How It Works

### 1. Relative Imports (Automatic)

Extensions are built with relative paths. When ChurchTools loads the main bundle, all dynamic imports resolve relative to that bundle's location.

**Example:**

```javascript
// ChurchTools loads from current path
import { loadEntryPoint } from '/ccm/calendar/assets/extension.es.js';

// Extension dynamically imports (relative to main bundle)
await loadEntryPoint('welcome');
// → Fetches: /ccm/calendar/assets/welcome-[hash].js

// Later, ChurchTools changes path
import { loadEntryPoint } from '/extensions/calendar/assets/extension.es.js';

// Extension still works! (relative imports adapt)
await loadEntryPoint('welcome');
// → Fetches: /extensions/calendar/assets/welcome-[hash].js
```

**No rebuild needed!** The same extension bundle works at both paths.

### 2. Build Configuration

Extensions are built with `base: './'` in production, which creates relative imports:

```typescript
// vite.config.ts
base: isDevelopment ? `/ccm/${key}/` : './',
```

This means:
- **Development**: Uses `/ccm/<key>/` for dev server
- **Production**: Uses relative paths that work anywhere

## ChurchTools Integration

### Basic Usage (Recommended)

Simply load the extension from any path - it will work automatically:

```javascript
// Load from current path
const extension = await import('/ccm/calendar/assets/extension.es.js');

// Use normally
const entryPoint = await extension.loadEntryPoint('welcome');
await extension.renderExtension('my-div', entryPoint);

// All dynamic imports work automatically!
```

**Change paths at any time:**

```javascript
// Change to new path structure
const extension = await import('/extensions/calendar/assets/extension.es.js');

// Same code, works identically
const entryPoint = await extension.loadEntryPoint('welcome');
await extension.renderExtension('my-div', entryPoint);
```

### Advanced: Explicit Configuration (Optional)

For advanced scenarios, ChurchTools can explicitly configure the base path:

```javascript
// Load extension
const extension = await import('/extensions/calendar/assets/extension.es.js');

// Configure base path (optional, rarely needed)
extension.configureExtension({
  basePath: '/extensions/calendar/assets'
});

// Load entry points
const entryPoint = await extension.loadEntryPoint('welcome');
```

**Note:** This is rarely needed. Relative imports handle path changes automatically.

### Per-Call Configuration (Alternative)

You can also pass the base path per call:

```javascript
const entryPoint = await extension.loadEntryPoint('welcome', {
  basePath: '/extensions/calendar/assets'
});
```

## Deployment Scenarios

### Scenario 1: Current Deployment

```
ChurchTools structure:
/ccm/
  └── calendar/
      └── assets/
          ├── extension.es.js
          ├── extension.umd.js
          ├── welcome-abc123.js
          ├── user-info-def456.js
          └── styles.css
```

**ChurchTools loads:**
```javascript
import('/ccm/calendar/assets/extension.es.js')
```

**Entry points resolve to:**
```
/ccm/calendar/assets/welcome-abc123.js
/ccm/calendar/assets/user-info-def456.js
```

✅ Works automatically

---

### Scenario 2: Future Deployment

```
ChurchTools structure:
/extensions/
  └── calendar/
      └── assets/
          ├── extension.es.js
          ├── extension.umd.js
          ├── welcome-abc123.js
          ├── user-info-def456.js
          └── styles.css
```

**ChurchTools loads:**
```javascript
import('/extensions/calendar/assets/extension.es.js')
```

**Entry points resolve to:**
```
/extensions/calendar/assets/welcome-abc123.js
/extensions/calendar/assets/user-info-def456.js
```

✅ Same extension bundle, different path, works automatically

---

### Scenario 3: Versioned Deployment

```
ChurchTools structure:
/extensions/
  └── calendar/
      └── v1.2.0/
          ├── extension.es.js
          ├── extension.umd.js
          ├── welcome-abc123.js
          └── user-info-def456.js
```

**ChurchTools loads:**
```javascript
import('/extensions/calendar/v1.2.0/extension.es.js')
```

**Entry points resolve to:**
```
/extensions/calendar/v1.2.0/welcome-abc123.js
/extensions/calendar/v1.2.0/user-info-def456.js
```

✅ Works automatically

---

### Scenario 4: CDN Deployment

```
ChurchTools structure:
https://cdn.example.com/extensions/calendar/
  ├── extension.es.js
  ├── welcome-abc123.js
  └── user-info-def456.js
```

**ChurchTools loads:**
```javascript
import('https://cdn.example.com/extensions/calendar/extension.es.js')
```

**Entry points resolve to:**
```
https://cdn.example.com/extensions/calendar/welcome-abc123.js
https://cdn.example.com/extensions/calendar/user-info-def456.js
```

✅ Works automatically

## CSS and Assets

CSS files and other assets work the same way:

```javascript
// ChurchTools loads CSS from any path
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/extensions/calendar/assets/styles.css';
document.head.appendChild(link);
```

If CSS uses relative URLs (e.g., `url('./images/logo.png')`), those resolve relative to the CSS file location.

## Migration Guide for ChurchTools

### Step 1: Current Implementation
```javascript
// Current: Load from /ccm/
async function loadExtension(key) {
  const path = `/ccm/${key}/assets/extension.es.js`;
  const extension = await import(path);
  return extension;
}
```

### Step 2: Add Configuration (Optional)
```javascript
// Optional: Explicit configuration
async function loadExtension(key) {
  const basePath = `/ccm/${key}/assets`;
  const extension = await import(`${basePath}/extension.es.js`);

  // Configure (optional, for advanced scenarios)
  extension.configureExtension({ basePath });

  return extension;
}
```

### Step 3: Change Path (No Extension Changes Needed)
```javascript
// Future: Just change the path!
async function loadExtension(key) {
  const basePath = `/extensions/${key}/assets`;
  const extension = await import(`${basePath}/extension.es.js`);
  return extension;
}
```

**No extension rebuilds required!**

## File Structure in Builds

### Simple Mode Output
```
dist/
├── extension.es.js   (all code bundled)
└── extension.umd.js  (all code bundled)
```

Deploy to: `/ccm/<key>/assets/` or `/extensions/<key>/assets/` or anywhere!

### Advanced Mode Output
```
dist/
├── extension.es.js          (main bundle)
├── welcome-[hash].js        (lazy chunk)
├── user-info-[hash].js      (lazy chunk)
├── data-viewer-[hash].js    (lazy chunk)
└── extension.umd.js         (all code bundled)
```

**All files must be in the same directory!**

Deploy entire directory to: `/ccm/<key>/assets/` or `/extensions/<key>/assets/` or anywhere!

## Common Patterns

### Pattern 1: Dynamic Extension Loading

```javascript
class ExtensionManager {
  constructor(basePath = '/ccm') {
    this.basePath = basePath;
  }

  async loadExtension(key) {
    const url = `${this.basePath}/${key}/assets/extension.es.js`;
    const extension = await import(url);
    return extension;
  }

  async loadEntryPoint(extension, name) {
    return await extension.loadEntryPoint(name);
  }
}

// Usage
const manager = new ExtensionManager('/ccm');
const ext = await manager.loadExtension('calendar');
const entryPoint = await manager.loadEntryPoint(ext, 'welcome');

// Later, change base path
const newManager = new ExtensionManager('/extensions');
const ext2 = await newManager.loadExtension('calendar');
// Works with the same extension bundles!
```

### Pattern 2: Configuration-Based Loading

```javascript
// ChurchTools configuration
const config = {
  extensionBasePath: '/extensions', // Can be changed via admin settings
  extensions: {
    calendar: { key: 'calendar', version: '1.0.0' },
    events: { key: 'events', version: '2.1.0' },
  }
};

async function loadExtension(key) {
  const ext = config.extensions[key];
  const url = `${config.extensionBasePath}/${ext.key}/assets/extension.es.js`;

  return await import(url);
}

// Change config.extensionBasePath without touching extensions!
```

### Pattern 3: Version Management

```javascript
async function loadExtensionVersion(key, version) {
  // Paths can include versions
  const url = `/extensions/${key}/${version}/extension.es.js`;
  const extension = await import(url);

  return extension;
}

// Different versions can coexist
const v1 = await loadExtensionVersion('calendar', 'v1.0.0');
const v2 = await loadExtensionVersion('calendar', 'v2.0.0');
```

## Troubleshooting

### Issue: Entry Points Not Loading

**Problem:** `loadEntryPoint()` fails to load chunks

**Possible Causes:**
1. Files not deployed to same directory
2. Network/CORS issues
3. File permissions

**Solution:**
1. Verify all files in `dist/` are deployed together
2. Check browser console for network errors
3. Ensure CORS headers allow loading if using CDN

### Issue: 404 on Chunk Files

**Problem:** Main bundle loads but chunks return 404

**Cause:** Files are in different directories or paths don't match

**Solution:**
1. Deploy entire `dist/` directory contents to same location
2. Verify paths in browser network tab
3. Check that base path matches actual deployment location

### Debugging

Enable console logging to see what's being loaded:

```javascript
// In browser console
const originalImport = window.import;
window.import = async function(...args) {
  console.log('[Dynamic Import]', args[0]);
  return originalImport.apply(this, args);
};
```

Or check extension loading:

```javascript
const extension = await import('/ccm/calendar/assets/extension.es.js');

// Check what's loaded
console.log('Extension exports:', Object.keys(extension));

// Test entry point loading
try {
  const entryPoint = await extension.loadEntryPoint('welcome');
  console.log('Entry point loaded successfully');
} catch (error) {
  console.error('Failed to load entry point:', error);
}
```

## Best Practices

### For ChurchTools Development

1. ✅ **Use relative imports** - Let the browser handle path resolution
2. ✅ **Keep all assets together** - Deploy entire `dist/` directory as a unit
3. ✅ **Configure once** - Set base path in one central location
4. ✅ **Test path changes** - Verify extensions work after changing deployment path
5. ✅ **Handle errors** - Wrap loads in try-catch for better error messages

### For Extension Development

1. ✅ **Don't hardcode paths** - Let ChurchTools control deployment
2. ✅ **Test both build modes** - Ensure simple and advanced modes work
3. ✅ **Keep assets together** - Don't split assets across different URLs
4. ✅ **Use relative URLs in CSS** - For images and fonts
5. ✅ **Document asset requirements** - List all files that need deployment

## Summary

**Key Points:**

1. ✅ Extensions build with **relative paths**
2. ✅ ChurchTools can deploy to **any path**
3. ✅ **No rebuilds needed** when paths change
4. ✅ Simple and advanced modes **both support flexible paths**
5. ✅ Configuration API available but **rarely needed**

**For ChurchTools:**
- Load extension from any path
- Dynamic imports work automatically
- Change paths anytime without extension changes

**For Extension Developers:**
- Build once, deploy anywhere
- No path configuration in extension code
- ChurchTools controls deployment

This design ensures maximum flexibility for ChurchTools while keeping extension development simple!
