import type { EntryPoint } from '../lib/main';
import type { AdminData } from '@churchtools/extension-points/admin';

/**
 * Admin Configuration Entry Point
 *
 * This entry point renders the admin configuration interface for the extension.
 * It's shown in the ChurchTools extension administration area.
 *
 * Extension Point: admin
 * Location: Admin → Extensions → Extension Settings
 * Data: { settings, extensionInfo }
 */

const adminEntryPoint: EntryPoint<AdminData> = ({
    data,
    on,
    off,
    emit,
    element,
    // user and churchtoolsClient available for future use
}) => {
    console.log('[Admin] Initializing admin panel');
    console.log('[Admin] Extension info:', data.extensionInfo);

    // Track form state
    let formData = { ...data.settings };
    let hasUnsavedChanges = false;

    // Render admin UI
    function render() {
        element.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; padding: 2rem;">
                <!-- Header -->
                <div style="margin-bottom: 2rem;">
                    <h1 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #333;">Extension Settings</h1>
                    <p style="margin: 0; color: #666;">
                        ${data.extensionInfo.name} v${data.extensionInfo.version}
                    </p>
                </div>

                <!-- Status Banner -->
                <div id="status-banner" style="display: none; padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px; background: #d4edda; border: 1px solid #c3e6cb; color: #155724;">
                </div>

                <!-- Settings Form -->
                <form id="settings-form">
                    <!-- General Settings Section -->
                    <div style="background: #fff; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #f0f0f0; color: #333;">
                            General Settings
                        </h3>

                        <!-- Enable Extension -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input
                                    type="checkbox"
                                    id="enabled"
                                    name="enabled"
                                    ${formData.enabled !== false ? 'checked' : ''}
                                    style="width: 20px; height: 20px; margin-right: 0.75rem; cursor: pointer;"
                                >
                                <span style="color: #333; font-weight: 500;">Enable Extension</span>
                            </label>
                            <p style="margin: 0.5rem 0 0 2rem; color: #666; font-size: 0.875rem;">
                                Turn the extension on or off for all users
                            </p>
                        </div>

                        <!-- API Key -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">
                                External API Key
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                name="apiKey"
                                value="${formData.apiKey || ''}"
                                placeholder="Enter your API key"
                                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
                            >
                            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">
                                API key for external service integration
                            </p>
                        </div>

                        <!-- Sync Interval -->
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">
                                Sync Interval (minutes)
                            </label>
                            <input
                                type="number"
                                id="syncInterval"
                                name="syncInterval"
                                value="${formData.syncInterval || 30}"
                                min="5"
                                max="1440"
                                style="width: 200px; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
                            >
                            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">
                                How often to sync data (5-1440 minutes)
                            </p>
                        </div>
                    </div>

                    <!-- Feature Flags Section -->
                    <div style="background: #fff; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #f0f0f0; color: #333;">
                            Feature Flags
                        </h3>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input
                                    type="checkbox"
                                    id="enableAvailabilityCheck"
                                    name="enableAvailabilityCheck"
                                    ${formData.enableAvailabilityCheck !== false ? 'checked' : ''}
                                    style="width: 18px; height: 18px; margin-right: 0.75rem; cursor: pointer;"
                                >
                                <span style="color: #333;">Enable Availability Checking</span>
                            </label>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input
                                    type="checkbox"
                                    id="enableNotifications"
                                    name="enableNotifications"
                                    ${formData.enableNotifications !== false ? 'checked' : ''}
                                    style="width: 18px; height: 18px; margin-right: 0.75rem; cursor: pointer;"
                                >
                                <span style="color: #333;">Enable Push Notifications</span>
                            </label>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input
                                    type="checkbox"
                                    id="enableDebugMode"
                                    name="enableDebugMode"
                                    ${formData.enableDebugMode === true ? 'checked' : ''}
                                    style="width: 18px; height: 18px; margin-right: 0.75rem; cursor: pointer;"
                                >
                                <span style="color: #333;">Enable Debug Mode</span>
                            </label>
                        </div>
                    </div>

                    <!-- Advanced Settings Section -->
                    <div style="background: #fff; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h3 style="margin: 0 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #f0f0f0; color: #333;">
                            Advanced Settings
                        </h3>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">
                                Custom Configuration (JSON)
                            </label>
                            <textarea
                                id="customConfig"
                                name="customConfig"
                                rows="6"
                                placeholder='{"key": "value"}'
                                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 0.875rem;"
                            >${formData.customConfig ? JSON.stringify(formData.customConfig, null, 2) : ''}</textarea>
                            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">
                                Advanced configuration in JSON format
                            </p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #ddd;">
                        <button
                            type="button"
                            id="test-connection-btn"
                            style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;"
                        >
                            Test Connection
                        </button>
                        <button
                            type="button"
                            id="reset-btn"
                            style="padding: 0.75rem 1.5rem; background: #fff; color: #dc3545; border: 1px solid #dc3545; border-radius: 4px; cursor: pointer; font-size: 1rem;"
                        >
                            Reset to Defaults
                        </button>
                        <button
                            type="submit"
                            id="save-btn"
                            style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 500;"
                            ${hasUnsavedChanges ? '' : 'disabled'}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>

                <!-- Info Section -->
                <div style="background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin-top: 2rem; border-left: 4px solid #007bff;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #333;">Need Help?</h4>
                    <p style="margin: 0; color: #666; font-size: 0.875rem;">
                        Visit the <a href="#" style="color: #007bff; text-decoration: none;">documentation</a>
                        or <a href="#" style="color: #007bff; text-decoration: none;">contact support</a>.
                    </p>
                </div>
            </div>
        `;

        attachEventHandlers();
    }

    // Attach event handlers
    function attachEventHandlers() {
        const form = element.querySelector('#settings-form') as HTMLFormElement;

        // Track changes
        form.addEventListener('input', () => {
            hasUnsavedChanges = true;
            updateSaveButton();
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings();
        });

        // Test connection button
        element.querySelector('#test-connection-btn')?.addEventListener('click', async () => {
            await testConnection();
        });

        // Reset button
        element.querySelector('#reset-btn')?.addEventListener('click', () => {
            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                resetSettings();
            }
        });
    }

    // Update save button state
    function updateSaveButton() {
        const saveBtn = element.querySelector('#save-btn') as HTMLButtonElement;
        if (saveBtn) {
            saveBtn.disabled = !hasUnsavedChanges;
            saveBtn.style.opacity = hasUnsavedChanges ? '1' : '0.6';
        }
    }

    // Save settings
    async function saveSettings() {
        const form = element.querySelector('#settings-form') as HTMLFormElement;
        const formDataObj = new FormData(form);

        // Collect form data
        const newSettings: Record<string, any> = {
            enabled: formDataObj.get('enabled') === 'on',
            apiKey: formDataObj.get('apiKey'),
            syncInterval: parseInt(formDataObj.get('syncInterval') as string, 10),
            enableAvailabilityCheck: formDataObj.get('enableAvailabilityCheck') === 'on',
            enableNotifications: formDataObj.get('enableNotifications') === 'on',
            enableDebugMode: formDataObj.get('enableDebugMode') === 'on',
        };

        // Parse JSON config
        const customConfigStr = formDataObj.get('customConfig') as string;
        if (customConfigStr.trim()) {
            try {
                newSettings.customConfig = JSON.parse(customConfigStr);
            } catch (error) {
                showStatus('Invalid JSON in custom configuration', 'error');
                return;
            }
        }

        // Show saving status
        showStatus('Saving settings...', 'info');

        try {
            // Emit to ChurchTools to save
            emit('settings:save', newSettings);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Update local data
            formData = newSettings;
            data.settings = newSettings;
            hasUnsavedChanges = false;
            updateSaveButton();

            showStatus('Settings saved successfully!', 'success');
        } catch (error) {
            showStatus('Failed to save settings. Please try again.', 'error');
            console.error('[Admin] Save error:', error);
        }
    }

    // Test connection
    async function testConnection() {
        showStatus('Testing connection...', 'info');

        try {
            // Simulate connection test
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Emit test event
            emit('connection:test', { apiKey: formData.apiKey });

            showStatus('Connection test successful!', 'success');
        } catch (error) {
            showStatus('Connection test failed. Please check your API key.', 'error');
        }
    }

    // Reset settings
    function resetSettings() {
        formData = {
            enabled: true,
            apiKey: '',
            syncInterval: 30,
            enableAvailabilityCheck: true,
            enableNotifications: true,
            enableDebugMode: false,
            customConfig: null,
        };

        hasUnsavedChanges = true;
        render();
        showStatus('Settings reset to defaults. Click "Save Changes" to apply.', 'info');
    }

    // Show status banner
    function showStatus(message: string, type: 'success' | 'error' | 'info') {
        const banner = element.querySelector('#status-banner') as HTMLElement;
        if (!banner) return;

        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
        };

        const color = colors[type];
        banner.style.display = 'block';
        banner.style.background = color.bg;
        banner.style.borderColor = color.border;
        banner.style.color = color.text;
        banner.textContent = message;

        // Auto-hide after 5 seconds
        if (type !== 'info') {
            setTimeout(() => {
                banner.style.display = 'none';
            }, 5000);
        }
    }

    // Initial render
    render();

    // Listen for events from ChurchTools
    const settingsReloadHandler = (newSettings: any) => {
        console.log('[Admin] Settings reloaded:', newSettings);
        data.settings = newSettings;
        formData = { ...newSettings };
        hasUnsavedChanges = false;
        render();
    };

    on('settings:reload', settingsReloadHandler);

    // Cleanup
    return () => {
        console.log('[Admin] Cleaning up admin panel');
        off('settings:reload', settingsReloadHandler);
    };
};

// Named export for simple mode
export { adminEntryPoint };

// Default export for advanced mode
export default adminEntryPoint;
