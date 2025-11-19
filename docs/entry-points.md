# Entry Points Guide

Complete guide to creating and managing entry points in ChurchTools extensions.

## What is an Entry Point?

An entry point is a function that ChurchTools calls to render your extension at a specific location. Think of it as the "main()" function for each integration point.

```typescript
type EntryPoint<TData = any> = (context: ExtensionContext<TData>) => void | (() => void);
```

## Entry Point Context

Every entry point receives a context object with these properties:

```typescript
interface ExtensionContext<TData> {
  // Core utilities
  churchtoolsClient: Client;      // Pre-configured API client
  user: Person;                   // Currently logged-in user
  element: HTMLElement;           // DOM element to render into
  KEY?: string;                   // Your extension's key

  // Extension point data
  data: TData;                    // Extension-point-specific data

  // Event communication
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, ...args: any[]) => void;
}
```

## Creating Entry Points

### Basic Entry Point

```typescript
// src/entry-points/welcome.ts
import type { EntryPoint } from '../lib/main';

const welcomeEntryPoint: EntryPoint = ({ element, user }) => {
  element.innerHTML = `
    <div>
      <h1>Welcome, ${user.firstName}!</h1>
    </div>
  `;
};

export default welcomeEntryPoint;
```

### Type-Safe Entry Point

Use extension point contracts for type safety:

```typescript
// src/entry-points/main.ts
import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points';

const mainEntryPoint: EntryPoint<MainModuleData> = ({ data, element }) => {
  // data is fully typed!
  element.innerHTML = `<h1>User ID: ${data.userId}</h1>`;
};

export default mainEntryPoint;
```

### Entry Point with API Calls

```typescript
// src/entry-points/persons-list.ts
import type { EntryPoint } from '../lib/main';

const personsListEntry: EntryPoint = async ({ element, churchtoolsClient, emit }) => {
  element.innerHTML = '<p>Loading...</p>';

  try {
    const response = await churchtoolsClient.get('/api/persons');
    const persons = response.data || [];

    element.innerHTML = `
      <div>
        <h2>Persons (${persons.length})</h2>
        <ul>
          ${persons.map(p => `<li>${p.firstName} ${p.lastName}</li>`).join('')}
        </ul>
      </div>
    `;

    emit('persons:loaded', { count: persons.length });
  } catch (error) {
    element.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    emit('persons:error', { error: error.message });
  }
};

export default personsListEntry;
```

### Entry Point with Event Communication

```typescript
// src/entry-points/calendar-availability.ts
import type { EntryPoint } from '../lib/main';
import type { AppointmentDialogTabData } from '@churchtools/extension-points';

const calendarAvailability: EntryPoint<AppointmentDialogTabData> = ({
  data,
  element,
  on,
  emit,
  churchtoolsClient
}) => {
  let currentAppointment = data.currentAppointment;

  function render() {
    element.innerHTML = `
      <div>
        <h3>Availability Check</h3>
        <div id="status">Checking...</div>
        <button id="suggest-btn">Suggest Better Time</button>
      </div>
    `;

    checkAvailability();

    document.getElementById('suggest-btn').onclick = () => {
      emit('time:suggest', {
        time: '14:00',
        reason: 'Better availability for all participants'
      });
    };
  }

  async function checkAvailability() {
    const result = await churchtoolsClient.post('/api/check-availability', {
      appointment: currentAppointment
    });

    document.getElementById('status').textContent = result.available
      ? '✓ All participants available'
      : '⚠ Conflicts detected';

    emit('availability:checked', result);
  }

  // Listen to events from ChurchTools
  on('appointment:changed', (newData) => {
    currentAppointment = newData;
    render();
  });

  on('dialog:closing', () => {
    console.log('Dialog closing, saving state...');
  });

  // Initial render
  render();

  // Cleanup
  return () => {
    console.log('Cleaning up availability checker');
  };
};

export default calendarAvailability;
```

### Entry Point with React

```typescript
// src/entry-points/react-dashboard.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points';

const Dashboard = ({ user, churchtoolsClient }) => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    churchtoolsClient.get('/api/dashboard').then(setData);
  }, []);

  return (
    <div>
      <h1>Hello, {user.firstName}!</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

const reactDashboardEntry: EntryPoint<MainModuleData> = ({ element, user, churchtoolsClient }) => {
  const root = ReactDOM.createRoot(element);
  root.render(<Dashboard user={user} churchtoolsClient={churchtoolsClient} />);

  return () => {
    root.unmount();
  };
};

export default reactDashboardEntry;
```

## Registering Entry Points

After creating an entry point, register it in `src/entry-points/index.ts`:

```typescript
export const entryPointRegistry = {
  main: () => import('./main'),
  admin: () => import('./admin'),
  welcome: () => import('./welcome'),
  personsList: () => import('./persons-list'),
  calendarAvailability: () => import('./calendar-availability'),
  reactDashboard: () => import('./react-dashboard'),
};
```

**Important**: The key in the registry must match the `entryPoint` value in your `manifest.json`.

## Entry Point Patterns

### Loading States

Always show loading state for async operations:

```typescript
const myEntry: EntryPoint = async ({ element, churchtoolsClient }) => {
  element.innerHTML = '<div id="root">Loading...</div>';

  try {
    const data = await churchtoolsClient.get('/api/data');
    document.getElementById('root').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (error) {
    document.getElementById('root').innerHTML = `<p>Error: ${error.message}</p>`;
  }
};
```

### Error Handling

Handle errors gracefully:

```typescript
const myEntry: EntryPoint = async ({ element, churchtoolsClient, emit }) => {
  try {
    const data = await churchtoolsClient.get('/api/data');
    renderData(data);
    emit('data:loaded', { success: true });
  } catch (error) {
    console.error('Load error:', error);
    element.innerHTML = `
      <div style="padding: 2rem; color: red;">
        <h3>Error Loading Data</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
    emit('data:error', { error: error.message });
  }
};
```

### Cleanup

Always return a cleanup function:

```typescript
const myEntry: EntryPoint = ({ on, emit }) => {
  // Set up polling
  const pollInterval = setInterval(() => {
    emit('poll:tick');
  }, 5000);

  // Set up event listeners
  const handler = (data) => console.log('Data updated:', data);
  on('data:updated', handler);

  // Cleanup function
  return () => {
    clearInterval(pollInterval);
    off('data:updated', handler);
    console.log('Cleaned up successfully');
  };
};
```

### Separation of Concerns

Break complex entry points into smaller functions:

```typescript
const myEntry: EntryPoint = ({ element, churchtoolsClient, on, emit }) => {
  let state = { data: null, loading: false };

  function render() {
    element.innerHTML = `
      <div id="app">
        ${state.loading ? renderLoading() : renderContent()}
      </div>
    `;
    attachEventListeners();
  }

  function renderLoading() {
    return '<p>Loading...</p>';
  }

  function renderContent() {
    return state.data
      ? `<pre>${JSON.stringify(state.data, null, 2)}</pre>`
      : '<p>No data</p>';
  }

  function attachEventListeners() {
    const btn = document.getElementById('refresh-btn');
    if (btn) btn.onclick = loadData;
  }

  async function loadData() {
    state.loading = true;
    render();

    try {
      const response = await churchtoolsClient.get('/api/data');
      state.data = response;
      state.loading = false;
      render();
      emit('data:loaded');
    } catch (error) {
      state.loading = false;
      render();
      emit('data:error', { error: error.message });
    }
  }

  // Initial render and load
  render();
  loadData();

  // Cleanup
  return () => {
    console.log('Cleanup');
  };
};
```

## Testing Entry Points

### Using the Development Server

1. Start the dev server: `npm run dev`
2. Select your extension point from the menu
3. Modify context data in the left panel
4. Click "Reload Entry Point" to test with new data
5. Use the Event Bus to send events to your entry point
6. Monitor the Event Log for emitted events

### Manual Testing Checklist

- [ ] Entry point renders without errors
- [ ] Loading states are shown correctly
- [ ] Data loads and displays properly
- [ ] Error states are handled gracefully
- [ ] Events are emitted correctly
- [ ] Event listeners work as expected
- [ ] Cleanup function runs without errors
- [ ] No console errors or warnings
- [ ] Works at different window sizes
- [ ] API calls have proper error handling

## Best Practices

### 1. Keep Entry Points Focused

Each entry point should do one thing well:

✅ **Good**: Separate entry points for different features
```typescript
entryPointRegistry = {
  personsList: () => import('./persons-list'),
  personsDetails: () => import('./persons-details'),
  personsSearch: () => import('./persons-search'),
};
```

❌ **Bad**: One entry point doing everything
```typescript
entryPointRegistry = {
  persons: () => import('./persons-everything'),  // Too big!
};
```

### 2. Use TypeScript

Always type your entry points:

✅ **Good**:
```typescript
const myEntry: EntryPoint<MainModuleData> = ({ data }) => {
  console.log(data.userId); // ✓ Type-safe
};
```

❌ **Bad**:
```typescript
const myEntry = ({ data }) => {
  console.log(data.userId); // ✗ No type checking
};
```

### 3. Handle All States

Show appropriate UI for all states:

- **Loading**: Show spinner or skeleton
- **Success**: Show data
- **Error**: Show error message with retry option
- **Empty**: Show empty state message

### 4. Clean Up Resources

Always return a cleanup function:

```typescript
return () => {
  // Clear timers
  clearInterval(timerId);
  clearTimeout(timeoutId);

  // Remove event listeners
  off('event', handler);

  // Cancel requests (if using AbortController)
  abortController.abort();

  // Unmount frameworks (React, Vue, etc.)
  root.unmount();
};
```

### 5. Document Your Entry Points

Add comments explaining what each entry point does:

```typescript
/**
 * Persons List Entry Point
 *
 * Displays a paginated list of persons from ChurchTools.
 * Features:
 * - Search/filter
 * - Pagination
 * - Export to CSV
 *
 * Events emitted:
 * - persons:loaded - When persons are loaded successfully
 * - persons:error - When loading fails
 * - person:selected - When user clicks on a person
 */
const personsListEntry: EntryPoint = ({ element, churchtoolsClient }) => {
  // Implementation
};
```

## See Also

- [Core Concepts](core-concepts.md) - Understanding extension architecture
- [Communication](communication.md) - Event-based communication
- [API Reference](api-reference.md) - Complete API documentation
- [Getting Started](getting-started.md) - Tutorial for beginners
