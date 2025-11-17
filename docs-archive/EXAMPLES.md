# Build Modes Examples

This document provides practical examples comparing Simple and Advanced build modes.

## Build Output Comparison

### Simple Mode

```bash
$ npm run build:simple
Building in simple mode for key: multitest

dist/
├── extension.es.js   (3.59 KB) ← All code in one file
└── extension.umd.js  (3.44 KB) ← All code in one file
```

**Total:** 2 files, all entry points bundled together

### Advanced Mode

```bash
$ npm run build:advanced
Building in advanced mode for key: multitest

dist/
├── extension.es.js          (1.41 KB) ← Main bundle
├── welcome-[hash].js        (0.30 KB) ← Welcome entry point
├── user-info-[hash].js      (0.50 KB) ← User info entry point
├── data-viewer-[hash].js    (1.02 KB) ← Data viewer entry point
└── extension.umd.js         (3.44 KB) ← UMD (no splitting)
```

**Total:** 5 files, main bundle + 3 lazy-loaded chunks

**Note:** UMD format doesn't support code splitting, so it remains a single file in both modes.

---

## Usage Examples

### Simple Mode Usage

```javascript
// ChurchTools loads the extension
import { renderExtension, loadEntryPoint } from '/ccm/calendar/extension.es.js';

// Load entry point (returns immediately, already bundled)
const welcomeEntry = await loadEntryPoint('welcome');
await renderExtension('welcome-div', welcomeEntry);

// All entry points are in the initial bundle
const userEntry = await loadEntryPoint('userInfo');
await renderExtension('user-div', userEntry);
```

**Network Activity:**
```
1. GET /ccm/calendar/extension.es.js (3.59 KB) - Contains everything
Total: 1 request, 3.59 KB
```

---

### Advanced Mode Usage

```javascript
// ChurchTools loads the extension
import { renderExtension, loadEntryPoint } from '/ccm/calendar/extension.es.js';

// Load entry point (fetches chunk on demand)
const welcomeEntry = await loadEntryPoint('welcome');
await renderExtension('welcome-div', welcomeEntry);

// Load another entry point (fetches another chunk)
const userEntry = await loadEntryPoint('userInfo');
await renderExtension('user-div', userEntry);
```

**Network Activity:**
```
1. GET /ccm/calendar/extension.es.js (1.41 KB) - Main bundle
2. GET /ccm/calendar/welcome-[hash].js (0.30 KB) - Welcome chunk
3. GET /ccm/calendar/user-info-[hash].js (0.50 KB) - User info chunk
Total: 3 requests, 2.21 KB (if using 2 entry points)
```

**Savings:** 1.38 KB not loaded if only using 2 out of 3 entry points!

---

## Real-World Scenarios

### Scenario 1: Small Extension (3 Entry Points, 35KB Total)

#### Simple Mode
```
Initial Load: 35 KB (everything)
User navigates to page 1: 0 KB (already loaded)
User navigates to page 2: 0 KB (already loaded)
Total transferred: 35 KB
```

#### Advanced Mode
```
Initial Load: 5 KB (main bundle)
User navigates to page 1: 12 KB (1 entry point)
User navigates to page 2: 10 KB (1 entry point)
Total transferred: 27 KB
Extra requests: 2 HTTP requests
```

**Verdict:** Simple mode is better
- Reason: Small size, fewer requests, better caching
- Use simple mode

---

### Scenario 2: Large Extension (20 Entry Points, 250KB Total)

#### Simple Mode
```
Initial Load: 250 KB (everything)
User visits persons page: 0 KB (already loaded)
User visits calendar page: 0 KB (already loaded)
Total transferred: 250 KB
```

#### Advanced Mode
```
Initial Load: 15 KB (main bundle)
User visits persons page: 40 KB (person entry points)
User visits calendar page: 35 KB (calendar entry points)
Total transferred: 90 KB
Extra requests: 2 HTTP requests
```

**Verdict:** Advanced mode is better
- Reason: 160 KB savings, user likely doesn't use all features
- Use advanced mode

---

## ChurchTools Integration Patterns

### Pattern 1: Route-Based Loading (Advanced Mode Recommended)

```javascript
// ChurchTools main.js
import { renderExtension, loadEntryPoint } from '/ccm/myext/extension.es.js';

// Map routes to entry points
const routeConfig = {
  '/persons/:id': {
    divId: 'person-details',
    entryPoint: 'personDetails',
  },
  '/calendar': {
    divId: 'calendar-widget',
    entryPoint: 'calendarView',
  },
};

// Load entry point for current route
async function loadForCurrentRoute() {
  const route = window.location.pathname;
  const config = routeConfig[route];

  if (config) {
    const entryPoint = await loadEntryPoint(config.entryPoint);
    await renderExtension(config.divId, entryPoint);
  }
}

// Call when route changes
router.on('route', loadForCurrentRoute);
```

**Why Advanced Mode?**
- Only loads code for current page
- Each route loads independently
- Better performance for multi-page apps

---

### Pattern 2: Sidebar Widget (Simple Mode Recommended)

```javascript
// ChurchTools sidebar.js
import { renderExtension, loadEntryPoint } from '/ccm/widget/extension.es.js';

// Single small widget, always visible
async function initSidebar() {
  const entryPoint = await loadEntryPoint('sidebarWidget');
  await renderExtension('ct-sidebar-widget', entryPoint);
}

initSidebar();
```

**Why Simple Mode?**
- Widget is always visible
- Small size (< 30KB)
- Single entry point
- No benefit from splitting

---

### Pattern 3: Tab-Based Loading (Advanced Mode Recommended)

```javascript
// ChurchTools tabs.js
import { renderExtension, loadEntryPoint } from '/ccm/tabs/extension.es.js';

const tabs = {
  overview: { loaded: false, entryPoint: 'overviewTab' },
  details: { loaded: false, entryPoint: 'detailsTab' },
  history: { loaded: false, entryPoint: 'historyTab' },
};

// Load tab content on demand
async function showTab(tabName) {
  const tab = tabs[tabName];

  if (!tab.loaded) {
    const entryPoint = await loadEntryPoint(tab.entryPoint);
    await renderExtension(`tab-${tabName}`, entryPoint);
    tab.loaded = true;
  }

  // Show the tab
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// User clicks tab
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => showTab(button.dataset.tab));
});
```

**Why Advanced Mode?**
- User might not open all tabs
- Each tab is independent
- Lazy loading improves initial load

---

## Performance Metrics

### Simple Mode Performance

**Pros:**
- ✅ Single HTTP request
- ✅ Better caching (one file)
- ✅ No async loading complexity
- ✅ Predictable loading time

**Cons:**
- ❌ Large initial download
- ❌ Loads unused code
- ❌ Not optimal for slow connections

**Best for:**
- Small extensions (< 100KB)
- Extensions where all features are used
- Internal tools with fast networks

---

### Advanced Mode Performance

**Pros:**
- ✅ Small initial bundle
- ✅ Only loads what's needed
- ✅ Better for large extensions
- ✅ Optimal for diverse features

**Cons:**
- ❌ Multiple HTTP requests
- ❌ Async loading complexity
- ❌ Slightly slower if all features used

**Best for:**
- Large extensions (> 100KB)
- Extensions with many independent features
- Public-facing tools with varied usage

---

## API Usage Examples

### Example 1: Listing Available Entry Points

```javascript
import { getAvailableEntryPoints } from '/ccm/myext/extension.es.js';

// Get all registered entry points
const entryPoints = getAvailableEntryPoints();
console.log('Available entry points:', entryPoints);
// Output: ['welcome', 'userInfo', 'dataViewer']

// Generate UI dynamically
entryPoints.forEach(name => {
  const button = document.createElement('button');
  button.textContent = `Load ${name}`;
  button.onclick = async () => {
    const entryPoint = await loadEntryPoint(name);
    await renderExtension('dynamic-content', entryPoint);
  };
  document.body.appendChild(button);
});
```

---

### Example 2: Conditional Entry Point Loading

```javascript
import {
  renderExtension,
  loadEntryPoint,
  hasEntryPoint,
} from '/ccm/myext/extension.es.js';

// Check if premium features are available
async function loadPremiumFeature() {
  if (hasEntryPoint('premiumDashboard')) {
    const entryPoint = await loadEntryPoint('premiumDashboard');
    await renderExtension('dashboard', entryPoint);
  } else {
    // Fallback to basic dashboard
    const entryPoint = await loadEntryPoint('basicDashboard');
    await renderExtension('dashboard', entryPoint);
  }
}
```

---

### Example 3: Error Handling

```javascript
import { renderExtension, loadEntryPoint } from '/ccm/myext/extension.es.js';

async function safeLoadEntryPoint(divId, entryPointName) {
  try {
    const entryPoint = await loadEntryPoint(entryPointName);
    await renderExtension(divId, entryPoint);
  } catch (error) {
    console.error(`Failed to load ${entryPointName}:`, error);

    // Show error UI
    const element = document.getElementById(divId);
    element.innerHTML = `
      <div class="error">
        <p>Failed to load feature: ${error.message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Usage
safeLoadEntryPoint('my-div', 'dashboard');
```

---

### Example 4: Custom Entry Point Registration

```javascript
import {
  renderExtension,
  loadEntryPoint,
  registerEntryPoint,
} from '/ccm/myext/extension.es.js';

// Register a custom entry point at runtime
registerEntryPoint('customFeature', async () => {
  // Lazy load external module
  const module = await import('/external/custom-module.js');
  return module.customEntryPoint;
});

// Use it like any other entry point
const entryPoint = await loadEntryPoint('customFeature');
await renderExtension('custom-div', entryPoint);
```

---

## Debugging

### Check Build Mode

```javascript
// You can determine the mode by checking what's exported
import * as extension from '/ccm/myext/extension.es.js';

console.log('Extension exports:', Object.keys(extension));

// Simple mode: loadEntryPoint + renderExtension
// Advanced mode: loadEntryPoint + renderExtension (same API!)
```

### Monitor Network Requests

```javascript
// Track what gets loaded in advanced mode
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/ccm/')) {
    console.log('Loading chunk:', args[0]);
  }
  return originalFetch.apply(this, args);
};
```

### Performance Monitoring

```javascript
// Measure load time
const startTime = performance.now();

const entryPoint = await loadEntryPoint('dashboard');
await renderExtension('dashboard-div', entryPoint);

const loadTime = performance.now() - startTime;
console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
```

---

## Summary

| Scenario | Recommended Mode | Why |
|----------|-----------------|-----|
| Extension < 50KB | Simple | Small size, fewer requests |
| Extension > 100KB | Advanced | Significant savings possible |
| All features used | Simple | No wasted downloads |
| Selective feature usage | Advanced | Only load what's needed |
| Single page app | Simple | Everything needed upfront |
| Multi-page app | Advanced | Different pages = different code |
| Fast internal network | Simple | Request overhead negligible |
| Public/slow network | Advanced | Minimize initial load |

**When in doubt:** Start with simple mode, switch to advanced if bundle exceeds 50-100KB.
