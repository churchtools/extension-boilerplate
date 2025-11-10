import type { Person } from './utils/ct-types';
import type { ExtensionContext, EntryPoint, CleanupFunction } from './types/extension';
import { churchtoolsClient } from '@churchtools/churchtools-client';
import { EventBus } from './event-bus';

// Re-export types for convenience
export type { ExtensionContext, EntryPoint, CleanupFunction };

// only import reset.css in development mode to keep the production bundle small and to simulate CT environment
if (import.meta.env.MODE === 'development') {
    import('./utils/reset.css');
}

declare const window: Window &
    typeof globalThis & {
        settings: {
            base_url?: string;
        };
    };

const KEY = import.meta.env.VITE_KEY;
export { KEY };

// Track initialization state
let isInitialized = false;

/**
 * Initialize the ChurchTools client
 */
async function initializeChurchToolsClient(): Promise<void> {
    if (isInitialized) {
        return;
    }

    const baseUrl = window.settings?.base_url ?? import.meta.env.VITE_BASE_URL;
    churchtoolsClient.setBaseUrl(baseUrl);

    // Auto-login in development mode
    const username = import.meta.env.VITE_USERNAME;
    const password = import.meta.env.VITE_PASSWORD;
    if (import.meta.env.MODE === 'development' && username && password) {
        await churchtoolsClient.post('/login', { username, password });
    }

    isInitialized = true;
}

/**
 * Extension instance returned by renderExtension
 * ChurchTools can use this to communicate with the extension
 */
export interface ExtensionInstance {
    /** Emit events to the extension */
    emit(event: string, ...data: any[]): void;
    /** Listen to events from the extension */
    on(event: string, handler: (...args: any[]) => void): void;
    /** Unsubscribe from extension events */
    off(event: string, handler: (...args: any[]) => void): void;
    /** Cleanup the extension (calls cleanup function, removes all listeners) */
    destroy(): Promise<void>;
}

/**
 * Render an extension to a specific div using a custom entry point
 *
 * @param divId - The ID of the div element to render into
 * @param entryPoint - The entry point function to execute
 * @param data - Optional data to pass to the extension (specific to the extension point)
 * @returns ExtensionInstance for bidirectional communication
 *
 * @example
 * ```typescript
 * // Render extension with data
 * const instance = await renderExtension('calendar-div', calendarEntry, {
 *   selectedDate: new Date(),
 *   selectedTime: '14:00'
 * });
 *
 * // ChurchTools listens to events from extension
 * instance.on('date:suggest', ({ date, reason }) => {
 *   console.log('Extension suggests:', date, reason);
 *   updateDialogDate(date);
 * });
 *
 * // ChurchTools emits events to extension
 * instance.emit('date:changed', new Date());
 *
 * // Cleanup when done
 * await instance.destroy();
 * ```
 */
export async function renderExtension<TData = any>(
    divId: string,
    entryPoint: EntryPoint<TData>,
    data?: TData
): Promise<ExtensionInstance> {
    // Initialize ChurchTools client if not already initialized
    await initializeChurchToolsClient();

    // Get the target element
    const element = document.querySelector<HTMLElement>(`#${divId}`);
    if (!element) {
        throw new Error(`Element with id "${divId}" not found`);
    }

    // Fetch current user
    const user = await churchtoolsClient.get<Person>('/whoami');

    // Create event bus for bidirectional communication
    const eventBus = new EventBus();

    // Store cleanup function if extension returns one
    let cleanupFunction: CleanupFunction | undefined;

    // Create context
    const context: ExtensionContext<TData> = {
        churchtoolsClient,
        user,
        element,
        KEY,
        data: data as TData, // Use provided data or undefined
        on: (event, handler) => eventBus.on(event, handler),
        off: (event, handler) => eventBus.off(event, handler),
        emit: (event, ...args) => eventBus.emit(event, ...args),
    };

    // Execute entry point and capture cleanup function
    const result = await entryPoint(context);
    if (typeof result === 'function') {
        cleanupFunction = result;
    }

    // Return extension instance for ChurchTools to interact with
    return {
        // ChurchTools can emit events TO the extension
        emit: (event: string, ...args: any[]) => eventBus.emit(event, ...args),

        // ChurchTools can listen to events FROM the extension
        on: (event: string, handler: (...args: any[]) => void) => eventBus.on(event, handler),

        // ChurchTools can unsubscribe from extension events
        off: (event: string, handler: (...args: any[]) => void) => eventBus.off(event, handler),

        // Cleanup: call extension cleanup, clear all event handlers
        destroy: async () => {
            if (cleanupFunction) {
                await cleanupFunction();
            }
            eventBus.clear();
        },
    };
}

// Default behavior for development mode
if (import.meta.env.MODE === 'development') {
    // Default entry point for development
    const defaultEntryPoint: EntryPoint = ({ user, element }) => {
        element.innerHTML = `
            <div style="display: flex; place-content: center; place-items: center; height: 100vh;">
                <h1>Welcome ${[user.firstName, user.lastName].join(' ')}</h1>
            </div>
        `;
    };

    // Auto-render in development mode
    renderExtension('app', defaultEntryPoint).catch(console.error);
}
