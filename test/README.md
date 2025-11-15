# Extension Point Test Data

This directory contains test data and configurations for extension points in the development environment.

## Overview

When developing extension points (except `main` and `admin`), the test environment provides:
- **Context Data Editor**: Edit the data passed to your entry point
- **Event Bus Testing**: Send events to your extension and log all events received
- **Preview Size Control**: Test responsive behavior with adjustable dimensions
- **Surrounding HTML**: Simulate the real ChurchTools UI context

## Adding Test Data

To add test data for a new extension point, edit `extension-point-test-data.ts`:

```typescript
export const extensionPointTestData: Record<string, ExtensionPointTestData> = {
    'your-extension-point-id': {
        // Required: Default context data for the entry point
        defaultData: {
            // Match the data structure from the extension point contract
            someData: 'example',
        },

        // Optional: Sample data for events FROM ChurchTools to your extension
        // These appear in the "Send Event" dropdown with pre-filled sample data
        eventsData: {
            'event:name': {
                // Sample event data
                exampleField: 'value',
            },
            'event:withoutData': null,
        },

        // Optional: Default preview dimensions
        defaultSize: { width: 600, height: 400 },

        // Optional: HTML template to wrap your entry point
        // MUST include a <div id="preview-content"></div> where the entry point will render
        surroundingHtml: `
            <div style="padding: 1rem;">
                <h2>Simulated Dialog</h2>
                <div id="preview-content"></div>
            </div>
        `,
    },
};
```

## Extension Point Test Data Structure

### `defaultData` (required)
The initial context data passed to your entry point. This should match the data structure defined in the extension point contract from `@churchtools/extension-points`.

### `eventsData` (optional)
Sample data for events that ChurchTools can send TO your extension. The **event names** are automatically populated from the extension point contract in `@churchtools/extension-points`, so you only need to provide sample data here.

When you select an event from the dropdown, if sample data is defined here, it will be pre-filled in the event data textarea.

**Note:** All events emitted FROM your extension will be automatically logged in the Event Log, regardless of test data configuration.

### `defaultSize` (optional)
Initial preview dimensions in pixels. The preview frame is also manually resizable via drag handles and can be adjusted through width/height inputs.

### `surroundingHtml` (optional)
An HTML template string that wraps your entry point in surrounding context. This allows you to simulate the real ChurchTools UI where your extension will be embedded.

**Important:** The HTML template MUST include a `<div id="preview-content"></div>` element. Your entry point will be rendered into this div. The surrounding HTML is applied to the DOM before your entry point is rendered, allowing your entry point to interact with the surrounding DOM if needed.

## Example: Appointment Dialog Detail

The `appointment-dialog-detail` extension point shows a complete example:

- **defaultData**: Contains `currentAppointment` and `masterData` objects matching the contract
- **eventsData**: Includes sample data for `appointment:changed` and `dialog:closing` events
- **defaultSize**: 600x400 pixels
- **surroundingHtml**: Wraps the extension in a mock appointment edit dialog with form fields

## Working with the Test Environment

### Context Data
- The textarea is pre-filled with `defaultData` when you first load an entry point
- You can edit the JSON to test different scenarios
- Click "Reload Entry Point" to re-render with your modified data
- **The textarea content is preserved when you reload** - your changes won't be lost

### Event Bus
- **Sending Events**: Select an event from the dropdown, optionally edit the JSON data, and click "Send Event"
- **Receiving Events**: ALL events emitted by your extension are automatically logged with timestamp, event name, and data
- The event log helps you debug bidirectional communication

### Preview Size
- Use width/height inputs and "Apply Size" button for precise dimensions
- The preview frame also supports manual resizing via drag handles
- Test responsive behavior at different viewport sizes

### Surrounding HTML
- Simulates the real UI context where your extension will be embedded
- Your entry point can access and modify the surrounding DOM if needed
- The `#preview-content` div is where your extension renders by default

## Working Without Test Data

The test environment is designed to work even if you haven't defined test data for an extension point:

- **Context Data**: Defaults to `{}` (empty object) if no `defaultData` is specified
- **Events**: Event names are automatically populated from the extension point contract (from `@churchtools/extension-points`)
- **Event Data**: You can manually enter event data as JSON, even without sample data defined
- **Preview Size**: Defaults to 600x400 pixels
- **Event Logging**: ALL events emitted by your extension are logged automatically

This means you can test any extension point immediately, even before creating test data configuration. The event names come directly from the TypeScript contract definition, ensuring your test environment matches the real ChurchTools behavior.

## Notes

- The `main` and `admin` entry points use full-width rendering and don't need test data configurations
- Test data is only used in development mode (`npm run dev`)
- Changes to test data files take effect immediately with hot reload
- Event logging captures all events, providing complete visibility into extension behavior
- Test data is optional but recommended for a better developer experience
