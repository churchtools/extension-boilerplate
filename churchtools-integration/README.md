# ChurchTools Integration Documentation

This folder contains documentation for ChurchTools core developers who are integrating the extension system.

**Note**: This documentation will be moved to the main ChurchTools repository. It's included here temporarily for development and reference.

## Contents

- **[integration-guide.md](integration-guide.md)** - How to load and render extensions in ChurchTools
- **[extension-point-contracts.md](extension-point-contracts.md)** - Defining extension point contracts
- **[multi-extension-support.md](multi-extension-support.md)** - Loading multiple extensions simultaneously
- **[asset-handling.md](asset-handling.md)** - Asset path handling and deployment

## Quick Overview

### Loading an Extension

```javascript
// 1. Import the extension
const ext = await import('/extensions/my-extension/extension.es.js');

// 2. Load entry point
const entryPoint = await ext.loadEntryPoint('main');

// 3. Render extension with data
const instance = await ext.renderExtension('app', entryPoint, {
  userId: currentUser.id,
  permissions: currentUser.permissions
});

// 4. Set up event listeners
instance.on('notification:show', (data) => {
  showNotification(data.message, data.type);
});

// 5. Send events to extension
instance.emit('settings:changed', { theme: 'dark' });

// 6. Cleanup when done
await instance.destroy();
```

### Extension Point Integration

1. Define extension point contract in `churchtools-extension-points` package
2. ChurchTools reads extension manifest for extension point mappings
3. ChurchTools loads extension at appropriate location
4. ChurchTools provides data according to contract
5. Extension renders and communicates via events

## For Extension Developers

If you're developing an extension, see the main documentation in `docs/`:

- [Getting Started](../docs/getting-started.md)
- [Core Concepts](../docs/core-concepts.md)
- [API Reference](../docs/api-reference.md)
