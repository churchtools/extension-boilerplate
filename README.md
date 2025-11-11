# ChurchTools Extension Boilerplate

This project provides a boilerplate for building your own extension for [ChurchTools](https://www.church.tools).

## Features

- 🎯 **Flexible Rendering**: Render extensions to any DIV element via `renderExtension(divId, entryPoint)`
- 🔌 **Entry Points**: Define multiple entry points for different UI locations
- 🏗️ **Multi-Extension Support**: Multiple extensions can coexist on the same page without namespace collisions
- 📦 **Multiple Formats**: Builds both ES modules and UMD bundles
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Development Mode**: Hot-reload development server with auto-login
- ⚡ **Dual Build Modes**: Choose between simple (single bundle) or advanced (code splitting) mode
- 📁 **Flexible Deployment**: Built with relative paths - deploy to any URL structure without rebuilding

## Documentation

- **[MANIFEST.md](MANIFEST.md)** - 📋 Extension manifest guide (name, version, extension points)
- **[EXTENSION_COMMUNICATION.md](EXTENSION_COMMUNICATION.md)** - 🔄 Event-based bidirectional communication
- **[BUILD_MODES.md](BUILD_MODES.md)** - ⭐ Complete guide for choosing and using build modes (simple vs advanced)
- **[EXAMPLES.md](EXAMPLES.md)** - 📚 Practical examples and comparisons of both build modes
- **[CHURCHTOOLS_ASSET_PATH.md](CHURCHTOOLS_ASSET_PATH.md)** - 🔧 Asset path handling and deployment flexibility
- **[USAGE.md](USAGE.md)** - General usage guide and API reference
- **[INTEGRATION_EXAMPLE.md](INTEGRATION_EXAMPLE.md)** - Integration examples for ChurchTools
- **[MULTI_EXTENSION_GUIDE.md](MULTI_EXTENSION_GUIDE.md)** - Guide for loading multiple extensions

## Getting Started

### Prerequisites

-   Node.js (version compatible with the project)
-   npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```

### Optional: Using Dev Container

This project includes a dev container configuration. If you use VS Code with the "Dev Containers" extension, you can:

1. Clone the repository
2. Open it in VS Code
3. Click the Remote Indicator in the bottom-left corner of VS Code status bar
4. Select "Reopen in Container"

The container includes the tools mentioned in the prerequisites pre-installed and also runs `npm install` on startup.

## Configuration

Copy `.env-example` to `.env` and fill in your data.

In the `.env` file, configure the necessary constants for your project:

```bash
# Extension key (required)
VITE_KEY=my-extension

# Build mode: "simple" or "advanced" (optional, defaults to "simple")
# - simple: Single bundle with all entry points (best for small extensions)
# - advanced: Code splitting with lazy loading (best for large extensions)
VITE_BUILD_MODE=simple

# ChurchTools connection for development
VITE_BASE_URL=https://your.church.tools
VITE_USERNAME=youruser
VITE_PASSWORD=yourpass
```

**Build Mode Selection:**
- Use `simple` mode (default) for small to medium extensions (< 100KB)
- Use `advanced` mode for large extensions with many entry points (> 100KB)
- See [BUILD_MODES.md](BUILD_MODES.md) for detailed comparison

This file is included in `.gitignore` to prevent sensitive data from being committed to version control.

### Extension Manifest

Edit `manifest.json` to configure your extension metadata:

```json
{
  "name": "My Extension",
  "key": "my-extension",
  "version": "1.0.0",
  "description": "What your extension does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "extensionPoints": [
    {
      "id": "calendar-dialog-availability",
      "entryPoint": "calendarAvailability"
    }
  ]
}
```

The manifest tells ChurchTools:
- ✅ Extension name and version
- ✅ Which extension points you support
- ✅ Which entry points to load
- ✅ Permissions required
- ✅ Compatibility requirements

See [MANIFEST.md](MANIFEST.md) for complete documentation.

## Development and Deployment

### Development Server

Start a development server with hot-reload:

```bash
npm run dev
```

> **Note:** For local development, make sure to configure CORS in your ChurchTools
> instance to allow requests from your local development server
> (typically `http://localhost:5173`).
> This can be done in the ChurchTools admin settings under:
> "System Settings" > "Integrations" > "API" > "Cross-Origin Resource Sharing"
>
> If login works in Chrome but not in Safari, the issue is usually that Safari has stricter cookie handling:
> - Safari blocks `Secure; SameSite=None` cookies on `http://localhost` (Chrome allows them in dev).
> - Safari also blocks cookies if the API is on another domain (third‑party cookies).
>
> **Fix:**
> 1. Use a Vite proxy so API calls go through your local server (`/api → https://xyz.church.tools`). This makes cookies look first‑party.
> 2. Run your dev server with **HTTPS**. You can generate a local trusted certificate with [mkcert](https://github.com/FiloSottile/mkcert).
>
> With proxy + HTTPS, Safari will accept and store cookies just like Chrome.

### Building for Production

Build your extension using the mode configured in `.env`:

```bash
npm run build
```

Or explicitly choose a build mode:

```bash
# Build in simple mode (single bundle)
npm run build:simple

# Build in advanced mode (code splitting)
npm run build:advanced
```

**What gets built:**
- Simple mode: `dist/extension.es.js` and `dist/extension.umd.js`
- Advanced mode: Main bundle + separate chunks for each entry point

See [BUILD_MODES.md](BUILD_MODES.md) for details on choosing the right mode.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Deployment

To build and package your extension for deployment:

```bash
npm run deploy
```

This command will:

1. Build the project
2. Package it using the `scripts/package.js` script

You can find the package in the `releases` directory.

## Usage

### Simple Mode (Default)

```javascript
// ChurchTools loads the extension (simple mode)
import { renderExtension, welcomeEntryPoint } from '/ccm/your-key/extension.es.js';

// All entry points are immediately available
await renderExtension('my-div-id', welcomeEntryPoint);
```

### Advanced Mode (Code Splitting)

```javascript
// ChurchTools loads the extension (advanced mode)
import { renderExtension, loadEntryPoint } from '/ccm/your-key/extension.es.js';

// Load entry point dynamically (only when needed)
const entryPoint = await loadEntryPoint('welcome');
await renderExtension('my-div-id', entryPoint);
```

### Custom Entry Point

```javascript
import { renderExtension } from '/ccm/your-key/extension.es.js';

// Define a custom entry point
const myEntryPoint = ({ user, element, churchtoolsClient }) => {
  element.innerHTML = `<h1>Hello, ${user.firstName}!</h1>`;
};

await renderExtension('my-div-id', myEntryPoint);
```

See [BUILD_MODES.md](BUILD_MODES.md) and [USAGE.md](USAGE.md) for complete documentation.

### Multi-Extension Support

Each extension is built with a unique `KEY` that becomes part of its UMD global namespace:

```html
<!-- Load multiple extensions -->
<script src="/ccm/calendar/extension.umd.js"></script>
<script src="/ccm/events/extension.umd.js"></script>

<script>
  // Each has its own global: ChurchToolsExtension_{KEY}
  ChurchToolsExtension_calendar.renderExtension('cal-div', calendarEntry);
  ChurchToolsExtension_events.renderExtension('events-div', eventsEntry);
</script>
```

See [MULTI_EXTENSION_GUIDE.md](MULTI_EXTENSION_GUIDE.md) for complete details.

## API

Following endpoints are available. Permissions are possible per route. Types are documented in `ct-types.d.ts` (CustomModuleCreate, CustomModuleDataCategoryCreate, CustomModuleDataValueCreate)

GET `/custommodules` get all extensions  
GET `/custommodules/{extensionkey}` get an extensions by its key  
GET `/custommodules/{moduleId}` get an extension by its ID

GET `/custommodules/{moduleId}/customdatacategories`  
POST `/custommodules/{moduleId}/customdatacategories`  
PUT `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}`  
DELETE `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}`

GET `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues`  
POST `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues`  
PUT `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues/{valueId}`  
DELETE `/custommodules/{moduleId}/customdatacategories/{dataCategoryId}/customdatavalues/{valueId}`

## Support

For questions about the ChurchTools API, visit the [Forum](https://forum.church.tools).
