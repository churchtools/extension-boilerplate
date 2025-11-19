# Extension Manifest Guide

This guide explains the `manifest.json` file that describes your extension to ChurchTools.

## Overview

The `manifest.json` file is the central configuration for your extension. ChurchTools reads this file to:
- Identify your extension
- Display information in the extension store
- Know which extension points your extension supports
- Load the correct entry points
- Check permissions and compatibility

## Location

```
extension-boilerplate/
├── manifest.json          ← Source manifest (edit this)
├── dist/
│   └── manifest.json      ← Copied during build (automatically)
└── releases/
    └── extension-v1.0.0.zip  (contains dist/manifest.json)
```

**Important:** Edit `manifest.json` in the root directory. It's automatically copied to `dist/` during build.

## Basic Structure

```json
{
  "name": "My Extension",
  "key": "my-extension",
  "version": "1.0.0",
  "description": "What this extension does",
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

## Field Reference

### Required Fields

#### `name` (string, required)
**Human-readable name** of your extension shown in the ChurchTools UI.

```json
"name": "Calendar Availability Checker"
```

- Max length: 100 characters
- Used in: Extension store, admin UI, user-facing interfaces

---

#### `key` (string, required)
**Unique identifier** for your extension (used internally by ChurchTools).

```json
"key": "calendar-availability"
```

- **Must be unique** across all ChurchTools extensions
- Lowercase letters, numbers, and hyphens only
- Pattern: `^[a-z0-9-]+$`
- Max length: 50 characters
- Used for: File paths (`/ccm/{key}/`), database keys, API references

**Important:** Once published, do not change the key! It's used to identify your extension.

---

#### `version` (string, required)
**Semantic version** of your extension.

```json
"version": "1.2.3"
```

- Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- Supports pre-release: `1.0.0-beta.1`, `2.0.0-rc.2`
- ChurchTools uses this for update notifications

**Versioning guide:**
- `MAJOR` - Breaking changes (incompatible API changes)
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes (backward compatible)

---

#### `description` (string, required)
**Brief description** of what your extension does.

```json
"description": "Shows user availability and suggests alternative meeting times in calendar dialogs"
```

- Min length: 10 characters
- Max length: 500 characters
- Used in: Extension store, search results

---

#### `author` (object, required)
**Information about the developer** or organization.

```json
"author": {
  "name": "John Doe",
  "email": "john@example.com",
  "url": "https://johndoe.dev"
}
```

**Fields:**
- `name` (string, required) - Developer/organization name
- `email` (string, optional) - Contact email
- `url` (string, optional) - Developer website

---

### Optional Fields

#### `homepage` (string)
**URL to extension documentation** or homepage.

```json
"homepage": "https://github.com/yourname/calendar-extension"
```

Used for: "Learn more" links in ChurchTools UI

---

#### `repository` (object)
**Source code repository** information.

```json
"repository": {
  "type": "git",
  "url": "https://github.com/yourname/calendar-extension.git"
}
```

---

#### `license` (string)
**License identifier** (SPDX format).

```json
"license": "MIT"
```

Common values: `MIT`, `Apache-2.0`, `GPL-3.0`, `BSD-3-Clause`, `proprietary`

---

#### `icon` (string)
**URL to extension icon/logo** for the ChurchTools store.

```json
"icon": "https://cdn.example.com/my-extension-icon.png"
```

- Recommended size: 256x256px
- Formats: PNG, JPG, SVG
- Used in: Extension store, admin UI

---

#### `images` (array)
**URL to extension screenshots/images** for the ChurchTools store.

```json
"images": ["https://cdn.example.com/my-extension-screen1.png"]
```

- Recommended size: 1920x1024px
- Formats: PNG, JPG, SVG
- Used in: Extension store

---

### Extension Integration

#### `extensionPoints` (array, required for integration)
**List of ChurchTools extension points** your extension integrates with.

```json
"extensionPoints": [
  {
    "id": "calendar-dialog-availability",
    "entryPoint": "calendarAvailability",
    "title": "Availability Checker",
    "description": "Shows availability and suggests times",
    "enabled": true
  },
  {
    "id": "person-details-sidebar",
    "entryPoint": "personSidebar",
    "title": "External Data Sync",
    "description": "Shows synced data from external systems"
  }
]
```

**Each entry point object:**

- **`id`** (string, required) - ChurchTools extension point identifier
  - Defined by ChurchTools (see Extension Point Registry below)
  - Examples: `calendar-dialog-availability`, `person-details-sidebar`

- **`entryPoint`** (string, required) - Name of entry point in your extension
  - Must match an entry point registered in `src/entry-points/index.ts`
  - Examples: `calendarAvailability`, `personSidebar`

- **`title`** (string, optional) - Human-readable title for this integration
  - Shown in ChurchTools admin UI

- **`description`** (string, optional) - What this integration provides
  - Helps admins understand the feature

**Example mapping:**

```
ChurchTools Extension Point ID → Your Entry Point
────────────────────────────────────────────────
"calendar-dialog-availability" → "calendarAvailability"
"person-details-sidebar"       → "personSidebar"
"event-list-actions"           → "eventActions"
```

---

#### `permissions` (array)
**Permissions required** by your extension.

```json
"permissions": [
  "churchdb view",
  "churchdb create person",
]
```

ChurchTools will:
- Show permissions during installation
- Allow admins to review what extensions can access

---

## Extension Point Registry

ChurchTools will provide official documentation for all available extension points. The documuentation is located here:
- **[ChurchTools Extension Points](https://github.com/churchtools/churchtools-extension-points)** - Extension point contracts (type definitions and events)

Here are examples:

### Module Extension Points

**`main`**
- **Location:** ChurchTools main menu → Extension module
- **Purpose:** Render extension as a standalone module with its own menu entry
- **Data:** `{}`
- **Events:** none

**`admin`**
- **Location:** Admin → Extensions → Extension Settings
- **Purpose:** Render admin configuration interface for the extension
- **Data:** `{ extensionInfo }`
- **Events:** none

### Calendar Extension Points (examples)

**`calendar-dialog-availability`**
- **Location:** Calendar event edit dialog
- **Purpose:** Show availability, suggest alternative times
- **Data:** `{ currentAppointment, masterData }`
- **Events:** `appointment:changed`, `dialog:closing`

**`calendar-event-list-item`**
- **Location:** Calendar event list view
- **Purpose:** Add custom badges, icons, or actions to events
- **Data:** `{ eventId, eventTitle, startDate, endDate }`

### Person Extension Points (examples)

**`person-details-sidebar`**
- **Location:** Person details page, right sidebar
- **Purpose:** Display additional information or actions
- **Data:** `{ personId, firstName, lastName, email }`
- **Events:** `person:updated`, `person:changed`

**`person-list-actions`**
- **Location:** Person list view, action menu
- **Purpose:** Add custom bulk actions
- **Data:** `{ selectedPersonIds }`

### Event Extension Points (examples)

**`event-registration-form`**
- **Location:** Event registration form
- **Purpose:** Add custom fields or validation
- **Data:** `{ eventId, currentFormData }`

---

## Complete Example

```json
{
  "$schema": "./manifest.schema.json",
  "name": "Advanced Calendar Tools",
  "key": "advanced-calendar",
  "version": "2.1.0",
  "description": "Enhances ChurchTools calendar with availability checking, smart scheduling, and external calendar sync",
  "author": {
    "name": "Calendar Solutions Inc",
    "email": "support@calendarsolutions.com",
    "url": "https://calendarsolutions.com"
  },
  "homepage": "https://github.com/calendar-solutions/ct-advanced-calendar",
  "repository": {
    "type": "git",
    "url": "https://github.com/calendar-solutions/ct-advanced-calendar.git"
  },
  "license": "MIT",
  "logo": "https://calendarsolutions.com/assets/ct-extension-icon.png",
  "images": ["https://calendarsolutions.com/assets/ct-extension-screen1.png"],
  "extensionPoints": [
    {
      "id": "main",
      "entryPoint": "mainModule",
      "title": "Calendar Tools Module",
      "description": "Main dashboard with calendar tools and analytics",
    },
    {
      "id": "admin",
      "entryPoint": "adminPanel",
      "title": "Calendar Tools Settings",
      "description": "Configure API keys and sync settings"
    },
    {
      "id": "calendar-dialog-availability",
      "entryPoint": "availabilityChecker",
      "title": "Availability Checker",
      "description": "Shows team member availability and suggests optimal meeting times",
    },
    {
      "id": "calendar-event-list-item",
      "entryPoint": "syncStatusBadge",
      "title": "Sync Status Indicator",
      "description": "Shows external calendar sync status for each event"
    },
    {
      "id": "person-details-sidebar",
      "entryPoint": "externalCalendarLink",
      "title": "External Calendar",
      "description": "Links to person's external calendar (Google/Outlook)"
    }
  ],
  "permissions": [
    "churchcal view",
  ],
  "settings": {
    "googleCalendarApiKey": {
      "type": "string",
      "label": "Google Calendar API Key",
      "description": "API key for Google Calendar integration",
      "required": false
    },
    "outlookClientId": {
      "type": "string",
      "label": "Microsoft Outlook Client ID",
      "required": false
    },
    "defaultWorkHours": {
      "type": "object",
      "label": "Default Work Hours",
      "properties": {
        "start": {
          "type": "string",
          "default": "09:00"
        },
        "end": {
          "type": "string",
          "default": "17:00"
        }
      }
    }
  }
}
```

## Build Process

### 1. Edit Manifest

Edit `manifest.json` in the root directory:

```bash
nano manifest.json
```

### 2. Build Extension

The manifest is automatically copied to `dist/` during build:

```bash
npm run build
```

Output:
```
Building in simple mode for key: advanced-calendar
✓ built in 54ms
✓ Copied manifest.json to dist/
```

### 3. Create Package

Create deployable ZIP:

```bash
npm run deploy
```

Output:
```
📦 Creating ChurchTools extension package...
   Extension: Advanced Calendar Tools
   Key: advanced-calendar
   Version: 2.1.0
   Git Hash: a1b2c3d
   Archive: advanced-calendar-v2.1.0-a1b2c3d.zip
✓ manifest.json found in dist/
✅ Package created successfully!
```

The ZIP contains:
```
advanced-calendar-v2.1.0-a1b2c3d.zip
├── dist/
│   ├── manifest.json          ← Your manifest
│   ├── extension.es.js
│   ├── extension.umd.js
│   └── [entry point chunks]
```

## ChurchTools Integration

When you upload the ZIP to ChurchTools, it will:

1. **Extract** the ZIP
2. **Read** `dist/manifest.json`
3. **Validate** the manifest structure
4. **Check** compatibility (min/max versions)
5. **Display** extension info to admin
6**Install** extension to `/ccm/{key}/` or `/extensions/{key}/`

## Validation

### Schema Validation

Your `manifest.json` references the schema for validation:

```json
{
  "$schema": "./manifest.schema.json",
  ...
}
```

Many IDEs (VS Code, IntelliJ) will provide:
- ✅ Auto-completion
- ✅ Field descriptions
- ✅ Validation errors

### Manual Validation

You can validate manually:

```bash
# Using a JSON schema validator
npx ajv-cli validate -s manifest.schema.json -d manifest.json
```

## Best Practices

### ✅ DO

1. **Use semantic versioning** - Increment version appropriately
2. **Document permissions** - Only request needed permissions
3. **Provide good descriptions** - Help users understand your extension
4. **Test manifest changes** - Build and check dist/manifest.json
5. **Keep key stable** - Never change after publishing
6. **Specify min version** - Prevent installation on incompatible versions

### ❌ DON'T

1. **Don't change `key`** after publishing
2. **Don't skip version bumps** - Update version for every release
3. **Don't request unnecessary permissions** - Be minimal
4. **Don't use vague descriptions** - Be specific about features
5. **Don't forget to rebuild** - Manifest changes require rebuild

## Troubleshooting

### Manifest not in dist/

**Problem:** `dist/manifest.json` not found after build

**Solution:**
1. Check `manifest.json` exists in root
2. Rebuild: `npm run build`
3. Check vite plugin ran (look for "✓ Copied manifest.json")

### Invalid manifest error

**Problem:** ChurchTools rejects manifest on upload

**Solution:**
1. Validate against schema
2. Check all required fields present
3. Verify `key` format (lowercase, alphanumeric, hyphens)
4. Check version format (semantic versioning)

### Entry point not found

**Problem:** ChurchTools can't load entry point

**Solution:**
1. Check `entryPoint` name matches name in `src/loaders.ts`
2. Verify entry point is registered in registry
3. Rebuild extension

## See Also

- **[EXTENSION_COMMUNICATION.md](EXTENSION_COMMUNICATION.md)** - Extension point contracts and communication
- **[BUILD_MODES.md](BUILD_MODES.md)** - Build modes (simple vs advanced)
- **[USAGE.md](USAGE.md)** - General usage guide

## Summary

**Manifest essentials:**
1. Edit `manifest.json` in root
2. Set unique `key` and never change it
3. List all extension points with entry point names
4. Build copies manifest to dist/ automatically
5. Deploy creates ZIP with manifest included
6. ChurchTools reads manifest to understand your extension

**Result:** ChurchTools knows exactly what your extension does, where it integrates, and how to load it!
