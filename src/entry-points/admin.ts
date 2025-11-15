import type { EntryPoint } from '../lib/main';
import type { AdminData } from '@churchtools/extension-points/admin';
import type {
    CustomModule,
    CustomModuleCreate,
    CustomModuleDataCategory,
    CustomModuleDataCategoryCreate,
    CustomModuleDataValue,
    CustomModuleDataValueCreate,
} from '../utils/ct-types';

/**
 * Admin Configuration Entry Point
 *
 * Simple demo: Configure background color for all entry points.
 * Settings are stored in ChurchTools extension key-value store.
 */

const adminEntryPoint: EntryPoint<AdminData> = ({ data, emit, element, churchtoolsClient, KEY }) => {
    console.log('[Admin] Initializing');
    console.log('[Admin] Extension info:', data.extensionInfo);

    let extensionModule: CustomModule | null = null;
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

            // Step 1: Get or create the extension module
            extensionModule = await getOrCreateExtensionModule();
            console.log('[Admin] Extension module:', extensionModule);

            // Step 2: Get or create the settings category
            settingsCategory = await getOrCreateSettingsCategory(extensionModule.id);
            console.log('[Admin] Settings category:', settingsCategory);

            // Step 3: Load background color setting
            await loadBackgroundColor(extensionModule.id, settingsCategory.id);

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

    // Get extension module by key, or create it in development mode
    async function getOrCreateExtensionModule(): Promise<CustomModule> {
        try {
            // Try to get existing module
            const module = await churchtoolsClient.get<CustomModule>(
                `/custommodules/${KEY}`
            );
            return module;
        } catch (error) {
            console.log('[Admin] Extension module not found, checking if we should create it');

            // Only create in development mode
            if (import.meta.env.MODE !== 'development') {
                throw new Error(
                    'Extension module not registered in ChurchTools. ' +
                        'Please register it through ChurchTools admin first.'
                );
            }

            console.log('[Admin] Development mode: Creating extension module');

            // Create module in development
            const createData: CustomModuleCreate = {
                name: data.extensionInfo?.name || 'Extension',
                shorty: KEY || 'ext',
                description: data.extensionInfo?.description || 'ChurchTools Extension',
                sortKey: 100,
            };

            const created = await churchtoolsClient.post<CustomModule>(
                '/custommodules',
                createData
            );

            console.log('[Admin] Created extension module:', created);
            return created;
        }
    }

    // Get or create the "settings" category
    async function getOrCreateSettingsCategory(
        moduleId: number
    ): Promise<CustomModuleDataCategory> {
        // Get all categories for this module
        const categories = await churchtoolsClient.get<CustomModuleDataCategory[]>(
            `/custommodules/${moduleId}/customdatacategories`
        );

        // Check if settings category exists
        const existing = categories.find((cat) => cat.shorty === 'settings');
        if (existing) {
            return existing;
        }

        console.log('[Admin] Creating settings category');

        // Create settings category
        const createData: CustomModuleDataCategoryCreate = {
            customModuleId: moduleId,
            name: 'Settings',
            shorty: 'settings',
            description: 'Extension configuration settings',
        };

        const created = await churchtoolsClient.post<CustomModuleDataCategory>(
            `/custommodules/${moduleId}/customdatacategories`,
            createData
        );

        return created;
    }

    // Load background color from key-value store
    async function loadBackgroundColor(moduleId: number, categoryId: number): Promise<void> {
        const values = await churchtoolsClient.get<CustomModuleDataValue[]>(
            `/custommodules/${moduleId}/customdatacategories/${categoryId}/customdatavalues`
        );

        // Find backgroundColor value
        const bgColorValue = values.find((v) => {
            // The value structure might contain metadata, try to parse it
            try {
                const parsed = JSON.parse(v.value);
                return parsed.key === 'backgroundColor';
            } catch {
                return false;
            }
        });

        if (bgColorValue) {
            backgroundColorValue = bgColorValue;
            const parsed = JSON.parse(bgColorValue.value);
            currentBackgroundColor = parsed.value || '#ffffff';
        }
    }

    // Save background color to key-value store
    async function saveBackgroundColor(color: string): Promise<void> {
        if (!extensionModule || !settingsCategory) {
            throw new Error('Extension not initialized');
        }

        const valueData = JSON.stringify({
            key: 'backgroundColor',
            value: color,
        });

        if (backgroundColorValue) {
            // Update existing value
            await churchtoolsClient.put(
                `/custommodules/${extensionModule.id}/customdatacategories/${settingsCategory.id}/customdatavalues/${backgroundColorValue.id}`,
                { value: valueData }
            );
            backgroundColorValue.value = valueData;
        } else {
            // Create new value
            const createData: CustomModuleDataValueCreate = {
                dataCategoryId: settingsCategory.id,
                value: valueData,
            };

            const created = await churchtoolsClient.post<CustomModuleDataValue>(
                `/custommodules/${extensionModule.id}/customdatacategories/${settingsCategory.id}/customdatavalues`,
                createData
            );

            backgroundColorValue = created;
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
