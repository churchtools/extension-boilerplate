# Getting Started with ChurchTools Extensions

This guide will help you create your first ChurchTools extension from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) and **npm** installed
- A **ChurchTools instance** for testing (can be a trial or development instance)
- **ChurchTools admin access** to enable CORS and upload extensions
- A **code editor** (VS Code recommended)
- Basic knowledge of **TypeScript/JavaScript** and **HTML**

## What You'll Build

In this guide, you'll create a simple extension that:
1. Adds a new module to ChurchTools with its own menu entry
2. Displays a personalized welcome message
3. Fetches and displays data from the ChurchTools API
4. Demonstrates event communication

## Step 1: Setup

### Clone the Boilerplate

```bash
# Clone the repository
git clone https://github.com/churchtools/extension-boilerplate.git my-first-extension
cd my-first-extension

# Install dependencies
npm install
```

### Configure Environment

Create a `.env` file:

```bash
cp .env-example .env
```

Edit `.env` with your settings:

```bash
# Your extension's unique key
VITE_KEY=my-first-extension

# Your ChurchTools instance
VITE_BASE_URL=https://your.church.tools
VITE_USERNAME=your-username
VITE_PASSWORD=your-password

# Build mode (simple is default)
VITE_BUILD_MODE=simple
```

**Important:** The `.env` file is gitignored - never commit credentials!

### Enable CORS in ChurchTools

For local development, you need to enable CORS:

1. Log into your ChurchTools instance as admin
2. Go to **Settings** > **Integrations** > **API**
3. Under **Cross-Origin Resource Sharing (CORS)**, add:
   - `http://localhost:5173`
4. Save settings

## Step 2: Configure Your Extension

Edit `manifest.json` in the root directory:

```json
{
  "name": "My First Extension",
  "key": "my-first-extension",
  "version": "1.0.0",
  "description": "A simple extension to learn ChurchTools development",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "extensionPoints": [
    {
      "id": "main",
      "entryPoint": "main",
      "title": "My First Extension",
      "description": "Main module for my extension"
    }
  ]
}
```

**Key points:**
- `key` must be unique and match `VITE_KEY` in `.env`
- `key` should be lowercase with hyphens only
- `extensionPoints` defines where your extension appears in ChurchTools
- `entryPoint` must match a registered entry point in your code

## Step 3: Understand the Project Structure

```
my-first-extension/
├── src/
│   ├── entry-points/          # Your extension code
│   │   ├── main.ts           # Main module entry point
│   │   ├── admin.ts          # Admin configuration
│   │   └── index.ts          # Entry point registry
│   ├── lib/                   # Framework code (don't modify)
│   │   ├── main.ts           # Core rendering system
│   │   ├── event-bus.ts      # Event communication
│   │   └── loaders.ts        # Entry point loader
│   ├── types/                 # TypeScript types
│   └── index.ts              # Main entry point
├── test/                      # Test environment data
├── manifest.json             # Extension configuration
├── vite.config.ts            # Build configuration
└── .env                      # Local configuration (gitignored)
```

**Where to edit:**
- ✅ `src/entry-points/` - Your extension implementation
- ✅ `manifest.json` - Extension metadata
- ✅ `.env` - Local development settings
- ❌ `src/lib/` - Framework code (don't modify)

## Step 4: Create Your First Entry Point

Entry points are the core of your extension. Let's examine the main entry point at `src/entry-points/main.ts`:

```typescript
import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points';

const mainEntryPoint: EntryPoint<MainModuleData> = ({
  data,
  element,
  churchtoolsClient,
  user,
  on,
  emit,
}) => {
  // 1. Render your UI
  element.innerHTML = `
    <div style="padding: 2rem; font-family: sans-serif;">
      <h1>Welcome to My First Extension</h1>
      <p>Hello, ${user.firstName} ${user.lastName}!</p>
      <p>Your email: ${user.email}</p>

      <button id="load-data-btn" style="padding: 0.5rem 1rem; cursor: pointer;">
        Load Data
      </button>

      <div id="data-container"></div>
    </div>
  `;

  // 2. Add interactivity
  const button = document.getElementById('load-data-btn');
  const container = document.getElementById('data-container');

  button.addEventListener('click', async () => {
    container.innerHTML = '<p>Loading...</p>';

    try {
      // Fetch data from ChurchTools API
      const response = await churchtoolsClient.get('/whoami');

      container.innerHTML = `
        <div style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 4px;">
          <h3>Your ChurchTools Info:</h3>
          <pre>${JSON.stringify(response, null, 2)}</pre>
        </div>
      `;

      // Emit event to ChurchTools
      emit('data:loaded', { success: true });
    } catch (error) {
      container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      emit('data:error', { error: error.message });
    }
  });

  // 3. Listen to events from ChurchTools (optional)
  on('refresh:requested', () => {
    console.log('ChurchTools requested a refresh');
    button.click(); // Trigger data reload
  });

  // 4. Return cleanup function
  return () => {
    console.log('Extension is being destroyed');
    // Clean up event listeners, timers, etc.
  };
};

export default mainEntryPoint;
```

**Understanding the entry point:**

1. **Type safety**: `EntryPoint<MainModuleData>` provides type checking
2. **Context parameters**:
   - `data` - Extension-point-specific data from ChurchTools
   - `element` - DOM element where your extension renders
   - `churchtoolsClient` - Configured API client
   - `user` - Current logged-in user
   - `on` / `emit` - Event communication with ChurchTools
3. **Rendering**: Use `element.innerHTML` or mount a framework (React/Vue)
4. **API calls**: Use `churchtoolsClient` for all ChurchTools API requests
5. **Events**: Listen with `on()` and emit with `emit()`
6. **Cleanup**: Return a function to clean up resources

## Step 5: Start the Development Server

```bash
npm run dev
```

This will:
1. Start a dev server at `http://localhost:5173`
2. Auto-login to your ChurchTools instance
3. Open a test environment in your browser

You should see:
- A menu bar with extension points
- Your "main" extension point selected
- A welcome message with your name
- A "Load Data" button

**Test your extension:**
1. Click "Load Data" - you should see your ChurchTools user info
2. Edit the code in `src/entry-points/main.ts`
3. Save - the page will hot-reload automatically

## Step 6: Understanding the Test Environment

The development server provides a comprehensive test environment:

### Extension Point Selector

At the top, you'll see menu items for each extension point. Click to switch between them.

### Test Environment Panel (Left Side)

#### Context Data
- Shows the initial data passed to your extension
- Edit the JSON to test different scenarios
- Click "Reload Entry Point" to restart with new data

#### Event Bus
- Select an event to send to your extension
- Edit the event data (JSON)
- Click "Send Event" to trigger the event
- See all emitted events in the Event Log

#### Event Log
- Shows all events emitted by your extension
- Displays event names, timestamps, and data
- Useful for debugging event communication

### Preview Window (Right Side)

- Shows your extension rendering
- Resize using the width/height inputs
- Test responsive design

## Step 7: Add More Features

Let's enhance the main entry point with more features:

```typescript
import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points';

const mainEntryPoint: EntryPoint<MainModuleData> = ({
  element,
  churchtoolsClient,
  user,
  emit,
}) => {
  let persons = [];

  function render() {
    element.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; max-width: 1200px;">
        <header style="margin-bottom: 2rem; border-bottom: 2px solid #007bff; padding-bottom: 1rem;">
          <h1 style="margin: 0; color: #007bff;">My First Extension</h1>
          <p style="color: #666;">Welcome, ${user.firstName}!</p>
        </header>

        <section style="margin-bottom: 2rem;">
          <h2>Actions</h2>
          <button id="load-persons-btn" class="btn">Load Persons</button>
          <button id="notify-btn" class="btn">Test Notification</button>
        </section>

        <section id="persons-section" style="display: none;">
          <h2>Persons in ChurchTools</h2>
          <div id="persons-list"></div>
        </section>

        <style>
          .btn {
            padding: 0.75rem 1.5rem;
            margin-right: 0.5rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
          }
          .btn:hover {
            background: #0056b3;
          }
          .person-card {
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 4px solid #007bff;
          }
        </style>
      </div>
    `;

    attachEventListeners();
  }

  function attachEventListeners() {
    document.getElementById('load-persons-btn').addEventListener('click', loadPersons);
    document.getElementById('notify-btn').addEventListener('click', sendNotification);
  }

  async function loadPersons() {
    const section = document.getElementById('persons-section');
    const list = document.getElementById('persons-list');

    list.innerHTML = '<p>Loading persons...</p>';
    section.style.display = 'block';

    try {
      const response = await churchtoolsClient.get('/api/persons');
      persons = response.data || [];

      if (persons.length === 0) {
        list.innerHTML = '<p>No persons found.</p>';
        return;
      }

      list.innerHTML = persons
        .slice(0, 10) // Show first 10
        .map(person => `
          <div class="person-card">
            <strong>${person.firstName} ${person.lastName}</strong>
            ${person.email ? `<br><small>${person.email}</small>` : ''}
          </div>
        `)
        .join('');

      emit('persons:loaded', { count: persons.length });
    } catch (error) {
      list.innerHTML = `<p style="color: red;">Error loading persons: ${error.message}</p>`;
      emit('persons:error', { error: error.message });
    }
  }

  function sendNotification() {
    emit('notification:show', {
      message: 'Hello from My First Extension!',
      type: 'success',
      duration: 3000
    });
  }

  // Initial render
  render();

  // Cleanup
  return () => {
    console.log('Cleaning up main entry point');
  };
};

export default mainEntryPoint;
```

**New features:**
- Multiple action buttons
- Loading persons from the API
- Styled UI components
- Notification events
- Better error handling

Save the file and see it hot-reload in the browser!

## Step 8: Build for Production

When you're ready to deploy:

```bash
npm run build
```

This creates production-ready files in `dist/`:
```
dist/
├── extension.es.js      # ES module bundle
├── extension.umd.js     # UMD bundle
└── manifest.json        # Extension manifest
```

### Create Deployment Package

```bash
npm run deploy
```

Creates a ZIP file: `releases/my-first-extension-v1.0.0-[git-hash].zip`

This ZIP contains everything ChurchTools needs to run your extension.

## Next Steps

Congratulations! You've created your first ChurchTools extension. Here's what to explore next:

### Learn Core Concepts
Read [Core Concepts](core-concepts.md) to understand:
- Extension points vs. entry points
- Extension point contracts
- Event communication patterns
- Type safety with TypeScript

### Add More Entry Points
Learn how to create different types of entry points:
- [Entry Points Guide](entry-points.md) - Detailed guide on entry points
- Admin configuration panels
- Calendar dialog enhancements
- Person detail sidebars

### Master Event Communication
Understand bidirectional communication:
- [Communication Guide](communication.md) - Event patterns and best practices

### Build and Deploy
Learn about build modes and deployment:
- [Build & Deploy](build-and-deploy.md) - Build modes, optimization, deployment

### Complete API Reference
- [API Reference](api-reference.md) - Complete API documentation
- [Manifest Reference](manifest.md) - Manifest.json documentation

## Common Issues

### Development Server Won't Start

**Issue**: `npm run dev` fails

**Solutions**:
1. Check Node.js version: `node --version` (should be v18+)
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check `.env` file exists and is configured correctly

### CORS Errors

**Issue**: "CORS policy" errors in browser console

**Solutions**:
1. Enable CORS in ChurchTools admin settings
2. Add `http://localhost:5173` to allowed origins
3. For Safari: use HTTPS dev server or proxy (see main README)

### Extension Not Hot-Reloading

**Issue**: Changes don't appear in browser

**Solutions**:
1. Check browser console for errors
2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Restart dev server

### API Calls Failing

**Issue**: API requests return 401 or errors

**Solutions**:
1. Verify credentials in `.env` are correct
2. Check user has permissions for the API endpoint
3. Look at browser Network tab for details
4. Ensure ChurchTools instance is accessible

### TypeScript Errors

**Issue**: Type errors in VS Code

**Solutions**:
1. Install `@churchtools/extension-points`: `npm install`
2. Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TypeScript Server")
3. Check imports are correct

## Tips for Success

### Use TypeScript

TypeScript provides excellent type safety:

```typescript
import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points';

// Fully typed entry point
const myEntry: EntryPoint<MainModuleData> = ({ data }) => {
  // data is fully typed!
  console.log(data.userId);
};
```

### Use the Browser DevTools

- **Console** - View logs and errors
- **Network** - Inspect API calls
- **Elements** - Debug DOM and styles
- **Application** - Check storage and cookies

### Test in Multiple Scenarios

Use the test environment to:
- Test with different context data
- Send various events to your extension
- Resize preview to test responsive design
- Monitor events in the event log

### Keep Entry Points Small

Break large features into smaller, focused entry points:
- Easier to test
- Better code organization
- More reusable

### Handle Errors Gracefully

Always wrap API calls in try-catch:

```typescript
try {
  const data = await churchtoolsClient.get('/api/persons');
  // handle success
} catch (error) {
  console.error('Error:', error);
  // show user-friendly error message
}
```

## Resources

- **[Core Concepts](core-concepts.md)** - Deep dive into extension architecture
- **[API Reference](api-reference.md)** - Complete API documentation
- **[ChurchTools Forum](https://forum.church.tools)** - Ask questions and get help
- **[ChurchTools API Docs](https://api.church.tools)** - Official API documentation

---

**Ready to learn more?** Continue with [Core Concepts](core-concepts.md) to deepen your understanding.
