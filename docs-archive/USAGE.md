# ChurchTools Extension Boilerplate - Usage Guide

This boilerplate provides a flexible way to create ChurchTools extensions that can be rendered to any DIV element with custom entry points.

## Overview

The main function is `renderExtension(divId, entryPoint)` which allows you to render an extension to any DIV in ChurchTools.

The boilerplate supports two build modes:
- **Simple Mode** (default): Single bundle with all entry points
- **Advanced Mode**: Code splitting with lazy loading

See [BUILD_MODES.md](BUILD_MODES.md) for detailed comparison and guidance.

## Building the Extension

### Default Build (uses mode from .env)

```bash
npm run build
```

### Explicit Build Mode

```bash
# Build in simple mode (single bundle)
npm run build:simple

# Build in advanced mode (code splitting)
npm run build:advanced
```

**Output:**
- Simple mode: `dist/extension.es.js` and `dist/extension.umd.js`
- Advanced mode: Main bundle + separate chunks for each entry point

## Basic Usage

### Simple Mode (Static Imports)

When built in simple mode, all entry points are immediately available:

```javascript
import {
  renderExtension,
  welcomeEntryPoint,
  userInfoEntryPoint
} from './extension.es.js';

// Entry points are pre-loaded
await renderExtension('welcome-div', welcomeEntryPoint);
await renderExtension('user-div', userInfoEntryPoint);
```

### Advanced Mode (Dynamic Imports)

When built in advanced mode, use `loadEntryPoint` for lazy loading:

```javascript
import { renderExtension, loadEntryPoint } from './extension.es.js';

// Load entry point on demand
const welcomeEntry = await loadEntryPoint('welcome');
await renderExtension('welcome-div', welcomeEntry);

// Only load user info when needed
const userEntry = await loadEntryPoint('userInfo');
await renderExtension('user-div', userEntry);
```

### Custom Entry Point (Works in Both Modes)

```javascript
import { renderExtension } from './extension.es.js';

// Define your own entry point
const myEntryPoint = ({ user, element, churchtoolsClient }) => {
  element.innerHTML = `<h1>Hello, ${user.firstName}!</h1>`;
};

// Render to a specific DIV
await renderExtension('my-extension-div', myEntryPoint);
```

### UMD Usage (Script Tag)

```html
<!-- For extension with KEY="calendar" -->
<script src="extension.umd.js"></script>
<script>
  // Access via global (simple mode)
  const { renderExtension, welcomeEntryPoint } = ChurchToolsExtension_calendar;
  renderExtension('my-div', welcomeEntryPoint);

  // OR access via global (advanced mode)
  const { renderExtension, loadEntryPoint } = ChurchToolsExtension_calendar;
  loadEntryPoint('welcome').then(entry => {
    renderExtension('my-div', entry);
  });
</script>
```

## Entry Point API

An entry point is a function that receives an `ExtensionContext` object and renders content to the provided element.

### ExtensionContext Interface

```typescript
interface ExtensionContext {
  /** The ChurchTools API client instance */
  churchtoolsClient: ChurchtoolsClient;

  /** The currently logged-in user */
  user: Person;

  /** The DOM element where the extension should render */
  element: HTMLElement;

  /** The extension key (optional) */
  KEY?: string;
}
```

### Entry Point Type

```typescript
type EntryPoint = (context: ExtensionContext) => Promise<void> | void;
```

## Examples

### Example 1: Simple Welcome Message

```javascript
const welcomeEntry = ({ user, element }) => {
  element.innerHTML = `
    <div style="padding: 2rem;">
      <h1>Welcome ${user.firstName} ${user.lastName}!</h1>
    </div>
  `;
};

await renderExtension('welcome-div', welcomeEntry);
```

### Example 2: Async Data Loading

```javascript
const dataEntry = async ({ churchtoolsClient, element }) => {
  element.innerHTML = '<p>Loading...</p>';

  try {
    const data = await churchtoolsClient.get('/api/some-endpoint');
    element.innerHTML = `
      <div>
        <h2>Data Loaded</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  } catch (error) {
    element.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
};

await renderExtension('data-div', dataEntry);
```

### Example 3: Interactive Component

```javascript
const interactiveEntry = ({ user, element, churchtoolsClient }) => {
  element.innerHTML = `
    <div>
      <h2>Interactive Extension</h2>
      <button id="fetch-btn">Fetch Data</button>
      <div id="result"></div>
    </div>
  `;

  const button = element.querySelector('#fetch-btn');
  const result = element.querySelector('#result');

  button.addEventListener('click', async () => {
    result.textContent = 'Loading...';
    const data = await churchtoolsClient.get('/whoami');
    result.textContent = JSON.stringify(data, null, 2);
  });
};

await renderExtension('interactive-div', interactiveEntry);
```

## Using with Frameworks

### With React

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';

const MyReactComponent = ({ user, churchtoolsClient }) => {
  return (
    <div>
      <h1>Hello, {user.firstName}!</h1>
    </div>
  );
};

const reactEntry = ({ user, element, churchtoolsClient }) => {
  const root = ReactDOM.createRoot(element);
  root.render(<MyReactComponent user={user} churchtoolsClient={churchtoolsClient} />);
};

await renderExtension('react-div', reactEntry);
```

### With Vue

```javascript
import { createApp } from 'vue';

const vueEntry = ({ user, element, churchtoolsClient }) => {
  const app = createApp({
    data() {
      return { user, churchtoolsClient };
    },
    template: `
      <div>
        <h1>Hello, {{ user.firstName }}!</h1>
      </div>
    `
  });

  app.mount(element);
};

await renderExtension('vue-div', vueEntry);
```

## Pre-built Entry Points

The boilerplate includes several example entry points in `src/entry-points/`:

```javascript
import {
  welcomeEntryPoint,
  userInfoEntryPoint,
  dataViewerEntryPoint
} from './extension.es.js';

// Use a pre-built entry point
await renderExtension('welcome-div', welcomeEntryPoint);
await renderExtension('user-info-div', userInfoEntryPoint);
await renderExtension('data-div', dataViewerEntryPoint);
```

## Development Mode

When running `npm run dev`, the extension automatically renders to the `#app` div with a default welcome entry point. This is useful for local development and testing.

## Error Handling

The `renderExtension` function will throw an error if:
- The specified div ID doesn't exist
- The ChurchTools client fails to initialize
- The user is not authenticated

Always wrap calls in try-catch for production use:

```javascript
try {
  await renderExtension('my-div', myEntryPoint);
} catch (error) {
  console.error('Failed to render extension:', error);
}
```

## TypeScript Support

The library is fully typed. Import types for TypeScript projects:

```typescript
import type { EntryPoint, ExtensionContext } from './extension.es.js';

const myTypedEntry: EntryPoint = ({ user, element }) => {
  element.innerHTML = `<h1>Hello, ${user.firstName}!</h1>`;
};
```
