# Event Communication Guide

Learn how to communicate between your extension and ChurchTools using events.

## Overview

Extensions communicate with ChurchTools through a bidirectional event system:

- **Listen to events FROM ChurchTools** using `on()`
- **Emit events TO ChurchTools** using `emit()`
- **Remove listeners** using `off()`

```
ChurchTools ──[on('event')]──▶ Extension listens
ChurchTools ◀─[emit('event')]── Extension emits
```

## Listening to Events (FROM ChurchTools)

Use `on()` to listen to events from ChurchTools:

```typescript
const myEntry: EntryPoint = ({ on }) => {
  on('data:updated', (newData) => {
    console.log('ChurchTools sent new data:', newData);
  });

  on('dialog:closing', () => {
    console.log('Dialog is closing');
  });
};
```

### Wildcard Listener

Listen to all events:

```typescript
on('*', (eventName, ...args) => {
  console.log(`Event: ${eventName}`, args);
});
```

## Emitting Events (TO ChurchTools)

Use `emit()` to send events to ChurchTools:

```typescript
const myEntry: EntryPoint = ({ emit }) => {
  // Emit simple event
  emit('data:loaded');

  // Emit event with data
  emit('person:selected', {
    id: 123,
    name: 'John Doe'
  });

  // Emit notification
  emit('notification:show', {
    message: 'Operation completed!',
    type: 'success',
    duration: 3000
  });
};
```

## Removing Listeners

Use `off()` to remove event listeners:

```typescript
const myEntry: EntryPoint = ({ on, off }) => {
  const handler = (data) => {
    console.log('Data:', data);
  };

  // Add listener
  on('data:updated', handler);

  // Remove listener (in cleanup)
  return () => {
    off('data:updated', handler);
  };
};
```

**Important**: Always remove listeners in the cleanup function to prevent memory leaks!

## Extension Point Contracts

Each extension point defines which events are available.

### Example: Calendar Dialog Tab Contract

```typescript
// Events FROM ChurchTools (listen with on())
interface AppointmentDialogTabEvents {
  'appointment:changed': (data: object) => void;
  'dialog:closing': () => void;
}

// Events TO ChurchTools (emit with emit())
interface AppointmentDialogTabEmits {
  'appointment:update': (data: object) => void;
}
```

### Using the Contract

```typescript
import type { EntryPoint } from '../lib/main';
import type {
  AppointmentDialogTabData,
  AppointmentDialogTabEvents,
  AppointmentDialogTabEmits
} from '@churchtools/extension-points';

const calendarEntry: EntryPoint<AppointmentDialogTabData> = ({ data, on, emit }) => {
  // Listen to contract-defined events
  on('appointment:changed', (newData) => {
    console.log('Appointment changed:', newData);
  });

  on('dialog:closing', () => {
    console.log('Dialog closing');
  });

  // Emit contract-defined events
  emit('appointment:update', {
    title: 'Updated Title',
    duration: 90
  });
};
```

## Common Event Patterns

### Data Loading

```typescript
const myEntry: EntryPoint = async ({ emit, churchtoolsClient }) => {
  emit('data:loading');

  try {
    const data = await churchtoolsClient.get('/api/data');
    emit('data:loaded', { data });
  } catch (error) {
    emit('data:error', { error: error.message });
  }
};
```

### User Actions

```typescript
const myEntry: EntryPoint = ({ element, emit }) => {
  element.innerHTML = `
    <button id="save-btn">Save</button>
    <button id="cancel-btn">Cancel</button>
  `;

  document.getElementById('save-btn').onclick = () => {
    emit('action:save', { data: { /* ... */ } });
  };

  document.getElementById('cancel-btn').onclick = () => {
    emit('action:cancel');
  };
};
```

### State Changes

```typescript
const myEntry: EntryPoint = ({ emit }) => {
  let selectedItems = [];

  function updateSelection(items) {
    selectedItems = items;
    emit('selection:changed', { items: selectedItems });
  }
};
```

### Notifications

```typescript
const myEntry: EntryPoint = ({ emit }) => {
  // Success notification
  emit('notification:show', {
    message: 'Saved successfully!',
    type: 'success',
    duration: 3000
  });

  // Error notification
  emit('notification:show', {
    message: 'Failed to save',
    type: 'error',
    duration: 5000
  });

  // Info notification
  emit('notification:show', {
    message: 'Processing...',
    type: 'info',
    duration: 2000
  });
};
```

## Event Naming Conventions

Follow these conventions for event names:

### Use `noun:verb` Pattern

✅ **Good**:
- `data:loaded`
- `person:selected`
- `appointment:updated`
- `dialog:closing`

❌ **Bad**:
- `loaded`
- `select`
- `update`
- `close`

### Be Specific

✅ **Good**:
- `persons:loaded`
- `calendar:appointment:created`
- `settings:saved`

❌ **Bad**:
- `data:loaded` (what data?)
- `created` (what was created?)
- `saved` (what was saved?)

### Use Present Tense for Actions

✅ **Good**:
- `data:loading` (ongoing)
- `data:loaded` (completed)
- `save:requested` (requested)
- `save:success` (completed)

## Testing Events

### Development Server

The development server includes an Event Bus tester:

1. **Select an event** from the dropdown (populated from extension point contract)
2. **Enter event data** as JSON
3. **Click "Send Event"** to emit the event to your extension
4. **Monitor Event Log** to see all events your extension emits

### Testing Workflow

1. **Test incoming events**:
   - Select event from dropdown
   - Edit event data
   - Click "Send Event"
   - Verify your extension handles it correctly

2. **Test outgoing events**:
   - Interact with your extension
   - Check Event Log for emitted events
   - Verify event names and data are correct

### Example Test Scenario

Extension: Calendar availability checker

**Test incoming events**:
```
Event: appointment:changed
Data: { "selectedDate": "2025-11-20", "duration": 60 }
Expected: Extension re-checks availability
```

**Test outgoing events**:
```
User clicks "Suggest Better Time"
Expected Event: time:suggest
Expected Data: { "time": "14:00", "reason": "Better availability" }
```

## Best Practices

### 1. Document Your Events

Add comments listing all events:

```typescript
/**
 * Events Emitted:
 * - persons:loaded - When persons are loaded successfully
 * - persons:error - When loading fails
 * - person:selected - When user selects a person
 *
 * Events Listened:
 * - refresh:requested - Reloads the persons list
 * - filter:changed - Updates the filter
 */
const personsEntry: EntryPoint = ({ on, emit }) => {
  // Implementation
};
```

### 2. Always Clean Up Listeners

```typescript
const myEntry: EntryPoint = ({ on, off }) => {
  const handler1 = (data) => console.log(data);
  const handler2 = (data) => console.log(data);

  on('event1', handler1);
  on('event2', handler2);

  return () => {
    off('event1', handler1);
    off('event2', handler2);
  };
};
```

### 3. Validate Event Data

```typescript
on('data:updated', (newData) => {
  if (!newData || typeof newData !== 'object') {
    console.error('Invalid data received');
    return;
  }

  // Process valid data
  updateUI(newData);
});
```

### 4. Handle Errors in Event Handlers

```typescript
on('data:process', async (data) => {
  try {
    await processData(data);
    emit('data:processed', { success: true });
  } catch (error) {
    console.error('Error processing data:', error);
    emit('data:error', { error: error.message });
  }
});
```

### 5. Don't Emit Too Frequently

Throttle or debounce high-frequency events:

```typescript
let throttleTimeout;

function onInputChange(value) {
  clearTimeout(throttleTimeout);
  throttleTimeout = setTimeout(() => {
    emit('search:updated', { query: value });
  }, 300); // Wait 300ms after last input
}
```

## Common Events by Extension Point

### Main Module

**Incoming** (FROM ChurchTools):
- `settings:changed` - Settings were updated
- `refresh:requested` - User requested refresh

**Outgoing** (TO ChurchTools):
- `notification:show` - Show notification to user
- `navigation:change` - Navigate to different route

### Admin Panel

**Incoming**:
- `settings:reload` - Reload settings from server

**Outgoing**:
- `settings:save` - Save settings
- `notification:show` - Show notification

### Calendar Dialog

**Incoming**:
- `appointment:changed` - Appointment data changed
- `dialog:closing` - Dialog is about to close

**Outgoing**:
- `appointment:update` - Update appointment data
- `time:suggest` - Suggest alternative time

## Debugging Events

### Log All Events

```typescript
const myEntry: EntryPoint = ({ on, emit }) => {
  // Log all incoming events
  on('*', (eventName, ...args) => {
    console.log(`📥 Received: ${eventName}`, args);
  });

  // Wrap emit to log outgoing events
  const originalEmit = emit;
  const loggingEmit = (eventName, ...args) => {
    console.log(`📤 Emitting: ${eventName}`, args);
    originalEmit(eventName, ...args);
  };

  // Use loggingEmit instead of emit
};
```

### Use Browser DevTools

1. Open **Console** tab
2. Filter by extension name or event pattern
3. Set breakpoints in event handlers
4. Inspect event data

## See Also

- [Entry Points Guide](entry-points.md) - Creating entry points
- [Core Concepts](core-concepts.md) - Extension architecture
- [API Reference](api-reference.md) - Complete API documentation
