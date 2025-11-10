## Extension Communication Guide

This guide explains the event-based bidirectional communication system between ChurchTools and extensions.

## Overview

Extensions stay alive and communicate with ChurchTools through:
- **Initial Data** - ChurchTools provides context-specific data
- **Events FROM ChurchTools** - Extensions listen with `on()` to react to UI changes
- **Events TO ChurchTools** - Extensions emit with `emit()` to trigger actions
- **Cleanup** - Extensions return a cleanup function to prevent memory leaks

## Example: Calendar Dialog

Let's use a real-world example: an extension that shows user availability in a calendar event dialog.

### ChurchTools Side

```typescript
// 1. Define extension point data contract
interface CalendarDialogData {
  selectedDate: Date;
  selectedTime: string;
  duration: number;
}

// 2. Load the extension
const ext = await import('/extensions/availability/extension.es.js');
const entryPoint = await ext.loadEntryPoint('calendarAvailability');

// 3. Render extension with initial data
const instance = await ext.renderExtension('availability-container', entryPoint, {
  selectedDate: new Date('2025-11-15'),
  selectedTime: '14:00',
  duration: 60
});

// 4. Listen to events FROM extension
instance.on('time:suggest', ({ time, reason }) => {
  console.log(`Extension suggests: ${time} - ${reason}`);

  // Update dialog
  document.getElementById('time-input').value = time;
  showNotification(`Suggested time: ${time} (${reason})`);
});

instance.on('availability:status', ({ available, conflicts }) => {
  // Update UI indicators
  updateAvailabilityIndicator(available);
  if (conflicts?.length) {
    showConflicts(conflicts);
  }
});

// 5. Emit events TO extension when dialog changes
document.getElementById('date-input').addEventListener('change', (e) => {
  const newDate = new Date(e.target.value);
  instance.emit('date:changed', newDate);
});

document.getElementById('time-input').addEventListener('change', (e) => {
  instance.emit('time:changed', e.target.value);
});

// 6. Cleanup when dialog closes
document.getElementById('dialog').addEventListener('close', async () => {
  instance.emit('dialog:closing');
  await instance.destroy();
});
```

### Extension Side

```typescript
import type { EntryPoint } from '@churchtools/extension-boilerplate';

interface CalendarDialogData {
  selectedDate: Date;
  selectedTime: string;
  duration: number;
}

const calendarAvailability: EntryPoint<CalendarDialogData> = ({
  data,
  on,
  off,
  emit,
  element,
  churchtoolsClient
}) => {
  // 1. Use initial data
  console.log('Initial date:', data.selectedDate);
  console.log('Initial time:', data.selectedTime);

  // 2. Render UI
  function render(date: Date, time: string) {
    element.innerHTML = `
      <div class="availability">
        <h3>Availability for ${date.toLocaleDateString()} at ${time}</h3>
        <div id="status">Checking...</div>
        <button id="suggest-btn">Suggest Better Time</button>
      </div>
    `;

    // Check availability
    checkAvailability(date, time).then(result => {
      document.getElementById('status').textContent = result.available
        ? '✓ Available'
        : '⚠ Conflicts detected';

      // Notify ChurchTools
      emit('availability:status', result);
    });

    // Handle suggestion
    document.getElementById('suggest-btn').onclick = () => {
      emit('time:suggest', {
        time: '16:00',
        reason: 'Better availability'
      });
    };
  }

  // Initial render
  render(data.selectedDate, data.selectedTime);

  // 3. Listen to events FROM ChurchTools
  const dateHandler = (newDate: Date) => {
    render(newDate, data.selectedTime);
    data.selectedDate = newDate; // Update local reference
  };

  const timeHandler = (newTime: string) => {
    render(data.selectedDate, newTime);
    data.selectedTime = newTime;
  };

  on('date:changed', dateHandler);
  on('time:changed', timeHandler);

  // 4. Return cleanup function
  return () => {
    off('date:changed', dateHandler);
    off('time:changed', timeHandler);
    console.log('Extension cleaned up');
  };
};

export default calendarAvailability;
```

## API Reference

### ChurchTools API

#### `renderExtension(divId, entryPoint, data?)`

Renders an extension and returns an instance for communication.

```typescript
const instance = await renderExtension<TData>(
  'my-div',
  entryPoint,
  { /* initial data */ }
);
```

**Returns:** `ExtensionInstance`

#### `ExtensionInstance`

```typescript
interface ExtensionInstance {
  // Emit events TO extension
  emit(event: string, ...data: any[]): void;

  // Listen to events FROM extension
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;

  // Cleanup
  destroy(): Promise<void>;
}
```

### Extension API

#### `ExtensionContext<TData>`

```typescript
interface ExtensionContext<TData> {
  // Core utilities
  churchtoolsClient: Client;
  user: Person;
  element: HTMLElement;
  KEY?: string;

  // Extension point data
  data: TData;

  // Event communication
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, ...data: any[]): void;
}
```

#### `EntryPoint<TData>`

```typescript
type EntryPoint<TData> = (
  context: ExtensionContext<TData>
) => void | CleanupFunction;

type CleanupFunction = () => void | Promise<void>;
```

## Event Naming Convention

Use **namespaced events** with format `category:action`:

**Good:**
- `date:changed`
- `person:updated`
- `availability:status`
- `action:save`
- `dialog:closing`

**Avoid:**
- `dateChanged` (not namespaced)
- `update` (too generic)
- `onChange` (ambiguous)

## Extension Point Contracts

ChurchTools should document each extension point with a contract interface:

```typescript
/**
 * Extension Point: calendar-dialog-availability
 *
 * Location: Calendar event dialog
 * Purpose: Show availability and suggest times
 */

// Data structure
interface CalendarDialogData {
  selectedDate: Date;
  selectedTime: string;
  duration: number;
}

// Events FROM ChurchTools (extension listens)
interface CalendarDialogEvents {
  'date:changed': (date: Date) => void;
  'time:changed': (time: string) => void;
  'dialog:closing': () => void;
}

// Events TO ChurchTools (extension emits)
interface CalendarDialogEmits {
  'date:suggest': (data: { date: Date; reason: string }) => void;
  'time:suggest': (data: { time: string; reason: string }) => void;
  'availability:status': (data: { available: boolean }) => void;
}
```

See `src/extension-points/` for complete examples.

## Common Patterns

### Pattern 1: React to Data Changes

```typescript
const myEntry: EntryPoint<MyData> = ({ data, on, element }) => {
  function render(currentData: MyData) {
    element.innerHTML = `<div>${currentData.value}</div>`;
  }

  render(data);

  const handler = (newValue) => {
    data.value = newValue;
    render(data);
  };

  on('value:changed', handler);

  return () => off('value:changed', handler);
};
```

### Pattern 2: User Actions

```typescript
const myEntry: EntryPoint = ({ emit, element }) => {
  element.innerHTML = '<button id="save">Save</button>';

  document.getElementById('save').onclick = () => {
    emit('action:save', { /* data */ });
  };
};
```

### Pattern 3: Async Operations

```typescript
const myEntry: EntryPoint = async ({ data, emit, churchtoolsClient }) => {
  const result = await churchtoolsClient.get('/api/data');

  emit('data:loaded', result);
};
```

### Pattern 4: Cleanup Resources

```typescript
const myEntry: EntryPoint = ({ on, off }) => {
  const interval = setInterval(() => {
    console.log('Polling...');
  }, 5000);

  const handler = () => console.log('Event');
  on('some:event', handler);

  return () => {
    clearInterval(interval);
    off('some:event', handler);
  };
};
```

## Best Practices

### For ChurchTools

1. **✅ Define Clear Contracts** - Document data structure and events
2. **✅ Use Typed Data** - Provide types when possible, use `any` when flexible
3. **✅ Emit on Changes** - Notify extensions when dialog/page state changes
4. **✅ Call destroy()** - Cleanup when component unmounts
5. **✅ Handle Errors** - Wrap extension code in try-catch
6. **✅ Test Events** - Verify bidirectional communication works

### For Extension Developers

1. **✅ Return Cleanup** - Always return cleanup function if using events
2. **✅ Store Handlers** - Keep handler references for `off()` in cleanup
3. **✅ Update Local Data** - Sync `data` object with received updates
4. **✅ Use Namespaced Events** - Follow `category:action` convention
5. **✅ Document Events** - List events you listen to and emit
6. **✅ Handle Missing Data** - Check for optional/nullable fields

## Debugging

### ChurchTools Side

```typescript
// Log all events from extension
instance.on('*', (event, ...data) => {
  console.log(`[Extension Event] ${event}:`, data);
});

// Check if extension is listening
console.log('Extension loaded');
instance.emit('test:ping');
```

### Extension Side

```typescript
const myEntry: EntryPoint = ({ on, emit }) => {
  // Log all incoming events
  const logHandler = (...args) => console.log('[Received]', ...args);
  on('*', logHandler);

  // Test emit
  console.log('[Extension] Emitting test event');
  emit('test:pong');

  return () => off('*', logHandler);
};
```

## TypeScript Support

### Full Type Safety

```typescript
// Define contract
interface MyExtensionData {
  value: string;
  count: number;
}

// ChurchTools side (typed)
const instance = await renderExtension<MyExtensionData>(
  'my-div',
  entryPoint,
  {
    value: 'hello',
    count: 42
  }
);

// Extension side (typed)
const myEntry: EntryPoint<MyExtensionData> = ({ data }) => {
  // data.value is string
  // data.count is number
  console.log(data.value.toUpperCase());
};
```

### Flexible (Any)

```typescript
// For evolving/dynamic data structures
const instance = await renderExtension(
  'my-div',
  entryPoint,
  { /* any structure */ }
);

const myEntry: EntryPoint<any> = ({ data }) => {
  // data is any - flexible but untyped
};
```

## Migration from Old API

### Old (No Events)

```typescript
const myEntry: EntryPoint = ({ element, user }) => {
  element.innerHTML = `<p>Hello ${user.firstName}</p>`;
};

await renderExtension('my-div', myEntry);
```

### New (With Events)

```typescript
const myEntry: EntryPoint<MyData> = ({ data, on, emit, element }) => {
  element.innerHTML = `<p>Hello ${data.name}</p>`;

  on('name:changed', (name) => {
    element.innerHTML = `<p>Hello ${name}</p>`;
  });

  return () => off('name:changed');
};

const instance = await renderExtension('my-div', myEntry, { name: 'User' });
```

**Backward compatible!** Old entry points still work (data is optional).

## Examples

See complete examples in:
- `src/extension-points/calendar-dialog.ts` - Calendar availability contract
- `src/extension-points/person-details.ts` - Person sidebar contract
- `src/entry-points/calendar-availability.ts` - Full implementation

## Summary

**ChurchTools:**
1. Define extension point data contract
2. Call `renderExtension()` with data
3. Listen to events with `instance.on()`
4. Emit events with `instance.emit()`
5. Call `instance.destroy()` on cleanup

**Extensions:**
1. Receive initial `data` in context
2. Listen to events with `on()`
3. Emit events with `emit()`
4. Return cleanup function with `off()`
5. Update local `data` reference when events fire

**Result:** Extensions stay alive, react to changes, and communicate seamlessly!
