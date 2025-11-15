import type { EntryPoint } from '../lib/main';
import type { MainModuleData } from '@churchtools/extension-points/main';

/**
 * Main Module Entry Point
 *
 * This entry point renders the extension as a standalone module with its own menu entry.
 * It provides a full-page view for the extension's main functionality.
 *
 * Extension Point: main
 * Location: ChurchTools main menu → Extension module
 * Data: { userId, permissions, settings }
 */

const mainEntryPoint: EntryPoint<MainModuleData> = ({
    //data,
    //on,
    //off,
    emit,
    element,
    user,
    // churchtoolsClient available for future use
}) => {
    console.log('[Main Module] Initializing main view');
    console.log('[Main Module] User:', user);

    // Track current view/tab
    let currentView = 'dashboard';

    // Render the main module UI
    function render(view = 'dashboard') {
        currentView = view;

        element.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; background: #f5f5f5;">
                <!-- Header -->
                <header style="background: #fff; border-bottom: 1px solid #ddd; padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="margin: 0; font-size: 1.5rem; color: #333;">Extension Module</h1>
                    <p style="margin: 0.5rem 0 0 0; color: #666;">Welcome, ${user.firstName}!</p>
                </header>

                <!-- Navigation Tabs -->
                <nav style="background: #fff; border-bottom: 1px solid #ddd; padding: 0 2rem;">
                    <div style="display: flex; gap: 2rem;">
                        <button class="nav-tab" data-view="dashboard" style="padding: 1rem 0; border: none; background: none; cursor: pointer; border-bottom: 3px solid ${view === 'dashboard' ? '#007bff' : 'transparent'}; color: ${view === 'dashboard' ? '#007bff' : '#666'}; font-weight: ${view === 'dashboard' ? 'bold' : 'normal'};">
                            Dashboard
                        </button>
                        <button class="nav-tab" data-view="calendar" style="padding: 1rem 0; border: none; background: none; cursor: pointer; border-bottom: 3px solid ${view === 'calendar' ? '#007bff' : 'transparent'}; color: ${view === 'calendar' ? '#007bff' : '#666'}; font-weight: ${view === 'calendar' ? 'bold' : 'normal'};">
                            Calendar
                        </button>
                        <button class="nav-tab" data-view="reports" style="padding: 1rem 0; border: none; background: none; cursor: pointer; border-bottom: 3px solid ${view === 'reports' ? '#007bff' : 'transparent'}; color: ${view === 'reports' ? '#007bff' : '#666'}; font-weight: ${view === 'reports' ? 'bold' : 'normal'};">
                            Reports
                        </button>
                    </div>
                </nav>

                <!-- Main Content Area -->
                <main style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <div id="content-area">
                        ${renderViewContent(view)}
                    </div>
                </main>
            </div>
        `;

        // Attach navigation handlers
        element.querySelectorAll('.nav-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                const newView = (tab as HTMLElement).dataset.view!;
                render(newView);
                emit('view:changed', newView);
            });
        });

        // Attach action handlers
        const actionBtn = element.querySelector('#action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', async () => {
                emit('action:triggered', { view: currentView });
                await handleAction(currentView);
            });
        }
    }

    // Render content for each view
    function renderViewContent(view: string): string {
        switch (view) {
            case 'dashboard':
                return `
                    <div style="max-width: 1200px;">
                        <h2>Dashboard</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                            <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 0.5rem 0; color: #007bff;">Statistics</h3>
                                <p style="font-size: 2rem; font-weight: bold; margin: 0; color: #333;">42</p>
                                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">Total items</p>
                            </div>
                            <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 0.5rem 0; color: #28a745;">Active</h3>
                                <p style="font-size: 2rem; font-weight: bold; margin: 0; color: #333;">18</p>
                                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">Currently active</p>
                            </div>
                            <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 0.5rem 0; color: #ffc107;">Pending</h3>
                                <p style="font-size: 2rem; font-weight: bold; margin: 0; color: #333;">7</p>
                                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.875rem;">Awaiting action</p>
                            </div>
                        </div>
                        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 1.5rem;">
                            <h3 style="margin: 0 0 1rem 0;">Recent Activity</h3>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">User created new entry</li>
                                <li style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">Settings updated</li>
                                <li style="padding: 0.75rem 0;">Report generated</li>
                            </ul>
                        </div>
                    </div>
                `;

            case 'calendar':
                return `
                    <div style="max-width: 1200px;">
                        <h2>Calendar View</h2>
                        <div style="background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 2rem; text-align: center;">
                            <p style="color: #666; margin: 0 0 1rem 0;">Calendar integration view</p>
                            <button id="action-btn" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
                                Load Calendar Data
                            </button>
                            <div id="calendar-content" style="margin-top: 2rem; min-height: 300px; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; color: #999;">
                                Calendar content will appear here
                            </div>
                        </div>
                    </div>
                `;

            case 'reports':
                return `
                    <div style="max-width: 1200px;">
                        <h2>Reports</h2>
                        <div style="background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 2rem;">
                            <h3 style="margin: 0 0 1rem 0;">Generate Report</h3>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; color: #333;">Report Type:</label>
                                <select style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                    <option>Activity Summary</option>
                                    <option>Usage Statistics</option>
                                    <option>Performance Metrics</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; color: #333;">Date Range:</label>
                                <input type="date" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <button id="action-btn" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
                                Generate Report
                            </button>
                        </div>
                    </div>
                `;

            default:
                return `<p>Unknown view: ${view}</p>`;
        }
    }

    // Handle actions
    async function handleAction(view: string) {
        const contentArea = element.querySelector('#calendar-content, #report-output');
        if (contentArea) {
            contentArea.innerHTML = '<p style="color: #666;">Loading...</p>';

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            contentArea.innerHTML = `<p style="color: #28a745;">✓ Action completed for ${view} view</p>`;
        }
    }

    // Initial render
    render();

    // Cleanup
    return () => {
        console.log('[Main Module] Cleaning up');
    };
};

// Named export for simple mode
export { mainEntryPoint };

// Default export for advanced mode
export default mainEntryPoint;
