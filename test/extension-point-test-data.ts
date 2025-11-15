/**
 * Extension Point Test Data
 *
 * This file defines test data and configurations for extension points in the development environment.
 * Each entry point (except main and admin) should have test data here that defines:
 * - defaultData: The initial context data for the entry point
 * - eventsData: Sample data for events that ChurchTools can send to the extension
 * - defaultSize: Initial preview dimensions (width x height)
 * - surroundingHtml: Optional HTML template to wrap the entry point in context
 */

export interface ExtensionPointTestData {
    /** Default context data for the entry point */
    defaultData: any;
    /** Sample data for events FROM ChurchTools to extension */
    eventsData?: Record<string, any>;
    /** Default preview size */
    defaultSize?: { width: number; height: number };
    /**
     * Optional HTML template to wrap entry point in surrounding context.
     * Must include a div with id="preview-content" where the entry point will be rendered.
     */
    surroundingHtml?: string;
}

/**
 * Test data registry
 * Key: extension point ID from manifest.json
 */
export const extensionPointTestData: Record<string, ExtensionPointTestData> = {
    /**
     * Appointment Dialog Detail Extension Point
     * Location: Calendar appointment edit dialog, below appointment fields
     */
    'appointment-dialog-detail': {
        defaultData: {
            currentAppointment: {
                id: 123,
                caption: 'Team Meeting',
                startDate: '2024-01-15T10:00:00',
                endDate: '2024-01-15T11:00:00',
                note: 'Discuss project progress',
            },
            masterData: {
                categories: [],
                calendars: [],
            },
        },
        eventsData: {
            'appointment:changed': {
                id: 123,
                caption: 'Updated Team Meeting',
                startDate: '2024-01-15T14:00:00',
                endDate: '2024-01-15T15:00:00',
            },
            'dialog:closing': null,
        },
        defaultSize: { width: 600, height: 400 },
        surroundingHtml: `
            <div style="background: #f5f5f5; padding: 1.5rem; min-height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto;">
                    <div style="padding: 1.5rem; border-bottom: 1px solid #dee2e6;">
                        <h2 style="margin: 0; font-size: 1.3rem;">Edit Appointment</h2>
                    </div>
                    <div style="padding: 1.5rem;">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Title</label>
                            <input type="text" value="Team Meeting" style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Start</label>
                                <input type="datetime-local" value="2024-01-15T10:00" style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">End</label>
                                <input type="datetime-local" value="2024-01-15T11:00" style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px;">
                            </div>
                        </div>
                        <div style="border-top: 1px solid #dee2e6; padding-top: 1rem; margin-top: 1rem;">
                            <div id="preview-content"></div>
                        </div>
                    </div>
                </div>
            </div>
        `,
    },

    // Add more extension point test data here as needed
};
