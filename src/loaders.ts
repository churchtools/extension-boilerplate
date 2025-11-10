import type { EntryPoint } from './types/extension';

/**
 * Entry point registry for dynamic loading
 * Maps entry point names to their loader functions
 */
type EntryPointLoader = () => Promise<{ default: EntryPoint }>;

/**
 * Configuration for extension loading
 */
export interface ExtensionConfig {
    /** Base path where extension assets are deployed (e.g., '/ccm/mykey/assets' or '/extensions/mykey/assets') */
    basePath?: string;
}

/**
 * Global configuration set by ChurchTools
 */
let extensionConfig: ExtensionConfig = {};

/**
 * Entry point registry with relative import paths
 * These paths are relative to the main bundle location
 */
const entryPointRegistry: Record<string, EntryPointLoader> = {
    welcome: () => import('./entry-points/welcome'),
    userInfo: () => import('./entry-points/user-info'),
    dataViewer: () => import('./entry-points/data-viewer'),
    calendarAvailability: () => import('./entry-points/calendar-availability'),
};

/**
 * Configure the extension with runtime options
 * This should be called by ChurchTools before loading any entry points
 *
 * @param config - Configuration object
 *
 * @example
 * ```typescript
 * // ChurchTools configures the base path
 * configureExtension({ basePath: '/extensions/mykey/assets' });
 *
 * // Then loads entry points normally
 * const entryPoint = await loadEntryPoint('welcome');
 * ```
 */
export function configureExtension(config: ExtensionConfig): void {
    extensionConfig = { ...extensionConfig, ...config };
}

/**
 * Load an entry point dynamically by name
 * This enables code splitting in advanced mode
 *
 * @param name - The name of the entry point to load
 * @param options - Optional configuration for this load
 * @returns Promise resolving to the entry point function
 *
 * @example
 * ```typescript
 * // Simple usage (uses relative imports, works with any deployment path)
 * const entryPoint = await loadEntryPoint('welcome');
 * await renderExtension('my-div', entryPoint);
 *
 * // With explicit base path (optional, for advanced scenarios)
 * const entryPoint = await loadEntryPoint('welcome', {
 *   basePath: '/extensions/mykey/assets'
 * });
 * ```
 *
 * @remarks
 * The base path is usually not needed. By default, dynamic imports use relative paths
 * that work regardless of where ChurchTools deploys the extension. Only use basePath
 * if you need explicit control over the import location.
 */
export async function loadEntryPoint(
    name: string,
    options?: { basePath?: string }
): Promise<EntryPoint> {
    const loader = entryPointRegistry[name];

    if (!loader) {
        const available = Object.keys(entryPointRegistry).join(', ');
        throw new Error(
            `Entry point "${name}" not found. Available entry points: ${available}`
        );
    }

    try {
        // Use basePath from options, then fall back to global config
        const basePath = options?.basePath || extensionConfig.basePath;

        if (basePath) {
            // Log a warning: basePath is usually not needed with relative imports
            console.info(
                `[Extension] Loading "${name}" with explicit basePath: ${basePath}. ` +
                `Note: Relative imports usually work automatically.`
            );
        }

        // Use the loader (relative imports work regardless of deployment path)
        const module = await loader();
        return module.default;
    } catch (error) {
        throw new Error(
            `Failed to load entry point "${name}": ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Get a list of all available entry point names
 * Useful for debugging and discovery
 *
 * @returns Array of entry point names
 */
export function getAvailableEntryPoints(): string[] {
    return Object.keys(entryPointRegistry);
}

/**
 * Check if an entry point exists
 *
 * @param name - The name of the entry point to check
 * @returns True if the entry point exists
 */
export function hasEntryPoint(name: string): boolean {
    return name in entryPointRegistry;
}

/**
 * Register a custom entry point dynamically
 * Useful for extensions that want to add entry points at runtime
 *
 * @param name - The name of the entry point
 * @param loader - Function that loads the entry point
 *
 * @example
 * ```typescript
 * registerEntryPoint('customWidget', () => import('./my-custom-widget'));
 * ```
 */
export function registerEntryPoint(name: string, loader: EntryPointLoader): void {
    if (entryPointRegistry[name]) {
        console.warn(`Entry point "${name}" already exists and will be overwritten`);
    }
    entryPointRegistry[name] = loader;
}
