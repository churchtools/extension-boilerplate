# API Reference

Complete API documentation for ChurchTools extensions.

## Core Types

### `EntryPoint<TData>`

Main function type for entry points.

```typescript
type EntryPoint<TData = any> = (
  context: ExtensionContext<TData>
) => void | (() => void);
```

**Parameters**:
- `context`: Extension context with utilities and data

**Returns**:
- `void` or cleanup function `() => void`

**Example**:
```typescript
const myEntry: EntryPoint<MainModuleData> = ({ element, data }) => {
  element.innerHTML = '<h1>Hello!</h1>';

  return () => {
    console.log('Cleanup');
  };
};
```

### `ExtensionContext<TData>`

Context object passed to every entry point.

```typescript
interface ExtensionContext<TData> {
  churchtoolsClient: Client;
  user: Person;
  element: HTMLElement;
  KEY?: string;
  data: TData;
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, ...args: any[]) => void;
}
```

#### Properties

##### `churchtoolsClient: Client`

Pre-configured ChurchTools API client.

**Example**:
```typescript
const data = await churchtoolsClient.get('/api/persons');
```

##### `user: Person`

Currently logged-in user object.

**Properties**:
```typescript
interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  // ... more properties
}
```

**Example**:
```typescript
console.log(`Hello, ${user.firstName} ${user.lastName}!`);
```

##### `element: HTMLElement`

DOM element where your extension should render.

**Example**:
```typescript
element.innerHTML = '<div>Hello!</div>';
```

##### `KEY?: string`

Your extension's unique key from `.env`.

**Example**:
```typescript
console.log(`Extension key: ${KEY}`);
```

##### `data: TData`

Extension-point-specific data from ChurchTools.

**Type depends on extension point**:
- `MainModuleData` for main module
- `AdminData` for admin panel
- `AppointmentDialogTabData` for calendar dialog

**Example**:
```typescript
const entry: EntryPoint<MainModuleData> = ({ data }) => {
  console.log(data.userId);
};
```

#### Methods

##### `on(event: string, handler: Function): void`

Listen to events FROM ChurchTools.

**Parameters**:
- `event`: Event name (e.g., `'data:updated'`)
- `handler`: Callback function

**Example**:
```typescript
on('data:updated', (newData) => {
  console.log('New data:', newData);
});
```

##### `off(event: string, handler: Function): void`

Remove event listener.

**Parameters**:
- `event`: Event name
- `handler`: The same callback function passed to `on()`

**Example**:
```typescript
const handler = (data) => console.log(data);
on('data:updated', handler);

// Later, remove listener
off('data:updated', handler);
```

##### `emit(event: string, ...args: any[]): void`

Emit events TO ChurchTools.

**Parameters**:
- `event`: Event name
- `...args`: Any data to send

**Example**:
```typescript
emit('notification:show', {
  message: 'Saved successfully!',
  type: 'success'
});
```

## ChurchTools API Client

The `churchtoolsClient` provides methods to interact with the ChurchTools API.

### Methods

#### `get(url: string, config?: object): Promise<any>`

Perform GET request.

**Parameters**:
- `url`: API endpoint (e.g., `/api/persons`)
- `config`: Optional axios config

**Returns**: Promise with response data

**Example**:
```typescript
const persons = await churchtoolsClient.get('/api/persons');
console.log(persons.data);
```

#### `post(url: string, data?: any, config?: object): Promise<any>`

Perform POST request.

**Parameters**:
- `url`: API endpoint
- `data`: Request body
- `config`: Optional axios config

**Returns**: Promise with response data

**Example**:
```typescript
const newPerson = await churchtoolsClient.post('/api/persons', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});
```

#### `put(url: string, data?: any, config?: object): Promise<any>`

Perform PUT request.

**Parameters**:
- `url`: API endpoint
- `data`: Request body
- `config`: Optional axios config

**Returns**: Promise with response data

**Example**:
```typescript
await churchtoolsClient.put('/api/persons/123', {
  firstName: 'Jane'
});
```

#### `patch(url: string, data?: any, config?: object): Promise<any>`

Perform PATCH request.

**Parameters**:
- `url`: API endpoint
- `data`: Request body
- `config`: Optional axios config

**Returns**: Promise with response data

**Example**:
```typescript
await churchtoolsClient.patch('/api/persons/123', {
  email: 'newemail@example.com'
});
```

#### `delete(url: string, config?: object): Promise<any>`

Perform DELETE request.

**Parameters**:
- `url`: API endpoint
- `config`: Optional axios config

**Returns**: Promise with response data

**Example**:
```typescript
await churchtoolsClient.delete('/api/persons/123');
```

### Error Handling

Always wrap API calls in try-catch:

```typescript
try {
  const data = await churchtoolsClient.get('/api/persons');
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  if (error.response) {
    // Server responded with error
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response received');
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## Extension Point Contracts

Extension point contracts are TypeScript interfaces defining the data and events for each extension point.

### Available Contracts

Import from `@churchtools/extension-points`:

```typescript
import type {
  MainModuleData,
  MainModuleEvents,
  MainModuleEmits,
  AdminData,
  AdminEvents,
  AdminEmits,
  AppointmentDialogTabData,
  AppointmentDialogTabEvents,
  AppointmentDialogTabEmits,
  AppointmentDialogDetailData,
  AppointmentDialogDetailEvents,
  AppointmentDialogDetailEmits,
  FinanceTabData,
  FinanceTabEvents,
  FinanceTabEmits,
} from '@churchtools/extension-points';
```

### Main Module Contract

```typescript
interface MainModuleData {
  // No specific data (empty interface)
}

interface MainModuleEvents {
  // No incoming events defined
}

interface MainModuleEmits {
  'notification:show': (data: {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  }) => void;
}
```

**Usage**:
```typescript
const mainEntry: EntryPoint<MainModuleData> = ({ data, emit }) => {
  emit('notification:show', {
    message: 'Welcome!',
    type: 'success',
    duration: 3000
  });
};
```

### Admin Contract

```typescript
interface AdminData {
  extensionInfo: {
    name: string;
    version: string;
    key: string;
    description?: string;
    author?: {
      name: string;
      email?: string;
    };
  };
}

interface AdminEvents {
  // No incoming events defined
}

interface AdminEmits {
  'notification:show': (data: {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  }) => void;
}
```

**Usage**:
```typescript
const adminEntry: EntryPoint<AdminData> = ({ data }) => {
  console.log(`Configuring: ${data.extensionInfo.name}`);
};
```

### Calendar Dialog Tab Contract

```typescript
interface AppointmentDialogTabData {
  currentAppointment: object;
  masterData: object;
}

interface AppointmentDialogTabEvents {
  'appointment:changed': (data: object) => void;
  'dialog:closing': () => void;
}

interface AppointmentDialogTabEmits {
  'appointment:update': (data: object) => void;
}
```

**Usage**:
```typescript
const calendarEntry: EntryPoint<AppointmentDialogTabData> = ({
  data,
  on,
  emit
}) => {
  console.log('Current appointment:', data.currentAppointment);

  on('appointment:changed', (newData) => {
    console.log('Appointment changed:', newData);
  });

  on('dialog:closing', () => {
    console.log('Saving...');
  });

  emit('appointment:update', {
    title: 'Updated Title'
  });
};
```

## Functions

### `renderExtension<TData>(divId: string, entryPoint: EntryPoint<TData>, data?: TData): Promise<ExtensionInstance>`

Renders an extension to a specified DIV element.

**Parameters**:
- `divId`: ID of the div element
- `entryPoint`: Entry point function to render
- `data`: Optional initial data to pass

**Returns**: Promise resolving to `ExtensionInstance`

**Example**:
```typescript
import { renderExtension, loadEntryPoint } from './extension.es.js';

const entryPoint = await loadEntryPoint('main');
const instance = await renderExtension('app', entryPoint, {
  userId: 123
});
```

### `loadEntryPoint(name: string): Promise<EntryPoint>`

Loads an entry point by name (advanced mode).

**Parameters**:
- `name`: Entry point name from registry

**Returns**: Promise resolving to entry point function

**Example**:
```typescript
const mainEntry = await loadEntryPoint('main');
const adminEntry = await loadEntryPoint('admin');
```

### `getAvailableEntryPoints(): string[]`

Returns list of registered entry point names.

**Returns**: Array of entry point names

**Example**:
```typescript
const entryPoints = getAvailableEntryPoints();
console.log(entryPoints); // ['main', 'admin', 'calendar']
```

### `hasEntryPoint(name: string): boolean`

Checks if an entry point is registered.

**Parameters**:
- `name`: Entry point name

**Returns**: `true` if entry point exists

**Example**:
```typescript
if (hasEntryPoint('premium')) {
  const entry = await loadEntryPoint('premium');
} else {
  const entry = await loadEntryPoint('basic');
}
```

## Extension Instance

The `ExtensionInstance` returned by `renderExtension()` allows ChurchTools to communicate with your extension.

```typescript
interface ExtensionInstance {
  emit(event: string, ...args: any[]): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  destroy(): Promise<void>;
}
```

### Methods

#### `emit(event: string, ...args: any[]): void`

Send event TO your extension.

**Example** (ChurchTools side):
```typescript
const instance = await renderExtension('app', entryPoint);

// Send event to extension
instance.emit('data:updated', { newData: {...} });
```

#### `on(event: string, handler: Function): void`

Listen to events FROM your extension.

**Example** (ChurchTools side):
```typescript
instance.on('notification:show', (data) => {
  showNotification(data.message, data.type);
});
```

#### `off(event: string, handler: Function): void`

Remove event listener.

**Example** (ChurchTools side):
```typescript
const handler = (data) => console.log(data);
instance.on('data:loaded', handler);

// Later
instance.off('data:loaded', handler);
```

#### `destroy(): Promise<void>`

Cleanup and destroy the extension instance.

**Example** (ChurchTools side):
```typescript
// When closing dialog or navigating away
await instance.destroy();
```

## Entry Point Registry

The entry point registry maps names to entry point modules.

### Registration

In `src/entry-points/index.ts`:

```typescript
export const entryPointRegistry = {
  main: () => import('./main'),
  admin: () => import('./admin'),
  myFeature: () => import('./my-feature'),
};
```

**Requirements**:
- Keys must match `entryPoint` values in `manifest.json`
- Values must be functions returning dynamic imports
- Exported modules must have a default export

## Environment Variables

Available in development mode via `import.meta.env`:

```typescript
const KEY = import.meta.env.VITE_KEY;
const MODE = import.meta.env.MODE; // 'development' or 'production'
const DEV = import.meta.env.DEV; // boolean
const PROD = import.meta.env.PROD; // boolean
```

## TypeScript Utilities

### Type Guards

```typescript
// Check if data is of specific type
function isMainModuleData(data: any): data is MainModuleData {
  return typeof data === 'object';
}
```

### Generic Entry Points

```typescript
// Reusable entry point for multiple extension points
function createListEntry<TData>(): EntryPoint<TData> {
  return ({ data, element }) => {
    element.innerHTML = `<div>${JSON.stringify(data)}</div>`;
  };
}

const personsEntry = createListEntry<PersonsData>();
const eventsEntry = createListEntry<EventsData>();
```

## See Also

- [Getting Started](getting-started.md) - Setup and first extension
- [Core Concepts](core-concepts.md) - Extension architecture
- [Entry Points Guide](entry-points.md) - Creating entry points
- [Communication](communication.md) - Event communication
- [Build & Deploy](build-and-deploy.md) - Building and deployment
