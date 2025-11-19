import type { EntryPoint } from '../lib/main';
import type { AdminData } from '@churchtools/extension-points/admin';
import type { CustomModuleDataCategory, CustomModuleDataValue } from '../utils/ct-types';
import {
    getOrCreateModule,
    getCustomDataCategory,
    createCustomDataCategory,
    getCustomDataValues,
    createCustomDataValue,
    updateCustomDataValue,
} from '../utils/kv-store';

/**
 * Admin Configuration Entry Point
 *
 * Simple demo: Configure background color for all entry points.
 * Settings are stored in ChurchTools extension key-value store.
 */

interface BackgroundColorSetting {
    key: string;
    value: string;
}

const adminEntryPoint: EntryPoint<AdminData> = ({ data, emit, element, KEY }) => {
    console.log('[Admin] Initializing');
    console.log('[Admin] Extension info:', data.extensionInfo);

    let moduleId: number | null = null;
    let settingsCategory: CustomModuleDataCategory | null = null;
    let backgroundColorValue: CustomModuleDataValue | null = null;
    let currentBackgroundColor = '#ffffff';

    // UI State
    let isLoading = true;
    let errorMessage = '';

    // Initialize and load settings
    async function initialize() {
        try {
            isLoading = true;
            render();

            // Step 1: Get the extension module
            const extensionModule = await getOrCreateModule(
                KEY,
                data.extensionInfo?.name || 'Extension',
                data.extensionInfo?.description || 'A ChurchTools Extension'
            );
            moduleId = extensionModule.id;
            console.log('[Admin] Extension module:', extensionModule);

            // Step 2: Get or create the settings category
            settingsCategory = await getOrCreateSettingsCategory();
            console.log('[Admin] Settings category:', settingsCategory);

            // Step 3: Load background color setting
            await loadBackgroundColor(settingsCategory.id);

            isLoading = false;
            errorMessage = '';
            render();
        } catch (error) {
            console.error('[Admin] Initialization error:', error);
            isLoading = false;
            errorMessage = error instanceof Error ? error.message : 'Failed to initialize';
            render();
        }
    }

    // Get or create the "settings" category
    async function getOrCreateSettingsCategory(): Promise<CustomModuleDataCategory> {
        // Try to get existing settings category
        const existing = await getCustomDataCategory<object>('settings');
        if (existing) {
            return existing;
        }

        console.log('[Admin] Creating settings category');

        // Create settings category
        const created = await createCustomDataCategory({
            customModuleId: moduleId!,
            name: 'Settings',
            shorty: 'settings',
            description: 'Extension configuration settings',
        }, moduleId!);

        if (!created) {
            throw new Error('Failed to create settings category');
        }

        return created;
    }

    // Load background color from key-value store
    async function loadBackgroundColor(categoryId: number): Promise<void> {
        const values = await getCustomDataValues<BackgroundColorSetting>(categoryId, moduleId!);

        // Find backgroundColor value
        const bgColorValue = values.find((v) => v.key === 'backgroundColor');

        if (bgColorValue) {
            // Store the original value object for updates
            backgroundColorValue = bgColorValue as any;
            currentBackgroundColor = bgColorValue.value || '#ffffff';
        }
    }

    // Save background color to key-value store
    async function saveBackgroundColor(color: string): Promise<void> {
        if (!moduleId || !settingsCategory) {
            throw new Error('Extension not initialized');
        }

        const valueData = JSON.stringify({
            key: 'backgroundColor',
            value: color,
        });

        if (backgroundColorValue) {
            // Update existing value
            await updateCustomDataValue(
                settingsCategory.id,
                backgroundColorValue.id,
                { value: valueData },
                moduleId
            );
            backgroundColorValue.value = valueData;
        } else {
            // Create new value
            await createCustomDataValue(
                {
                    dataCategoryId: settingsCategory.id,
                    value: valueData,
                },
                moduleId
            );

            // Reload to get the created value
            await loadBackgroundColor(settingsCategory.id);
        }

        currentBackgroundColor = color;
        render();
    }

    // Render UI
    function render() {
        element.innerHTML = `
            <div style="max-width: 600px; margin: 2rem auto; padding: 2rem;">
                <!-- Extension Info Header -->
                <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h1 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">${data.extensionInfo?.name || 'Extension Settings'}</h1>
                    <p style="margin: 0 0 0.5rem 0; color: #666;">
                        ${data.extensionInfo?.description || 'Configure your extension settings'}
                    </p>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem; font-size: 0.85rem; color: #999;">
                        <span><strong>Version:</strong> ${data.extensionInfo?.version || 'N/A'}</span>
                        <span><strong>Key:</strong> ${data.extensionInfo?.key || KEY || 'N/A'}</span>
                        ${data.extensionInfo?.author?.name ? `<span><strong>Author:</strong> ${data.extensionInfo.author.name}</span>` : ''}
                    </div>
                </div>

                ${
                    isLoading
                        ? `
                    <div style="padding: 2rem; text-align: center; color: #666;">
                        <p>Loading settings...</p>
                    </div>
                `
                        : errorMessage
                          ? `
                    <div style="padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
                        <strong>Error:</strong> ${errorMessage}
                    </div>
                `
                          : `
                    <!-- Settings Form -->
                    <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem;">
                        <h2 style="margin: 0 0 1rem 0; font-size: 1.1rem;">Background Color</h2>
                        <p style="margin: 0 0 1rem 0; color: #666; font-size: 0.9rem;">
                            Choose a background color for all extension views
                        </p>

                        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
                            <input
                                type="color"
                                id="color-picker"
                                value="${currentBackgroundColor}"
                                style="width: 80px; height: 40px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
                            />
                            <input
                                type="text"
                                id="color-input"
                                value="${currentBackgroundColor}"
                                placeholder="#ffffff"
                                style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;"
                            />
                        </div>

                        <div style="padding: 2rem; background: ${currentBackgroundColor}; border: 1px solid #ddd; border-radius: 4px; text-align: center; margin-bottom: 1.5rem;">
                            <span style="color: #333; font-weight: 500;">Preview</span>
                        </div>

                        <button
                            id="save-btn"
                            style="width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 500;"
                        >
                            Save Settings
                        </button>

                        <div id="status-message" style="margin-top: 1rem; padding: 0.75rem; border-radius: 4px; display: none;"></div>
                    </div>

                    <!-- Info Box -->
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px;">
                        <p style="margin: 0; font-size: 0.9rem; color: #666;">
                            <strong>Note:</strong> Settings are stored in the ChurchTools key-value store.
                            ${import.meta.env.MODE === 'development' ? 'Running in development mode.' : ''}
                        </p>
                    </div>
                `
                }
            </div>
        `;

        if (!isLoading && !errorMessage) {
            attachEventHandlers();
        }
    }

    // Attach event handlers
    function attachEventHandlers() {
        const colorPicker = element.querySelector('#color-picker') as HTMLInputElement;
        const colorInput = element.querySelector('#color-input') as HTMLInputElement;
        const saveBtn = element.querySelector('#save-btn') as HTMLButtonElement;

        if (!colorPicker || !colorInput || !saveBtn) return;

        // Sync color picker and input
        colorPicker.addEventListener('input', (e) => {
            const color = (e.target as HTMLInputElement).value;
            colorInput.value = color;
            updatePreview(color);
        });

        colorInput.addEventListener('input', (e) => {
            const color = (e.target as HTMLInputElement).value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                colorPicker.value = color;
                updatePreview(color);
            }
        });

        // Save button
        saveBtn.addEventListener('click', async () => {
            await handleSave(colorInput.value);
        });
    }

    // Update preview
    function updatePreview(color: string) {
        const preview = element.querySelector('[style*="Preview"]')?.parentElement;
        if (preview) {
            (preview as HTMLElement).style.background = color;
        }
    }

    // Handle save
    async function handleSave(color: string) {
        const saveBtn = element.querySelector('#save-btn') as HTMLButtonElement;
        const statusMessage = element.querySelector('#status-message') as HTMLElement;

        if (!saveBtn || !statusMessage) return;

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            await saveBackgroundColor(color);

            // Show success message
            statusMessage.style.display = 'block';
            statusMessage.style.background = '#d4edda';
            statusMessage.style.border = '1px solid #c3e6cb';
            statusMessage.style.color = '#155724';
            statusMessage.textContent = '✓ Settings saved successfully!';

            // Emit notification to ChurchTools
            emit('notification:show', {
                message: 'Settings saved successfully!',
                type: 'success',
                duration: 3000,
            });

            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        } catch (error) {
            console.error('[Admin] Save error:', error);

            // Show error message
            statusMessage.style.display = 'block';
            statusMessage.style.background = '#f8d7da';
            statusMessage.style.border = '1px solid #f5c6cb';
            statusMessage.style.color = '#721c24';
            statusMessage.textContent =
                '✗ Failed to save: ' +
                (error instanceof Error ? error.message : 'Unknown error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Settings';
        }
    }

    // Initialize on load
    initialize();

    // Cleanup function
    return () => {
        console.log('[Admin] Cleaning up');
    };
};

// Named export for simple mode
export { adminEntryPoint };

// Default export for advanced mode
export default adminEntryPoint;
