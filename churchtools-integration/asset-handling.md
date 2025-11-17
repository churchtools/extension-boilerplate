# Asset Handling

Guide for handling assets in ChurchTools extensions.

## Overview

Extensions are built with relative paths, allowing them to be deployed to any URL structure without rebuilding.

## Asset Paths

### Build-Time Asset Handling

Vite automatically handles assets:

```typescript
// In extension code
import logo from './assets/logo.png';

element.innerHTML = `<img src="${logo}" alt="Logo" />`;
```

During build, Vite:
1. Processes the asset (optimization, hashing)
2. Copies it to `dist/assets/`
3. Replaces import with relative path

### Runtime Asset Paths

Extensions use relative paths:

```
/extensions/my-extension/
├── extension.es.js
├── manifest.json
└── assets/
    ├── logo-abc123.png
    └── styles-def456.css
```

The extension automatically uses correct paths regardless of deployment location:
- `/extensions/my-extension/assets/logo-abc123.png`
- `/ccm/my-extension/assets/logo-abc123.png`
- Any other base path

## Deploying Extensions

### Flexible Deployment

Extensions can be deployed to different paths:

```
Option 1: /extensions/{key}/
Option 2: /ccm/{key}/
Option 3: /custom-path/{key}/
```

All work without rebuilding because paths are relative.

### Example Deployment

```javascript
// ChurchTools loads from any path
const ext = await import('/extensions/my-ext/extension.es.js');
const ext = await import('/ccm/my-ext/extension.es.js');
const ext = await import('/custom/my-ext/extension.es.js');

// Assets load correctly in all cases
```

## Best Practices

### 1. Import Assets in JavaScript

```typescript
// Good: Import in code
import logo from './assets/logo.png';
element.innerHTML = `<img src="${logo}" />`;

// Bad: Hardcoded path
element.innerHTML = `<img src="/assets/logo.png" />`;
```

### 2. Use Vite's Asset Handling

Let Vite process assets:

```typescript
// Images
import icon from './icon.png';

// CSS
import './styles.css';

// Fonts
import './fonts/custom.woff2';
```

### 3. Avoid Absolute Paths

```typescript
// Good: Relative or imported
import api from './api';
import logo from './logo.png';

// Bad: Absolute paths
const logo = '/extensions/my-ext/logo.png'; // Won't work if deployed elsewhere
```

## See Also

- [Integration Guide](integration-guide.md) - Loading extensions
- [Build & Deploy](../docs/build-and-deploy.md) - Building extensions
