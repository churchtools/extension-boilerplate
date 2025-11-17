# Multi-Extension Support Guide

This guide explains how to build and use multiple ChurchTools extensions on the same page without namespace collisions.

## Overview

Each extension is built with a unique `KEY` that becomes part of the UMD global namespace. This allows multiple extensions to coexist on the same page.

## Building Extensions with Different KEYs

### Step 1: Set the Extension KEY

Each extension needs a unique KEY defined in the `.env` file:

```bash
# .env for Calendar Extension
VITE_KEY=calendar
VITE_BASE_URL=https://your-churchtools.example
```

### Step 2: Build the Extension

```bash
npm run build
```

This creates:
- `dist/extension.es.js` - ES module
- `dist/extension.umd.js` - UMD with global name `ChurchToolsExtension_calendar`

### Step 3: Deploy to ChurchTools

Deploy the built files to ChurchTools at:
```
/ccm/calendar/extension.umd.js
/ccm/calendar/extension.es.js
```

## Global Namespace Pattern

Each extension gets a unique global based on its KEY:

| Extension KEY | UMD Global Name |
|---------------|-----------------|
| `calendar` | `ChurchToolsExtension_calendar` |
| `events` | `ChurchToolsExtension_events` |
| `users` | `ChurchToolsExtension_users` |
| `reports` | `ChurchToolsExtension_reports` |

## Loading Multiple Extensions in ChurchTools

### UMD Approach (Script Tags)

```html
<!DOCTYPE html>
<html>
<head>
    <title>ChurchTools</title>
</head>
<body>
    <!-- Extension containers -->
    <div id="calendar-widget"></div>
    <div id="events-widget"></div>
    <div id="users-widget"></div>

    <!-- Load all extension bundles -->
    <script src="/ccm/calendar/extension.umd.js"></script>
    <script src="/ccm/events/extension.umd.js"></script>
    <script src="/ccm/users/extension.umd.js"></script>

    <!-- Initialize extensions -->
    <script>
        (async function() {
            // Calendar Extension
            const calendar = ChurchToolsExtension_calendar;
            await calendar.renderExtension('calendar-widget', calendar.welcomeEntryPoint);

            // Events Extension
            const events = ChurchToolsExtension_events;
            await events.renderExtension('events-widget', events.welcomeEntryPoint);

            // Users Extension
            const users = ChurchToolsExtension_users;
            await users.renderExtension('users-widget', users.welcomeEntryPoint);
        })();
    </script>
</body>
</html>
```

### ES Module Approach (Recommended)

```javascript
// Load extensions dynamically
const extensions = [
    { key: 'calendar', divId: 'calendar-widget' },
    { key: 'events', divId: 'events-widget' },
    { key: 'users', divId: 'users-widget' },
];

async function loadExtensions() {
    for (const { key, divId } of extensions) {
        const module = await import(`/ccm/${key}/extension.es.js`);
        await module.renderExtension(divId, module.welcomeEntryPoint);
    }
}

loadExtensions();
```

## Extension Configuration Management

### ChurchTools Server-Side Configuration

```javascript
// ChurchTools backend configuration
const installedExtensions = [
    {
        key: 'calendar',
        name: 'Calendar Extension',
        version: '1.0.0',
        enabled: true,
        entryPoints: {
            sidebar: 'calendarSidebarEntry',
            dashboard: 'calendarDashboardEntry',
        }
    },
    {
        key: 'events',
        name: 'Events Management',
        version: '2.1.0',
        enabled: true,
        entryPoints: {
            main: 'eventsMainEntry',
        }
    },
];

// Generate HTML to load extensions
function generateExtensionScripts() {
    return installedExtensions
        .filter(ext => ext.enabled)
        .map(ext => `<script src="/ccm/${ext.key}/extension.umd.js"></script>`)
        .join('\n');
}

// Generate initialization code
function generateExtensionInit() {
    const initCalls = installedExtensions
        .filter(ext => ext.enabled)
        .flatMap(ext => {
            return Object.entries(ext.entryPoints).map(([location, entryPoint]) => {
                const divId = `ext-${ext.key}-${location}`;
                return `
                    ChurchToolsExtension_${ext.key}.renderExtension(
                        '${divId}',
                        ChurchToolsExtension_${ext.key}.${entryPoint}
                    );
                `;
            });
        });

    return `
        <script>
            (async function() {
                ${initCalls.join('\n')}
            })();
        </script>
    `;
}
```

## Dynamic Extension Loading

### Helper Function for ChurchTools

```javascript
/**
 * Helper function to load and render a ChurchTools extension
 * @param {string} extensionKey - The unique key of the extension
 * @param {string} divId - The ID of the div to render into
 * @param {string} entryPointName - Name of the entry point to use
 */
async function loadChurchToolsExtension(extensionKey, divId, entryPointName = 'welcomeEntryPoint') {
    try {
        // Get the global object for this extension
        const globalName = `ChurchToolsExtension_${extensionKey}`;
        const extension = window[globalName];

        if (!extension) {
            throw new Error(`Extension "${extensionKey}" not found. Make sure it's loaded.`);
        }

        // Get the entry point
        const entryPoint = extension[entryPointName];
        if (!entryPoint) {
            throw new Error(`Entry point "${entryPointName}" not found in extension "${extensionKey}"`);
        }

        // Render the extension
        await extension.renderExtension(divId, entryPoint);

        console.log(`✓ Loaded extension "${extensionKey}" into #${divId}`);
    } catch (error) {
        console.error(`Failed to load extension "${extensionKey}":`, error);

        // Show error in the div
        const element = document.getElementById(divId);
        if (element) {
            element.innerHTML = `
                <div style="padding: 1rem; background: #fee; border: 1px solid #f00; border-radius: 4px;">
                    <strong>Extension Load Error:</strong> ${error.message}
                </div>
            `;
        }
    }
}

// Usage
loadChurchToolsExtension('calendar', 'calendar-widget', 'welcomeEntryPoint');
loadChurchToolsExtension('events', 'events-widget', 'dataViewerEntryPoint');
```

## Extension Registry Pattern

```javascript
/**
 * Extension registry for managing multiple extensions
 */
class ChurchToolsExtensionRegistry {
    constructor() {
        this.extensions = new Map();
        this.loadedScripts = new Set();
    }

    /**
     * Register an extension by its key
     */
    register(key, extensionModule) {
        this.extensions.set(key, extensionModule);
        console.log(`✓ Registered extension: ${key}`);
    }

    /**
     * Load an extension script
     */
    async loadScript(key) {
        if (this.loadedScripts.has(key)) {
            return; // Already loaded
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `/ccm/${key}/extension.umd.js`;
            script.onload = () => {
                this.loadedScripts.add(key);
                const globalName = `ChurchToolsExtension_${key}`;
                this.register(key, window[globalName]);
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed to load extension: ${key}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Get a registered extension
     */
    get(key) {
        return this.extensions.get(key);
    }

    /**
     * Render an extension to a div
     */
    async render(key, divId, entryPointName = 'welcomeEntryPoint') {
        // Load extension if not already loaded
        if (!this.extensions.has(key)) {
            await this.loadScript(key);
        }

        const extension = this.get(key);
        if (!extension) {
            throw new Error(`Extension "${key}" not found`);
        }

        const entryPoint = extension[entryPointName];
        if (!entryPoint) {
            throw new Error(`Entry point "${entryPointName}" not found`);
        }

        await extension.renderExtension(divId, entryPoint);
    }

    /**
     * List all registered extensions
     */
    list() {
        return Array.from(this.extensions.keys());
    }
}

// Global registry instance
window.ctExtensions = new ChurchToolsExtensionRegistry();

// Usage
await ctExtensions.render('calendar', 'calendar-widget', 'welcomeEntryPoint');
await ctExtensions.render('events', 'events-widget', 'dataViewerEntryPoint');
await ctExtensions.render('users', 'users-widget', 'userInfoEntryPoint');

console.log('Loaded extensions:', ctExtensions.list());
// Output: ['calendar', 'events', 'users']
```

## Best Practices

### 1. Consistent KEY Naming

Use clear, descriptive keys:
- ✅ `calendar`, `events`, `reports`, `attendance`
- ❌ `ext1`, `plugin`, `my-extension`

### 2. Version Management

Include version in the URL path:
```html
<script src="/ccm/calendar/v1.0.0/extension.umd.js"></script>
```

### 3. Error Handling

Always wrap extension loading in try-catch:
```javascript
try {
    await extension.renderExtension('my-div', entryPoint);
} catch (error) {
    console.error('Extension failed:', error);
    showFallbackUI(divId);
}
```

### 4. Lazy Loading

Load extensions only when needed:
```javascript
// Load on tab activation
document.getElementById('calendar-tab').addEventListener('click', async () => {
    await ctExtensions.render('calendar', 'calendar-content');
});
```

### 5. Extension Isolation

Each extension should be self-contained and not interfere with others.

## Testing Multiple Extensions Locally

### Setup for Local Testing

1. Create separate builds for each extension:
```bash
# Extension 1
VITE_KEY=extension1 npm run build
mv dist dist-extension1

# Extension 2
VITE_KEY=extension2 npm run build
mv dist dist-extension2
```

2. Create a test HTML file that loads both:
```html
<script src="dist-extension1/extension.umd.js"></script>
<script src="dist-extension2/extension.umd.js"></script>
```

3. Verify both globals exist:
```javascript
console.log('Extension 1:', typeof ChurchToolsExtension_extension1);
console.log('Extension 2:', typeof ChurchToolsExtension_extension2);
```

## Migration from Single Extension

If you have existing code using `ChurchToolsExtension`, update to use the key-based global:

**Before:**
```javascript
const { renderExtension } = ChurchToolsExtension;
```

**After:**
```javascript
const { renderExtension } = ChurchToolsExtension_calendar;
// or dynamically:
const extensionKey = 'calendar';
const extension = window[`ChurchToolsExtension_${extensionKey}`];
const { renderExtension } = extension;
```
