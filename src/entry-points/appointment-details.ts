import type { EntryPoint } from '../lib/main';
import type { AppointmentDialogDetailData } from '@churchtools/extension-points/appointment-dialog-detail';
import { getModule, getCustomDataCategory, getCustomDataValues } from '../utils/kv-store';

/**
 * Appointment Details Entry Point
 *
 * Shows appointment details and demonstrates:
 * - Displaying appointment information
 * - Listening to appointment changes
 * - Updating appointment data
 * - Using settings from key-value store (background color)
 */

interface BackgroundColorSetting {
    key: string;
    value: string;
}

const AppointmentDetailsEntryPoint: EntryPoint<AppointmentDialogDetailData> = ({
    data,
    on,
    emit,
    element,
    KEY,
}) => {
    console.log('[AppointmentDetails] Initializing');
    console.log('[AppointmentDetails] Current appointment:', data.currentAppointment);
    console.log('[AppointmentDetails] Master data:', data.masterData);

    let currentAppointment = data.currentAppointment || {};
    let backgroundColor = '#ffffff'; // Default fallback
    let isLoading = true;

    // Initialize and load settings
    async function initialize() {
        try {
            // Load background color from settings
            await loadBackgroundColor();
            isLoading = false;
            render();
        } catch (error) {
            console.log('[AppointmentDetails] Could not load settings:', error);
            isLoading = false;
            render();
        }
    }

    // Load background color from key-value store
    async function loadBackgroundColor(): Promise<void> {
        try {
            // Get extension module
            const extensionModule = await getModule(KEY);

            // Find settings category
            const settingsCategory = await getCustomDataCategory<object>('settings');
            if (!settingsCategory) {
                console.log('[AppointmentDetails] No settings category found, using default background');
                return;
            }

            // Get values
            const values = await getCustomDataValues<BackgroundColorSetting>(
                settingsCategory.id,
                extensionModule.id
            );

            // Find backgroundColor value
            const bgColorValue = values.find((v) => v.key === 'backgroundColor');

            if (bgColorValue) {
                backgroundColor = bgColorValue.value || '#ffffff';
                console.log('[AppointmentDetails] Loaded background color:', backgroundColor);
            }
        } catch (error) {
            console.log('[AppointmentDetails] Could not load background color, using default:', error);
            // Fallback to white if settings not found
            backgroundColor = '#ffffff';
        }
    }

    // Listen to appointment changes
    on('appointment:changed', (newData) => {
        console.log('[AppointmentDetails] Appointment changed:', newData);
        currentAppointment = newData;
        render();
    });

    // Listen to dialog closing
    on('dialog:closing', () => {
        console.log('[AppointmentDetails] Dialog is closing');
    });

    // Render UI
    function render() {
        if (isLoading) {
            element.innerHTML = `
                <div style="padding: 1.5rem; text-align: center; color: #666;">
                    <p>Loading...</p>
                </div>
            `;
            return;
        }
        element.innerHTML = `
            <div style="padding: 1.5rem; background: ${backgroundColor}; border-radius: 4px;">
                <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #333;">Appointment Details (as JSON)</h3>

                <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(255, 255, 255, 0.9); border-radius: 4px;">
                    <h4 style="margin: 0 0 0.75rem 0; font-size: 0.95rem; color: #555;">Current Appointment</h4>
                    <pre style="margin: 0; padding: 0.75rem; background: #fff; border: 1px solid #dee2e6; border-radius: 4px; font-size: 0.85rem; overflow-x: auto;">${JSON.stringify(currentAppointment, null, 2)}</pre>
                </div>

                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #e7f3ff; border-left: 4px solid #007bff; border-radius: 4px;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #004085;">💡 Demo Actions</h4>
                    <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #004085;">
                        This extension point can display custom appointment information and interact with the dialog.
                    </p>
                    <button
                        id="update-notes-btn"
                        style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; margin-right: 0.5rem;"
                    >
                        Add Note to Appointment
                    </button>
                    <button
                        id="log-data-btn"
                        style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;"
                    >
                        Log Current Data
                    </button>
                </div>

                <div style="padding: 1rem; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #856404;">ℹ️ Integration Point</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #856404;">
                        This entry point is rendered in the appointment edit dialog, below the standard fields.
                        It can read appointment data, listen to changes, and update the appointment.
                    </p>
                </div>

                <div style="padding: 1rem; background: rgba(255, 255, 255, 0.9); border-radius: 4px;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #495057;">🎨 Background Color</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #6c757d;">
                        This view uses the background color configured in the admin settings.
                        Current value: <code style="background: #fff; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace;">${backgroundColor}</code>
                    </p>
                </div>
            </div>
        `;

        attachEventHandlers();
    }

    // Attach event handlers
    function attachEventHandlers() {
        const updateNotesBtn = element.querySelector('#update-notes-btn');
        const logDataBtn = element.querySelector('#log-data-btn');

        if (updateNotesBtn) {
            updateNotesBtn.addEventListener('click', () => {
                const timestamp = new Date().toLocaleTimeString();
                const updatedAppointment = {
                    ...currentAppointment,
                    note: `${(currentAppointment as any).note || ''}\nUpdated by extension at ${timestamp}`.trim(),
                };

                console.log('[AppointmentDetails] Emitting appointment:update', updatedAppointment);
                emit('appointment:update', updatedAppointment);
            });
        }

        if (logDataBtn) {
            logDataBtn.addEventListener('click', () => {
                console.log('[AppointmentDetails] Current appointment:', currentAppointment);
                console.log('[AppointmentDetails] Master data:', data.masterData);
                alert('Data logged to console. Check the browser console for details.');
            });
        }
    }

    // Initialize on load
    initialize();

    // Cleanup function
    return () => {
        console.log('[AppointmentDetails] Cleaning up');
    };
};

// Named export for simple mode
export { AppointmentDetailsEntryPoint };

// Default export for advanced mode
export default AppointmentDetailsEntryPoint;
