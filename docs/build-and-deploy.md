# Build and Deployment Guide

Complete guide to building, testing, and deploying ChurchTools extensions.

## Build Modes

The boilerplate supports two build modes:

### Simple Mode (Default)

Single bundle with all entry points included.

**When to use**:
- Extension < 100KB
- Few entry points (< 10)
- All features are commonly used

**Pros**:
✅ Single file to deploy
✅ Great caching
✅ Simpler setup
✅ No async loading

**Cons**:
❌ Loads all code upfront
❌ Not optimal for large extensions

**Build command**:
```bash
npm run build:simple
# or
VITE_BUILD_MODE=simple npm run build
```

**Output**:
```
dist/
├── extension.es.js    # ES module (all code)
├── extension.umd.js   # UMD bundle (all code)
└── manifest.json      # Extension manifest
```

### Advanced Mode

Code splitting with lazy-loaded entry points.

**When to use**:
- Extension > 100KB
- Many entry points (> 10)
- Different pages use different features

**Pros**:
✅ Only loads what's needed
✅ Better performance for large extensions
✅ Smaller initial load

**Cons**:
❌ Multiple files to manage
❌ Async loading required
❌ More HTTP requests

**Build command**:
```bash
npm run build:advanced
# or
VITE_BUILD_MODE=advanced npm run build
```

**Output**:
```
dist/
├── extension.es.js           # Main bundle (loader)
├── main-[hash].js           # Main entry point chunk
├── admin-[hash].js          # Admin entry point chunk
├── calendar-[hash].js       # Calendar entry point chunk
├── extension.umd.js         # UMD bundle (no splitting)
└── manifest.json            # Extension manifest
```

### Choosing a Mode

| Scenario | Recommended Mode |
|----------|-----------------|
| Extension < 50KB | Simple |
| Extension > 100KB | Advanced |
| All features used | Simple |
| Selective feature usage | Advanced |
| Single page app | Simple |
| Multi-page app | Advanced |

**When in doubt**: Start with simple mode, switch to advanced if bundle exceeds 50-100KB.

## Building

### Development Build

```bash
npm run dev
```

Starts development server with:
- Hot module reload
- Source maps
- Auto-login to ChurchTools
- Test environment

### Production Build

```bash
npm run build
```

Creates optimized production build in `dist/`:
- Minified code
- Tree-shaking applied
- Source maps (optional)
- Copied manifest.json

### Explicit Mode Build

```bash
# Simple mode
npm run build:simple

# Advanced mode
npm run build:advanced
```

## Configuration

### Environment Variables

Create `.env` file:

```bash
# Extension key (required)
VITE_KEY=my-extension

# Build mode (optional, default: simple)
VITE_BUILD_MODE=simple

# ChurchTools instance for development (optional)
VITE_BASE_URL=https://your.church.tools
VITE_USERNAME=your-username
VITE_PASSWORD=your-password
```

### Vite Configuration

The boilerplate includes two Vite configs:

- `vite.config.ts` - Main configuration (simple/advanced mode)
- `vite.config.legacy.ts` - Legacy mode (deprecated)

Most settings are automatically configured based on `VITE_BUILD_MODE`.

## Testing

### Manual Testing

1. Build the extension: `npm run build`
2. Start dev mode: `npm run dev`
3. Test all extension points
4. Check browser console for errors
5. Test with browser DevTools network tab open

## Deployment

### Package for Deployment

Create a deployment package:

```bash
npm run deploy
```

This script:
1. Runs `npm run build`
2. Creates a ZIP file in `releases/`
3. Includes `dist/` contents
4. Names file: `{key}-v{version}-{git-hash}.zip`

**Example output**:
```
📦 Creating ChurchTools extension package...
   Extension: My Extension
   Key: my-extension
   Version: 1.0.0
   Git Hash: a1b2c3d
   Archive: my-extension-v1.0.0-a1b2c3d.zip
✅ Package created successfully!
```

### Deployment Package Contents

```
my-extension-v1.0.0-a1b2c3d.zip
└── dist/
    ├── extension.es.js
    ├── extension.umd.js
    ├── [entry-point-chunks].js  (advanced mode only)
    └── manifest.json
```

### Upload to ChurchTools

1. Log into ChurchTools as admin
2. Go to **Admin** → **Extensions**
3. Click **Upload Extension**
4. Select the ZIP file from `releases/`
5. ChurchTools validates and installs

**ChurchTools will**:
- Extract the ZIP
- Validate `manifest.json`
- Check compatibility
- Request permission approval
- Install to `/ccm/{key}/` or `/extensions/{key}/`

## Build Optimization

### Reducing Bundle Size

1. **Remove unused dependencies**:
```bash
npm prune
```

2. **Analyze bundle size**:
```bash
npm run build -- --mode analyze
```

3. **Use tree-shaking**:
- Import only what you need
- Avoid `import *`
- Use named imports

```typescript
// Good
import { get } from 'lodash-es';

// Bad
import _ from 'lodash';
```

4. **Lazy load heavy dependencies**:
```typescript
// Instead of importing at top
import moment from 'moment';

// Lazy load when needed
async function formatDate(date) {
  const moment = await import('moment');
  return moment.default(date).format('YYYY-MM-DD');
}
```

### Code Splitting Strategies

In advanced mode, Vite automatically splits code:

1. **Entry point chunks**: Each entry point is a separate chunk
2. **Vendor chunks**: Shared dependencies extracted
3. **Dynamic imports**: Use `import()` for on-demand loading

**Example**:
```typescript
// Heavy component loaded on demand
async function loadChart() {
  const { Chart } = await import('./chart-component');
  return new Chart();
}
```

## Deployment Best Practices

### Version Management

Follow semantic versioning:
- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features (1.1.0)
- **PATCH**: Bug fixes (1.0.1)

Update `manifest.json` version before each deployment.

### Git Workflow

```bash
# 1. Update version in manifest.json
# 2. Commit changes
git add manifest.json
git commit -m "Bump version to 1.1.0"

# 3. Create git tag
git tag v1.1.0

# 4. Build and deploy
npm run deploy

# 5. Push with tags
git push origin main --tags
```

### Testing Before Deployment

1. Run local tests: `npm test` (if configured)
2. Build: `npm run build`
3. Start dev mode: `npm run dev`
4. Manual testing checklist
5. Check console for errors
6. Test all entry points
7. Verify API calls work

### Deployment Checklist

- [ ] Version updated in `manifest.json`
- [ ] All tests pass
- [ ] Build succeeds without errors
- [ ] Preview tested manually
- [ ] No console errors
- [ ] Git committed and tagged
- [ ] Deployment package created
- [ ] Tested upload to ChurchTools (staging first!)

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails with errors

**Solutions**:
1. Check TypeScript errors: `npm run build`
2. Verify all imports are correct
3. Check `vite.config.ts` for errors
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
5. Check Node.js version: `node --version` (should be v18+)

### Large Bundle Size

**Issue**: Bundle is too large

**Solutions**:
1. Analyze bundle: `npm run build -- --mode analyze`
2. Remove unused dependencies
3. Use tree-shaking (named imports)
4. Switch to advanced mode for code splitting
5. Lazy load heavy dependencies

### Extension Won't Load in ChurchTools

**Issue**: Extension uploaded but doesn't load

**Solutions**:
1. Check browser console for errors
2. Verify `manifest.json` is valid
3. Check extension key matches in `.env` and `manifest.json`
4. Ensure entry points are registered correctly
5. Verify ChurchTools compatibility version
6. Check network tab for failed requests

### Asset Path Issues

**Issue**: Assets (images, fonts) don't load

**Solutions**:
1. Use relative paths for assets
2. Import assets in JavaScript:
```typescript
import logo from './assets/logo.png';
```
3. Check network tab for 404 errors
4. Verify build includes assets in `dist/`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Create deployment package
        run: npm run deploy

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: extension-package
          path: releases/*.zip
```

## See Also

- [Getting Started](getting-started.md) - Setup and first build
- [Core Concepts](core-concepts.md) - Understanding build modes
- [Manifest Reference](manifest.md) - Manifest configuration
- [API Reference](api-reference.md) - Complete API documentation
