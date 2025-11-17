# Core Concepts

This guide explains the fundamental concepts behind ChurchTools extensions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      ChurchTools UI                          │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ Extension Point │  │ Extension Point │  │Extension Point│ │
│  │   (main)       │  │   (admin)      │  │  (calendar)  │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
│           │                    │                   │         │
│           ▼                    ▼                   ▼         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           Extension Loader & Event Bus                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
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

ChurchTools provides several extension points:

#### `main` - Main Module
- **Location**: ChurchTools main menu → Your extension module
- **Purpose**: Standalone module with its own navigation
- **Best for**: Full-featured extensions, dashboards, custom workflows

#### `admin` - Admin Configuration
- **Location**: Admin → Extensions → Your Extension Settings
- **Purpose**: Configuration interface for your extension
- **Best for**: Extension settings, API key configuration

#### `appointment-dialog-tab` - Calendar Dialog Tab
- **Location**: Calendar appointment edit dialog, as a new tab
- **Purpose**: Display custom appointment information
- **Best for**: Availability checking, resource booking, integrations

#### `appointment-dialog-detail` - Calendar Dialog Detail
- **Location**: Calendar appointment edit dialog, below standard fields
- **Purpose**: Add fields or information to the appointment form
- **Best for**: Custom fields, external data, validation

#### `finance-tab` - Finance Module Tab
- **Location**: Finance module, as a new tab
- **Purpose**: Display custom financial information or reports
- **Best for**: Custom reports, external accounting integrations

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

### Event Best Practices

1. **Use descriptive names**: `data:loaded` not `loaded`
2. **Follow naming conventions**: `noun:verb` pattern
3. **Document events**: List all events your extension emits
4. **Clean up listeners**: Use `off()` in cleanup function
5. **Handle errors**: Emit error events when things fail

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

**Next Steps**:

- [Entry Points Guide](entry-points.md) - Learn how to create entry points
- [Communication](communication.md) - Master event communication
- [Build & Deploy](build-and-deploy.md) - Build and deploy your extension
- [API Reference](api-reference.md) - Complete API documentation
