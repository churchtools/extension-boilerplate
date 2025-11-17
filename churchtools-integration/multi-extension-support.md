# Multi-Extension Support

Guide for loading and managing multiple extensions simultaneously in ChurchTools.

## Overview

ChurchTools supports loading multiple extensions at the same time. Each extension:
- Has a unique `key`
- Is isolated in its own scope
- Has its own event bus
- Can coexist without conflicts

## Loading Multiple Extensions

### Sequential Loading

```javascript
const extensions = ['calendar-ext', 'booking-ext', 'availability-ext'];

for (const key of extensions) {
  const ext = await import(`/extensions/${key}/extension.es.js`);
  const entryPoint = await ext.loadEntryPoint('calendar-dialog');
  const instance = await ext.renderExtension(`${key}-container`, entryPoint, data);

  instance.on('notification:show', showNotification);
}
```

### Parallel Loading

```javascript
const extensions = ['calendar-ext', 'booking-ext', 'availability-ext'];

const instances = await Promise.all(
  extensions.map(async (key) => {
    const ext = await import(`/extensions/${key}/extension.es.js`);
    const entryPoint = await ext.loadEntryPoint('calendar-dialog');
    return ext.renderExtension(`${key}-container`, entryPoint, data);
  })
);

// Set up event listeners for all instances
instances.forEach(instance => {
  instance.on('notification:show', showNotification);
});
```

## Extension Isolation

### Namespaced Globals (UMD)

Each UMD build uses a unique global based on the extension key:

```javascript
// Extension 1 (key: "calendar")
const ext1 = window.ChurchToolsExtension_calendar;

// Extension 2 (key: "booking")
const ext2 = window.ChurchToolsExtension_booking;

// No conflicts!
```

### Independent Event Buses

Each extension instance has its own event bus:

```javascript
const instance1 = await renderExtension('div1', entry1, data1);
const instance2 = await renderExtension('div2', entry2, data2);

// Events are isolated
instance1.emit('test'); // Only instance1 receives
instance2.emit('test'); // Only instance2 receives
```

## Managing Multiple Extensions

### Extension Manager

```javascript
class ExtensionManager {
  constructor() {
    this.instances = new Map();
  }

  async load(key, divId, extensionPointId, data) {
    // Read manifest
    const manifest = await fetch(`/extensions/${key}/manifest.json`)
      .then(r => r.json());

    // Find extension point
    const ep = manifest.extensionPoints.find(ep => ep.id === extensionPointId);
    if (!ep) return null;

    // Load extension
    const ext = await import(`/extensions/${key}/extension.es.js`);
    const entryPoint = await ext.loadEntryPoint(ep.entryPoint);
    const instance = await ext.renderExtension(divId, entryPoint, data);

    // Track instance
    this.instances.set(`${key}:${divId}`, instance);

    return instance;
  }

  async unload(key, divId) {
    const instanceKey = `${key}:${divId}`;
    const instance = this.instances.get(instanceKey);

    if (instance) {
      await instance.destroy();
      this.instances.delete(instanceKey);
    }
  }

  async unloadAll() {
    for (const instance of this.instances.values()) {
      await instance.destroy();
    }
    this.instances.clear();
  }
}

// Usage
const manager = new ExtensionManager();

await manager.load('calendar-ext', 'div1', 'calendar-dialog', data);
await manager.load('booking-ext', 'div2', 'calendar-dialog', data);

// Later
await manager.unloadAll();
```

## Communication Between Extensions

Extensions should NOT communicate directly. Use ChurchTools as the mediator:

```javascript
// Extension 1 emits event
instance1.on('data:updated', (data) => {
  // ChurchTools receives event
  updateChurchToolsData(data);

  // ChurchTools sends event to Extension 2
  instance2.emit('external:data:updated', data);
});
```

## See Also

- [Integration Guide](integration-guide.md) - Loading extensions
- [Extension Point Contracts](extension-point-contracts.md) - Defining contracts
