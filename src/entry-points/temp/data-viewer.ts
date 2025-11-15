import type { EntryPoint } from '../lib/main';

/**
 * Data viewer entry point
 * Demonstrates using the ChurchTools API to fetch and display data
 */
const dataViewerEntryPoint: EntryPoint = async ({ churchtoolsClient, element }) => {
    element.innerHTML = `
        <div style="padding: 2rem;">
            <h1>ChurchTools Data Viewer</h1>
            <div id="loading">Loading data...</div>
            <div id="data-content" style="display: none;"></div>
            <div id="error" style="display: none; color: red;"></div>
        </div>
    `;

    const loadingEl = element.querySelector('#loading') as HTMLElement;
    const contentEl = element.querySelector('#data-content') as HTMLElement;
    const errorEl = element.querySelector('#error') as HTMLElement;

    try {
        // Example: Fetch some data from ChurchTools
        // You can replace this with any API endpoint you need
        const whoami = await churchtoolsClient.get('/whoami');

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        contentEl.innerHTML = `
            <h2>API Response Example</h2>
            <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(whoami, null, 2)}
            </pre>
        `;
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = `Error loading data: ${error instanceof Error ? error.message : String(error)}`;
    }
};

// Named export for simple mode (static import)
export { dataViewerEntryPoint };

// Default export for advanced mode (dynamic import)
export default dataViewerEntryPoint;
