# ChurchTools Integration Example

This document shows how ChurchTools would integrate and use the built extension bundle.

> **Multi-Extension Support:** For loading multiple extensions on the same page, see [MULTI_EXTENSION_GUIDE.md](MULTI_EXTENSION_GUIDE.md)

## Integration Scenario

ChurchTools imports the bundle and calls `renderExtension(divId, entryPoint)` to render extensions in different locations.

### Extension KEY and UMD Global Names

Each extension is built with a unique `KEY` (e.g., `calendar`, `events`, `users`). When using UMD format, the global name is `ChurchToolsExtension_{KEY}` to prevent namespace collisions.

For example:
- Extension with `VITE_KEY=calendar` → global `ChurchToolsExtension_calendar`
- Extension with `VITE_KEY=events` → global `ChurchToolsExtension_events`

## Example 1: ES Module Import

```javascript
// ChurchTools code
import { renderExtension, welcomeEntryPoint } from '/path/to/extension.es.js';

// Render to a specific location in ChurchTools
await renderExtension('ct-extension-container-1', welcomeEntryPoint);
```

## Example 2: Multiple Extensions with Different Entry Points

```javascript
import {
  renderExtension,
  welcomeEntryPoint,
  userInfoEntryPoint,
  dataViewerEntryPoint
} from '/path/to/extension.es.js';

// Render different extensions to different locations
await renderExtension('sidebar-extension', userInfoEntryPoint);
await renderExtension('dashboard-widget', dataViewerEntryPoint);
await renderExtension('header-area', welcomeEntryPoint);
```

## Example 3: Custom Entry Point

```javascript
import { renderExtension } from '/path/to/extension.es.js';

// ChurchTools defines a custom entry point
const customEntryPoint = async ({ user, element, churchtoolsClient }) => {
  // Custom logic specific to this location
  const data = await churchtoolsClient.get('/api/custom-endpoint');

  element.innerHTML = `
    <div class="ct-custom-widget">
      <h2>Custom Widget for ${user.firstName}</h2>
      <div>${data.content}</div>
    </div>
  `;
};

await renderExtension('custom-location', customEntryPoint);
```

## Example 4: Dynamic Entry Point Loading

```javascript
import { renderExtension } from '/path/to/extension.es.js';

// ChurchTools dynamically loads entry points based on configuration
const entryPointMap = {
  'welcome': () => import('./entry-points/welcome.js'),
  'dashboard': () => import('./entry-points/dashboard.js'),
  'admin': () => import('./entry-points/admin.js'),
};

async function loadExtension(divId, entryPointName) {
  const entryPointModule = await entryPointMap[entryPointName]();
  await renderExtension(divId, entryPointModule.default);
}

// Usage
await loadExtension('main-area', 'welcome');
await loadExtension('admin-panel', 'admin');
```

## Example 5: Error Handling

```javascript
import { renderExtension } from '/path/to/extension.es.js';

async function safelyRenderExtension(divId, entryPoint) {
  try {
    await renderExtension(divId, entryPoint);
  } catch (error) {
    console.error(`Failed to render extension in ${divId}:`, error);

    // Fallback UI
    const element = document.querySelector(`#${divId}`);
    if (element) {
      element.innerHTML = `
        <div style="padding: 1rem; color: red; border: 1px solid red;">
          <p>Failed to load extension: ${error.message}</p>
        </div>
      `;
    }
  }
}
```

## Example 6: UMD/Script Tag Usage

```html
<!-- In ChurchTools HTML -->
<div id="extension-area"></div>

<!-- Load extension built with VITE_KEY=calendar -->
<script src="/ccm/calendar/extension.umd.js"></script>
<script>
  // Access via global variable (ChurchToolsExtension_{KEY})
  const { renderExtension, welcomeEntryPoint } = ChurchToolsExtension_calendar;

  renderExtension('extension-area', welcomeEntryPoint)
    .catch(console.error);
</script>
```

**Note:** The global name is `ChurchToolsExtension_{KEY}` where `{KEY}` is the value of `VITE_KEY` used during build. This prevents namespace collisions when multiple extensions are loaded on the same page.

## HTML Structure in ChurchTools

```html
<!-- ChurchTools HTML with extension containers -->
<div id="ct-app">
  <!-- Sidebar area -->
  <aside class="ct-sidebar">
    <div id="ct-sidebar-extension"></div>
  </aside>

  <!-- Main content area -->
  <main class="ct-main">
    <div id="ct-main-extension"></div>
  </main>

  <!-- Widget area -->
  <section class="ct-widgets">
    <div id="ct-widget-1"></div>
    <div id="ct-widget-2"></div>
  </section>
</div>

<script type="module">
  import { renderExtension } from './extensions/extension.es.js';

  // Load different extensions in different areas
  const extensions = [
    { divId: 'ct-sidebar-extension', entryPoint: sidebarEntry },
    { divId: 'ct-main-extension', entryPoint: mainEntry },
    { divId: 'ct-widget-1', entryPoint: widget1Entry },
    { divId: 'ct-widget-2', entryPoint: widget2Entry },
  ];

  // Render all extensions
  await Promise.all(
    extensions.map(({ divId, entryPoint }) =>
      renderExtension(divId, entryPoint)
    )
  );
</script>
```

## TypeScript Integration

```typescript
// ChurchTools TypeScript code
import type { EntryPoint, ExtensionContext } from './extension.es.js';
import { renderExtension } from './extension.es.js';

// Create a typed entry point
const typedEntryPoint: EntryPoint = async (context: ExtensionContext) => {
  const { user, element, churchtoolsClient } = context;

  // TypeScript has full type information
  const userName = `${user.firstName} ${user.lastName}`;

  element.innerHTML = `<h1>Hello, ${userName}</h1>`;
};

// Use it
await renderExtension('typed-extension', typedEntryPoint);
```
