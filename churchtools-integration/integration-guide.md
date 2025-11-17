# ChurchTools Integration Guide

Guide for ChurchTools core developers on integrating the extension system.

## Overview

Extensions are loaded dynamically and rendered into specific DIV elements in the ChurchTools UI. Each extension point has a contract defining what data is provided and what events are available.

## Loading an Extension

### Step 1: Import the Extension Module

```javascript
const ext = await import('/extensions/my-extension/extension.es.js');
```

### Step 2: Load Entry Point

```javascript
const entryPoint = await ext.loadEntryPoint('main');
```

### Step 3: Render Extension

```javascript
const instance = await ext.renderExtension('app-container', entryPoint, {
  userId: currentUser.id,
  permissions: currentUser.permissions
});
```

### Step 4: Set Up Communication

```javascript
// Listen to events FROM extension
instance.on('notification:show', (data) => {
  showNotification(data.message, data.type);
});

instance.on('data:update', (data) => {
  updateChurchToolsData(data);
});

// Send events TO extension
instance.emit('settings:changed', newSettings);
instance.emit('user:updated', updatedUser);
```

### Step 5: Cleanup

```javascript
// When navigating away or closing
await instance.destroy();
```

## Extension Point Integration

### 1. Define Extension Point Contract

Create contract in `churchtools-extension-points` package:

```typescript
// src/calendar-dialog.ts
export interface CalendarDialogData {
  currentAppointment: object;
  masterData: object;
}

export interface CalendarDialogEvents {
  'appointment:changed': (data: object) => void;
  'dialog:closing': () => void;
}

export interface CalendarDialogEmits {
  'appointment:update': (data: object) => void;
}

export const CalendarDialogMetadata = {
  id: 'calendar-dialog',
  eventNames: ['appointment:changed', 'dialog:closing'] as const,
} as const;
```

### 2. Export Contract

```typescript
// src/index.ts
export * from './calendar-dialog';

// Add to metadata collection
export const allExtensionPointMetadata = [
  // ...
  CalendarDialogMetadata,
] as const;

export const extensionPointMetadataById = Object.fromEntries(
  allExtensionPointMetadata.map(metadata => [metadata.id, metadata])
);
```

### 3. Integrate in ChurchTools

```javascript
// ChurchTools calendar dialog code
async function showCalendarDialog(appointment) {
  const dialog = document.getElementById('calendar-dialog');

  // Create container for extension
  const extensionContainer = document.createElement('div');
  extensionContainer.id = 'calendar-extension';
  dialog.appendChild(extensionContainer);

  // Load extension
  const manifest = await fetch('/extensions/my-ext/manifest.json').then(r => r.json());
  const extensionPoint = manifest.extensionPoints.find(ep => ep.id === 'calendar-dialog');

  if (extensionPoint) {
    const ext = await import(`/extensions/${manifest.key}/extension.es.js`);
    const entryPoint = await ext.loadEntryPoint(extensionPoint.entryPoint);

    const instance = await ext.renderExtension('calendar-extension', entryPoint, {
      currentAppointment: appointment,
      masterData: getCalendarMasterData()
    });

    // Listen to extension events
    instance.on('appointment:update', (data) => {
      updateAppointment(data);
    });

    // Send events to extension
    dialog.addEventListener('input', (e) => {
      if (e.target.name === 'appointment-data') {
        instance.emit('appointment:changed', getFormData());
      }
    });

    // Cleanup on dialog close
    dialog.addEventListener('close', async () => {
      instance.emit('dialog:closing');
      await instance.destroy();
    });
  }
}
```

## Reading Extension Manifest

```javascript
async function loadExtension(extensionKey) {
  // 1. Read manifest
  const manifest = await fetch(`/extensions/${extensionKey}/manifest.json`)
    .then(r => r.json());

  // 2. Validate manifest
  if (!manifest.key || !manifest.version || !manifest.extensionPoints) {
    throw new Error('Invalid manifest');
  }

  // 3. Check compatibility
  if (manifest.minChurchToolsVersion &&
      !isCompatible(manifest.minChurchToolsVersion, CHURCHTOOLS_VERSION)) {
    throw new Error('Incompatible ChurchTools version');
  }

  // 4. Return manifest
  return manifest;
}
```

## Extension Point Best Practices

### 1. Provide Clear Container

```javascript
// Good: Dedicated container
<div id="extension-container" class="extension-point"></div>

// Bad: Shared container
<div id="app"><!-- Extension renders here maybe? --></div>
```

### 2. Pass All Required Data

```javascript
// Good: All data from contract
await ext.renderExtension('container', entryPoint, {
  currentAppointment: appointment,
  masterData: masterData
});

// Bad: Missing data
await ext.renderExtension('container', entryPoint, {
  currentAppointment: appointment
  // Missing masterData!
});
```

### 3. Handle Events

```javascript
// Good: Listen to all contract events
instance.on('appointment:update', handleUpdate);
instance.on('notification:show', showNotification);

// Bad: Ignore extension events
// (Events are emitted but nothing happens)
```

### 4. Clean Up Properly

```javascript
// Good: Always destroy
dialog.addEventListener('close', async () => {
  instance.emit('dialog:closing');
  await instance.destroy();
  container.remove();
});

// Bad: No cleanup
dialog.addEventListener('close', () => {
  dialog.close();
  // Extension instance still running!
});
```

## Multiple Extensions

ChurchTools can load multiple extensions simultaneously:

```javascript
const extensions = ['calendar-ext', 'booking-ext', 'availability-ext'];

const instances = await Promise.all(
  extensions.map(async (key) => {
    const ext = await import(`/extensions/${key}/extension.es.js`);
    const entryPoint = await ext.loadEntryPoint('calendar-dialog');
    return ext.renderExtension(`${key}-container`, entryPoint, data);
  })
);

// All extensions run independently
instances.forEach(instance => {
  instance.on('notification:show', showNotification);
});
```

## Error Handling

```javascript
async function loadExtensionSafely(key, divId, entryPointName, data) {
  try {
    const ext = await import(`/extensions/${key}/extension.es.js`);
    const entryPoint = await ext.loadEntryPoint(entryPointName);
    return await ext.renderExtension(divId, entryPoint, data);
  } catch (error) {
    console.error(`Failed to load extension ${key}:`, error);

    // Show error UI
    const container = document.getElementById(divId);
    container.innerHTML = `
      <div class="extension-error">
        <p>Failed to load extension: ${error.message}</p>
      </div>
    `;

    return null;
  }
}
```

## Performance Considerations

### 1. Lazy Load Extensions

Only load extensions when needed:

```javascript
// Good: Load on demand
button.addEventListener('click', async () => {
  const ext = await import('/extensions/my-ext/extension.es.js');
  // ...
});

// Bad: Load all at startup
const ext1 = await import('/extensions/ext1/extension.es.js');
const ext2 = await import('/extensions/ext2/extension.es.js');
// ...
```

### 2. Reuse Instances

Cache extension instances when appropriate:

```javascript
const extensionCache = new Map();

async function getExtension(key) {
  if (!extensionCache.has(key)) {
    const ext = await import(`/extensions/${key}/extension.es.js`);
    extensionCache.set(key, ext);
  }
  return extensionCache.get(key);
}
```

### 3. Clean Up Unused Extensions

```javascript
// Track active instances
const activeInstances = new Map();

async function loadExtension(key, divId, entryPoint, data) {
  // Clean up previous instance
  if (activeInstances.has(divId)) {
    await activeInstances.get(divId).destroy();
  }

  // Load new instance
  const instance = await renderExtension(divId, entryPoint, data);
  activeInstances.set(divId, instance);

  return instance;
}
```

## Security

### 1. Validate Extension Source

Only load extensions from trusted sources:

```javascript
const ALLOWED_EXTENSION_PATHS = ['/extensions/', '/ccm/'];

function isAllowedExtension(path) {
  return ALLOWED_EXTENSION_PATHS.some(prefix => path.startsWith(prefix));
}

async function loadExtension(path) {
  if (!isAllowedExtension(path)) {
    throw new Error('Unauthorized extension path');
  }

  return import(path);
}
```

### 2. Sanitize Data

Sanitize data before passing to extensions:

```javascript
function sanitizeData(data) {
  // Remove sensitive fields
  const { password, token, ...safe } = data;
  return safe;
}

const instance = await ext.renderExtension('div', entryPoint, sanitizeData(data));
```

### 3. Content Security Policy

Set appropriate CSP headers for extension scripts.

## See Also

- [Extension Point Contracts](extension-point-contracts.md) - Defining contracts
- [Multi-Extension Support](multi-extension-support.md) - Multiple extensions
- [Asset Handling](asset-handling.md) - Asset paths
