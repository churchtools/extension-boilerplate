import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points/main';
import type { Status } from '../utils/ct-types';
import { getModule, getCustomDataCategory, getCustomDataValues } from '../utils/kv-store';

/**
 * Main Module Entry Point
 *
 * Dashboard showing person statistics per status.
 * Demonstrates:
 * - Fetching data from ChurchTools API
 * - Using settings from key-value store (background color)
 */

interface StatusStats {
    status: Status;
    count: number;
}

interface BackgroundColorSetting {
    key: string;
    value: string;
}

const mainEntryPoint: EntryPoint<MainModuleData> = ({ element, churchtoolsClient, KEY }) => {
    console.log('[Main] Initializing');

    let backgroundColor = '#ffffff'; // Default fallback
    let statistics: StatusStats[] = [];
    let isLoading = true;
    let errorMessage = '';

    // Initialize and load data
    async function initialize() {
        try {
            isLoading = true;
            render();

            // Load background color from settings
            await loadBackgroundColor();

            // Load person statistics
            await loadStatistics();

            isLoading = false;
            errorMessage = '';
            render();
        } catch (error) {
            console.error('[Main] Initialization error:', error);
            isLoading = false;
            errorMessage = error instanceof Error ? error.message : 'Failed to initialize';
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
                console.log('[Main] No settings category found, using default background');
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
                console.log('[Main] Loaded background color:', backgroundColor);
            }
        } catch (error) {
            console.log('[Main] Could not load background color, using default:', error);
            // Fallback to white if settings not found
            backgroundColor = '#ffffff';
        }
    }

    // Load person statistics per status
    async function loadStatistics(): Promise<void> {
        // Get all statuses
        const statuses = await churchtoolsClient.get<Status[]>('/statuses');
        console.log('[Main] Loaded statuses:', statuses.length);

        // Fetch person count for each status
        const statsPromises = statuses.map(async (status) => {
            try {
                const response = await churchtoolsClient.get<any>(
                    `/persons?status_ids[]=${status.id}&page=1&limit=1`,
                    undefined,
                    true
                );
                return {
                    status,
                    count: response.data.meta.pagination.total,
                };
            } catch (error) {
                console.error(`[Main] Failed to load count for status ${status.id}:`, error);
                return {
                    status,
                    count: 0,
                };
            }
        });

        statistics = await Promise.all(statsPromises);
        console.log('[Main] Loaded statistics:', statistics);
    }

    // Render UI
    function render() {
        element.innerHTML = `
            <div style="min-height: 100vh; background: ${backgroundColor}; padding: 2rem;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <!-- Header -->
                    <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h1 style="margin: 0 0 0.5rem 0; font-size: 1.8rem; color: #333;">Person Statistics Dashboard</h1>
                        <p style="margin: 0; color: #666; font-size: 0.95rem;">
                            Overview of persons by status
                        </p>
                    </div>

                    ${
                        isLoading
                            ? `
                        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 3rem; text-align: center; color: #666;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                            <p style="margin: 0;">Loading statistics...</p>
                        </div>
                    `
                            : errorMessage
                              ? `
                        <div style="background: #fff; border: 1px solid #fcc; border-radius: 8px; padding: 1.5rem; color: #c00;">
                            <strong>Error:</strong> ${errorMessage}
                        </div>
                    `
                              : `
                        <!-- Statistics Grid -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                            ${statistics
                                .map(
                                    (stat) => `
                                <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s;"
                                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
                                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)';">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                        <h3 style="margin: 0; font-size: 1rem; color: #555; font-weight: 500;">${stat.status.nameTranslated || stat.status.name}</h3>
                                        <span style="background: ${stat.status.isMember ? '#d4edda' : '#f8f9fa'}; color: ${stat.status.isMember ? '#155724' : '#666'}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                                            ${stat.status.shorty}
                                        </span>
                                    </div>
                                    <div style="font-size: 2.5rem; font-weight: 700; color: #007bff; margin: 0.5rem 0;">
                                        ${stat.count.toLocaleString()}
                                    </div>
                                    <div style="font-size: 0.85rem; color: #999;">
                                        ${stat.count === 1 ? 'person' : 'persons'}
                                        ${stat.status.isMember ? ' • <span style="color: #155724;">Member</span>' : ''}
                                    </div>
                                </div>
                            `
                                )
                                .join('')}
                        </div>

                        <!-- Summary -->
                        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #333;">Summary</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 0.25rem;">Total Persons</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #007bff;">
                                        ${statistics.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 0.25rem;">Total Statuses</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #28a745;">
                                        ${statistics.length}
                                    </div>
                                </div>
                                <div>
                                    <div style="color: #666; font-size: 0.85rem; margin-bottom: 0.25rem;">Members</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #155724;">
                                        ${statistics
                                            .filter((stat) => stat.status.isMember)
                                            .reduce((sum, stat) => sum + stat.count, 0)
                                            .toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Info Box -->
                        <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px;">
                            <p style="margin: 0; font-size: 0.9rem; color: #666;">
                                <strong>Background Color:</strong> This view uses the background color configured in the admin settings.
                                Current value: <code style="background: #fff; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace;">${backgroundColor}</code>
                            </p>
                        </div>
                    `
                    }
                </div>
            </div>
        `;
    }

    // Initialize on load
    initialize();

    // Cleanup function
    return () => {
        console.log('[Main] Cleaning up');
    };
};

// Named export for simple mode
export { mainEntryPoint };

// Default export for advanced mode
export default mainEntryPoint;
