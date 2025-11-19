# ChurchTools Extension Boilerplate

A modern, TypeScript-based boilerplate for building ChurchTools extensions with full type safety, hot-reload development, and flexible deployment options.

## What are ChurchTools Extensions?

ChurchTools is a church management system that allows you to extend its functionality through custom extensions. Extensions can:

- **Add new modules** with standalone interfaces and navigation
- **Enhance existing features** by injecting content into specific UI locations
- **Integrate external services** to sync data or provide additional functionality
- **Customize workflows** to match your organization's specific needs

Extensions are built with modern web technologies (TypeScript, React, Vue, etc.) and communicate with ChurchTools through a well-defined API.

## Features

- **🎯 Extension Points** - Integrate your code at specific locations in ChurchTools UI
- **🔌 Entry Points** - Define multiple entry points for different UI locations
- **🔄 Event Communication** - Bidirectional event-based communication with ChurchTools
- **💾 Key-Value Store** - Persistent storage for settings, preferences, and data
- **🏗️ Multi-Extension Support** - Multiple extensions can coexist without conflicts
- **📦 Build Modes** - Simple (single bundle) or Advanced (code splitting) modes
- **🔒 Type-Safe** - Full TypeScript support with extension point contracts
- **🚀 Development Mode** - Hot-reload development server with test environment
- **📁 Flexible Deployment** - Built with relative paths for any URL structure

## Quick Start

### 1. Installation

```bash
# Clone the boilerplate
git clone https://github.com/churchtools/extension-boilerplate.git my-extension
cd my-extension

# Install dependencies
npm install
```

### 2. Configuration

Create a `.env` file from the example:

```bash
cp .env-example .env
```

Edit `.env` with your settings:

```bash
# Your extension's unique identifier
VITE_KEY=my-extension

# ChurchTools instance for development
VITE_BASE_URL=https://your.church.tools
VITE_USERNAME=your-username
VITE_PASSWORD=your-password

# Build mode (optional, defaults to "simple")
VITE_BUILD_MODE=simple
```

### 3. Configure Your Extension

Edit `manifest.json` to define your extension:

```json
{
  "name": "My Extension",
  "key": "my-extension",
  "version": "1.0.0",
  "description": "My first ChurchTools extension",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "extensionPoints": [
    {
      "id": "main",
      "entryPoint": "main",
      "title": "My Extension Module",
      "description": "A standalone module with custom functionality"
    }
  ]
}
```

### 4. Start Development

```bash
npm run dev
```

This starts a development server at `http://localhost:5173` with:
- Hot-reload on code changes
- Auto-login to your ChurchTools instance
- Test environment for all extension points
- Event logging and debugging tools

### 5. Build for Production

```bash
npm run build
```

This creates production-ready files in `dist/`:
- `extension.es.js` - ES module bundle
- `extension.umd.js` - UMD bundle (for script tags)
- `manifest.json` - Extension manifest

### 6. Package for Deployment

```bash
npm run deploy
```

Creates a ZIP file in `releases/` ready to upload to ChurchTools.

## Documentation

- **[Getting Started](docs/getting-started.md)** - Complete setup guide and first extension
- **[Core Concepts](docs/core-concepts.md)** - Understanding extensions, entry points, and contracts
- **[Entry Points Guide](docs/entry-points.md)** - Creating and registering entry points
- **[Communication](docs/communication.md)** - Event-based bidirectional communication
- **[Key-Value Store](docs/key-value-store.md)** - Persist settings and data in ChurchTools
- **[Build & Deploy](docs/build-and-deploy.md)** - Building, testing, and deployment
- **[Manifest Reference](docs/manifest.md)** - Complete manifest.json documentation
- **[API Reference](docs/api-reference.md)** - Complete API documentation

## Project Structure

```
extension-boilerplate/
├── src/
│   ├── entry-points/          # Your extension code (edit this!)
│   │   ├── main.ts           # Main module entry point (if your extension has a main view)
│   │   ├── admin.ts          # Admin configuration (if your extension has one)
│   │   ├── ...               # Other entry points
│   │   └── index.ts          # Entry point registry
│   ├── lib/                   # Framework code (don't modify)
│   │   ├── main.ts           # Core rendering system
│   │   ├── event-bus.ts      # Event communication
│   │   └── loaders.ts        # Entry point loader
│   └── index.ts              # Main entry (exports everything)
├── test/                      # Test data and environment
├── docs/                      # Extension developer documentation
├── manifest.json             # Extension configuration
├── vite.config.ts            # Build configuration
└── package.json              # Project dependencies
```

## Development Workflow

### 1. Create an Entry Point

```typescript
// src/entry-points/my-feature.ts
import type { EntryPoint } from '../lib/main';
import type { ExtensionPointXYZData } from '@churchtools/extension-points';

const myFeatureEntryPoint: EntryPoint<ExtensionPointXYZData> = ({
  data,
  element,
  churchtoolsClient,
  on,
  emit
}) => {
  // Render your UI
  element.innerHTML = `
    <div>
      <h1>My Feature</h1>
      <p>Welcome to ChurchTools Extensions!</p>
    </div>
  `;

  // Listen to events from ChurchTools
  on('data:updated', (newData) => {
    console.log('Received update:', newData);
  });

  // Emit events to ChurchTools
  emit('feature:ready', { initialized: true });

  // Return cleanup function
  return () => {
    console.log('Cleaning up...');
  };
};

export default myFeatureEntryPoint;
```

### 2. Register the Entry Point

```typescript
// src/entry-points/index.ts
export const entryPointRegistry = {
  main: () => import('./main'),
  admin: () => import('./admin'),
  myFeature: () => import('./my-feature'), // Add your entry point
};
```

### 3. Add to manifest.json

```json
{
  "extensionPoints": [
    {
      "id": "some-extension-point-id",
      "entryPoint": "myFeature",
      "title": "My Feature",
      "description": "Description of my feature"
    }
  ]
}
```

### 4. Test in Development Server

```bash
npm run dev
```

The test environment provides:
- Interactive extension point selector
- Context data editor
- Event bus tester with event log
- Resizable preview window
- Real-time debugging

### 4. Build and Deploy

```bash
# Build
npm run build

# Create deployment package
npm run deploy
```

Upload the generated ZIP file to your ChurchTools instance.

## Examples

### Simple Entry Point

```typescript
const simpleEntry: EntryPoint = ({ element, user }) => {
  element.innerHTML = `<h1>Hello, ${user.firstName}!</h1>`;
};
```

### Entry Point with API Calls

```typescript
const dataEntry: EntryPoint = async ({ element, churchtoolsClient }) => {
  element.innerHTML = '<p>Loading...</p>';

  try {
    const data = await churchtoolsClient.get('/api/persons');
    element.innerHTML = `
      <div>
        <h2>Persons</h2>
        <ul>${data.map(p => `<li>${p.firstName} ${p.lastName}</li>`).join('')}</ul>
      </div>
    `;
  } catch (error) {
    element.innerHTML = `<p>Error: ${error.message}</p>`;
  }
};
```

### Entry Point with Event Communication

```typescript
const communicatingEntry: EntryPoint<CalendarData> = ({ data, on, emit, element }) => {
  // Render based on initial data
  function render() {
    element.innerHTML = `
      <div>
        <p>Selected Date: ${data.selectedDate}</p>
        <button id="suggest-btn">Suggest Time</button>
      </div>
    `;

    document.getElementById('suggest-btn').onclick = () => {
      emit('time:suggest', { time: '14:00', reason: 'Better availability' });
    };
  }

  render();

  // Listen to updates from ChurchTools
  on('date:changed', (newDate) => {
    data.selectedDate = newDate;
    render();
  });

  // Cleanup
  return () => {
    console.log('Cleanup');
  };
};
```

### Entry Point with Persistent Storage

```typescript
import { getModule, getCustomDataCategory, getCustomDataValues } from '../utils/kv-store';

interface Setting {
  key: string;
  value: string;
}

const settingsEntry: EntryPoint = async ({ element, KEY }) => {
  // Load saved settings from key-value store
  try {
    const module = await getModule(KEY);
    const category = await getCustomDataCategory<object>('settings');

    let theme = 'light';
    if (category) {
      const values = await getCustomDataValues<Setting>(category.id, module.id);
      const themeSetting = values.find(v => v.key === 'theme');
      if (themeSetting) {
        theme = themeSetting.value;
      }
    }

    element.innerHTML = `
      <div>
        <p>Current theme: ${theme}</p>
        <p>Settings are persisted in ChurchTools</p>
      </div>
    `;
  } catch (error) {
    element.innerHTML = `<p>Using default settings</p>`;
  }
};
```

## Build Modes

### Simple Mode (Default)

Single bundle with all entry points. Best for small extensions.

```bash
VITE_BUILD_MODE=simple
npm run build
```

**When to use:**
- Extension < 100KB
- Few entry points (< 10)
- All features are commonly used

### Advanced Mode

Code splitting with lazy-loaded entry points. Best for large extensions.

```bash
VITE_BUILD_MODE=advanced
npm run build
```

**When to use:**
- Extension > 100KB
- Many entry points (> 10)
- Different pages use different features

See [Build & Deploy](docs/build-and-deploy.md) for detailed comparison.

## Framework Support

The boilerplate works with any UI framework:

### React

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';

const MyComponent = ({ user }) => <h1>Hello, {user.firstName}!</h1>;

const reactEntry: EntryPoint = ({ element, user }) => {
  const root = ReactDOM.createRoot(element);
  root.render(<MyComponent user={user} />);
};
```

### Vue

```typescript
import { createApp } from 'vue';

const vueEntry: EntryPoint = ({ element, user }) => {
  createApp({
    data: () => ({ user }),
    template: '<h1>Hello, {{ user.firstName }}!</h1>'
  }).mount(element);
};
```

### Vanilla TypeScript

```typescript
const vanillaEntry: EntryPoint = ({ element, user }) => {
  element.innerHTML = `<h1>Hello, ${user.firstName}!</h1>`;
};
```

## Testing

The development server includes a comprehensive test environment:

1. **Extension Point Selector** - Switch between different extension points
2. **Context Data Editor** - Modify initial data to test different scenarios
3. **Event Bus Tester** - Send events to your extension and monitor responses
4. **Event Log** - Real-time log of all events with data inspection
5. **Preview Resizing** - Test your extension at different sizes

See [Getting Started](docs/getting-started.md) for a complete guide.

## ChurchTools API Client

The ChurchTools client is automatically configured:

```typescript
const myEntry: EntryPoint = async ({ churchtoolsClient }) => {
  // GET request
  const persons = await churchtoolsClient.get('/api/persons');

  // POST request
  const result = await churchtoolsClient.post('/api/events', {
    name: 'New Event',
    startDate: '2025-11-20'
  });

  // PUT request
  await churchtoolsClient.put('/api/events/123', { name: 'Updated Event' });

  // DELETE request
  await churchtoolsClient.delete('/api/events/123');
};
```

See [API Reference](docs/api-reference.md) for complete documentation.

## TypeScript Support

Full type safety with extension point contracts:

```typescript
import type { EntryPoint } from './lib/main';
import type {
  MainModuleData,
  CalendarDialogData,
  PersonDetailsData
} from '@churchtools/extension-points';

// Type-safe entry points
const mainEntry: EntryPoint<MainModuleData> = ({ data }) => {
  console.log(data.userId); // ✓ Type-safe!
};

const calendarEntry: EntryPoint<CalendarDialogData> = ({ data }) => {
  console.log(data.selectedDate); // ✓ Type-safe!
};
```

## Troubleshooting

### Development server won't start

1. Check your `.env` file is configured correctly
2. Verify ChurchTools credentials are valid
3. Ensure CORS is enabled in ChurchTools admin settings

### Extension not loading in ChurchTools

1. Verify `manifest.json` is valid
2. Check extension key matches in `.env` and `manifest.json`
3. Ensure entry points are registered in `src/entry-points/index.ts`
4. Check browser console for errors

### Build errors

1. Run `npm install` to ensure dependencies are installed
2. Check TypeScript errors with `npm run build`
3. Verify all entry points export correctly

## Support

- **Documentation**: See `docs/` folder for comprehensive guides
- **Forum**: Visit [ChurchTools Forum](https://forum.church.tools)
- **Issues**: Report bugs on GitHub Issues
- **API Docs**: [ChurchTools API Documentation](https://<yourchurch>.church.tools/api)
- **Get Help**: send mail to extensions@churchtools.de

## License

MIT - See LICENSE file for details

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

**Ready to build your first extension?** Start with [Getting Started](docs/getting-started.md)!
