# Core Concepts

This guide explains the fundamental concepts behind ChurchTools extensions.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      ChurchTools UI                          │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ Extension Point │  │ Extension Point │  │Extension Point│ │
│  │   (main)        │  │   (admin)       │  │  (calendar)   │ │
│  └────────┬────────┘  └────────┬────────┘  └───────┬───────┘ │
│           │                    │                   │         │
│           ▼                    ▼                   ▼         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │           Extension Loader & Event Bus                   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
                             │
                             │ loads
                             ▼
                  ┌────────────────────┐
                  │  Your Extension    │
                  │  extension.es.js   │
                  └────────┬───────────┘
                           │
                           │ renders
                           ▼
                  ┌────────────────────┐
                  │  Entry Points      │
                  │  - main.ts         │
                  │  - admin.ts        │
                  │  - calendar.ts     │
                  └────────────────────┘
```

## Extension Points

**Extension points** are specific locations in the ChurchTools UI where extensions can inject content.

### What is an Extension Point?

An extension point is defined by ChurchTools and provides:

1. **A location** in the UI (e.g., main menu, calendar dialog, person sidebar)
2. **A contract** defining what data is provided and what events are available
3. **A unique ID** to identify the extension point

### Available Extension Points

ChurchTools provides official documentation for all available extension points. The documuentation is located here:
- **[ChurchTools Extension Points](https://github.com/churchtools/churchtools-extension-points)** - Extension point contracts (type definitions and events)

### Extension Point Contracts

Each extension point has a **contract** that defines:

```typescript
type ExtensionPointContract = {
  data: DataType;      // What data ChurchTools provides
  events: EventsType;  // What events your extension can listen to
  emits: EmitsType;    // What events your extension can emit
};
```

**Example: Calendar Dialog Tab Contract**

```typescript
// Data ChurchTools provides
interface AppointmentDialogTabData {
  currentAppointment: object;
  masterData: object;
}

// Events FROM ChurchTools (listen with `on()`)
interface AppointmentDialogTabEvents {
  'appointment:changed': (data: object) => void;
  'dialog:closing': () => void;
}

// Events TO ChurchTools (emit with `emit()`)
interface AppointmentDialogTabEmits {
  'appointment:update': (data: object) => void;
}
```

Contracts ensure type safety and clear communication between ChurchTools and your extension.

## Entry Points

**Entry points** are functions in your extension that render content for specific extension points.

### What is an Entry Point?

An entry point is a JavaScript function that:

1. **Receives context** from ChurchTools (data, element, API client, etc.)
2. **Renders UI** into the provided element
3. **Handles events** from ChurchTools
4. **Emits events** back to ChurchTools
5. **Returns cleanup** function for resource disposal

### Entry Point Signature

```typescript
type EntryPoint<TData = any> = (context: ExtensionContext<TData>) => void | (() => void);

interface ExtensionContext<TData> {
  // Core utilities
  churchtoolsClient: Client;  // API client
  user: Person;               // Current user
  element: HTMLElement;       // Where to render
  KEY?: string;               // Extension key

  // Extension point data
  data: TData;                // Extension-point-specific data

  // Event communication
  on: (event: string, handler: Function) => void;   // Listen to events
  off: (event: string, handler: Function) => void;  // Remove listener
  emit: (event: string, ...args: any[]) => void;    // Emit events
}
```

### Simple Entry Point Example

```typescript
const simpleEntry: EntryPoint = ({ element, user }) => {
  element.innerHTML = `<h1>Hello, ${user.firstName}!</h1>`;
};
```

### Complex Entry Point Example

```typescript
const complexEntry: EntryPoint<MainModuleData> = ({
  data,
  element,
  churchtoolsClient,
  user,
  on,
  emit,
}) => {
  // 1. Render UI
  function render() {
    element.innerHTML = `
      <div>
        <h1>Dashboard</h1>
        <button id="refresh-btn">Refresh</button>
        <div id="content"></div>
      </div>
    `;

    document.getElementById('refresh-btn').onclick = loadData;
  }

  // 2. Load data
  async function loadData() {
    try {
      const response = await churchtoolsClient.get('/api/some-endpoint');
      document.getElementById('content').innerHTML = JSON.stringify(response);
      emit('data:loaded', { success: true });
    } catch (error) {
      emit('data:error', { error: error.message });
    }
  }

  // 3. Listen to events
  on('refresh:requested', loadData);

  // 4. Initial render
  render();
  loadData();

  // 5. Return cleanup
  return () => {
    console.log('Cleanup');
  };
};
```

### Registering Entry Points

Entry points must be registered in `src/entry-points/index.ts`:

```typescript
export const entryPointRegistry = {
  main: () => import('./main'),
  admin: () => import('./admin'),
  myFeature: () => import('./my-feature'),
};
```

The registry uses **lazy loading** - entry points are loaded only when needed.

## Event Communication

Extensions communicate with ChurchTools through **events**.

### Event Flow

```
ChurchTools                  Extension
    │                           │
    │─────── on('event') ───────▶ Extension listens
    │                           │
    │                           │ User interacts
    │                           │
    │◀───── emit('event') ──────│ Extension emits
    │                           │
    │  Handles event            │
```

### Listening to Events (FROM ChurchTools)

```typescript
const myEntry: EntryPoint = ({ on }) => {
  // Listen to a specific event
  on('data:updated', (newData) => {
    console.log('Received update:', newData);
  });

  // Listen to dialog closing
  on('dialog:closing', () => {
    console.log('Dialog is closing');
  });
};
```

### Emitting Events (TO ChurchTools)

```typescript
const myEntry: EntryPoint = ({ emit }) => {
  // Emit event to ChurchTools
  emit('notification:show', {
    message: 'Hello!',
    type: 'success'
  });

  // Emit data update
  emit('data:update', {
    id: 123,
    name: 'New Name'
  });
};
```

## Extension Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ 1. ChurchTools loads extension.es.js                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. ChurchTools calls loadEntryPoint('main')             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Extension loads entry point module dynamically       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. ChurchTools calls renderExtension(div, entry, data)  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Entry point renders UI and sets up event listeners   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Extension runs (user interacts, events flow)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. ChurchTools calls instance.destroy()                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Cleanup function runs, removes listeners             │
└─────────────────────────────────────────────────────────┘
```

### Initialization

```typescript
const myEntry: EntryPoint = ({ element, churchtoolsClient }) => {
  // Initialize state
  let data = null;

  // Render UI
  element.innerHTML = '<div id="app">Loading...</div>';

  // Load initial data
  churchtoolsClient.get('/api/data').then(response => {
    data = response;
    renderData();
  });

  function renderData() {
    document.getElementById('app').innerHTML = JSON.stringify(data);
  }
};
```

### Running

The extension runs, handling user interactions and events:

```typescript
const myEntry: EntryPoint = ({ element, on, emit }) => {
  element.innerHTML = `<button id="btn">Click Me</button>`;

  // Handle user interaction
  document.getElementById('btn').onclick = () => {
    emit('button:clicked');
  };

  // Handle ChurchTools events
  on('data:changed', (newData) => {
    // Re-render with new data
  });
};
```

### Cleanup

Return a function to clean up resources:

```typescript
const myEntry: EntryPoint = ({ on }) => {
  const timerId = setInterval(() => {
    console.log('Polling...');
  }, 5000);

  const handler = (data) => console.log(data);
  on('data:changed', handler);

  // Cleanup function
  return () => {
    clearInterval(timerId);      // Stop timer
    off('data:changed', handler); // Remove listener
    console.log('Cleaned up!');
  };
};
```

**Always return a cleanup function** to prevent memory leaks!

## Type Safety

ChurchTools extensions are fully type-safe with TypeScript.

### Extension Point Contracts

Extension point contracts are provided by `@churchtools/extension-points`:

```typescript
import type {
  MainModuleData,
  AdminData,
  AppointmentDialogTabData,
} from '@churchtools/extension-points';
```

### Typed Entry Points

Use the contract types for type safety:

```typescript
import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points';

const mainEntry: EntryPoint<MainModuleData> = ({ data }) => {
  // data is fully typed!
  console.log(data.userId);  // ✓ Type-safe
};
```

### Custom Types

Define your own types for complex data:

```typescript
interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

const personEntry: EntryPoint = async ({ churchtoolsClient, element }) => {
  const persons: Person[] = await churchtoolsClient.get('/api/persons');

  element.innerHTML = persons
    .map(p => `<div>${p.firstName} ${p.lastName}</div>`)
    .join('');
};
```

## Build Modes

The boilerplate supports two build modes:

### Simple Mode (Default)

**What**: Single bundle with all entry points included

**When to use**:
- Small extensions (< 100KB)
- Few entry points (< 10)
- All features are commonly used

**Pros**:
- Simple setup
- Single file to deploy
- Great caching
- No async loading

**Cons**:
- Loads all code upfront
- Not optimal for large extensions

### Advanced Mode

**What**: Code splitting with lazy-loaded entry points

**When to use**:
- Large extensions (> 100KB)
- Many entry points (> 10)
- Different pages use different features

**Pros**:
- Only loads what's needed
- Better performance for large extensions
- Optimal for diverse features

**Cons**:
- Multiple files
- Async loading required
- Slightly more complex

See [Build & Deploy](build-and-deploy.md) for detailed comparison.

## Extension Manifest

The `manifest.json` file describes your extension to ChurchTools.

### Key Fields

```json
{
  "name": "My Extension",
  "key": "my-extension",          // Unique identifier
  "version": "1.0.0",              // Semantic version
  "description": "What it does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "extensionPoints": [
    {
      "id": "main",                // ChurchTools extension point ID
      "entryPoint": "main",        // Your entry point name
      "title": "My Extension",
      "description": "Main module"
    }
  ]
}
```

### Extension Points Mapping

```
manifest.json                    src/entry-points/index.ts
─────────────────────────────    ─────────────────────────────
extensionPoints: [
  {
    "id": "main",                 entryPointRegistry = {
    "entryPoint": "main"            main: () => import('./main'),
  },                              };
]
```

The `id` identifies the ChurchTools extension point, and `entryPoint` names your entry point function.

See [Manifest Reference](manifest.md) for complete documentation.

## ChurchTools API Client

The `churchtoolsClient` provides access to the ChurchTools API.

### Basic Usage

```typescript
const myEntry: EntryPoint = async ({ churchtoolsClient }) => {
  // GET
  const persons = await churchtoolsClient.get('/api/persons');

  // POST
  const newPerson = await churchtoolsClient.post('/api/persons', {
    firstName: 'John',
    lastName: 'Doe'
  });

  // PUT
  await churchtoolsClient.put('/api/persons/123', {
    firstName: 'Jane'
  });

  // DELETE
  await churchtoolsClient.delete('/api/persons/123');
};
```

### Error Handling

Always wrap API calls in try-catch:

```typescript
try {
  const data = await churchtoolsClient.get('/api/persons');
  // Success
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

See [API Reference](api-reference.md) for complete documentation.

## Key-Value Store

Extensions can persist data using the ChurchTools key-value store. This is useful for storing settings, user preferences, cached data, and application state.

### Storage Hierarchy

```
Extension Module (identified by extension key)
└── Data Categories (organize related data)
    └── Data Values (actual key-value pairs)
```

### Basic Usage

The boilerplate includes utilities in `src/utils/kv-store.ts`:

```typescript
import {
  getOrCreateModule,
  getCustomDataCategory,
  createCustomDataCategory,
  getCustomDataValues,
  createCustomDataValue,
  updateCustomDataValue,
} from '../utils/kv-store';

// Get or create module (development mode)
const module = await getOrCreateModule(
  KEY,
  'My Extension',
  'Extension description'
);

// Get or create a category
let category = await getCustomDataCategory<object>('settings');
if (!category) {
  await createCustomDataCategory({
    customModuleId: module.id,
    name: 'Settings',
    shorty: 'settings',
    description: 'User preferences',
  }, module.id);
  category = await getCustomDataCategory<object>('settings');
}

// Load values with type safety
interface Setting {
  key: string;
  value: string;
}

const values = await getCustomDataValues<Setting>(category.id, module.id);
const theme = values.find(v => v.key === 'theme');

// Save value
if (theme) {
  await updateCustomDataValue(category.id, theme.id, {
    value: JSON.stringify({ key: 'theme', value: 'dark' }),
  }, module.id);
} else {
  await createCustomDataValue({
    dataCategoryId: category.id,
    value: JSON.stringify({ key: 'theme', value: 'dark' }),
  }, module.id);
}
```

### Type-Safe Storage

Use TypeScript generics for type-safe data access:

```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const prefs = await getCustomDataValues<UserPreferences>(categoryId, moduleId);
```

### Common Use Cases

- **Settings Storage**: Save user preferences and configuration
- **Cache**: Store cached API responses
- **State Management**: Persist application state
- **User Data**: Store user-specific information

See [Key-Value Store Guide](key-value-store.md) for complete documentation with patterns and best practices.

## Multi-Extension Support

Multiple extensions can run simultaneously without conflicts.

### How It Works

1. Each extension has a unique `key`
2. Extensions are isolated in their own scope
3. Each extension gets its own event bus
4. UMD builds use namespaced globals: `ChurchToolsExtension_{KEY}`

### Best Practices

- Use unique, descriptive keys
- Don't access global variables from other extensions
- Use ChurchTools APIs for inter-extension communication
- Test with other extensions present

## Summary

**Key Concepts**:

1. **Extension Points** - Locations in ChurchTools UI where extensions integrate
2. **Entry Points** - Functions that render content for extension points
3. **Contracts** - Type-safe definitions of data and events
4. **Events** - Bidirectional communication between ChurchTools and extensions
5. **Lifecycle** - Load → Render → Run → Cleanup
6. **Type Safety** - Full TypeScript support for contracts and APIs
7. **Key-Value Store** - Persistent storage for settings and data

**Next Steps**:

- [Entry Points Guide](entry-points.md) - Learn how to create entry points
- [Communication](communication.md) - Master event communication
- [Key-Value Store Guide](key-value-store.md) - Persist data in ChurchTools
- [Build & Deploy](build-and-deploy.md) - Build and deploy your extension
- [API Reference](api-reference.md) - Complete API documentation
