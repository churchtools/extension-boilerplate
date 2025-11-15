import type { Person } from '../utils/ct-types';
import type { churchtoolsClient } from '@churchtools/churchtools-client';

/**
 * Context provided to entry points when rendering an extension
 *
 * @template TData - Type of data specific to this extension point (use `any` for flexibility)
 */
export interface ExtensionContext<TData = any> {
    /** The ChurchTools API client instance */
    churchtoolsClient: typeof churchtoolsClient;
    /** The currently logged-in user */
    user: Person;
    /** The DOM element where the extension should render */
    element: HTMLElement;
    /** The extension key */
    KEY: string;

    /**
     * Data specific to this extension point
     * ChurchTools provides initial and current state data here
     */
    data: TData;

    /**
     * Subscribe to events from ChurchTools
     * Use this to react to changes in the surrounding UI
     *
     * @param event - Event name (use namespaced format: 'category:action')
     * @param handler - Function to call when event is emitted
     *
     * @example
     * ```typescript
     * on('date:changed', (newDate: Date) => {
     *   console.log('Date changed to:', newDate);
     * });
     * ```
     */
    on(event: string, handler: (...args: any[]) => void): void;

    /**
     * Unsubscribe from ChurchTools events
     * Important for cleanup to prevent memory leaks
     *
     * @param event - Event name
     * @param handler - Handler function to remove
     *
     * @example
     * ```typescript
     * const handler = (date) => console.log(date);
     * on('date:changed', handler);
     * // Later, cleanup:
     * off('date:changed', handler);
     * ```
     */
    off(event: string, handler: (...args: any[]) => void): void;

    /**
     * Emit events to ChurchTools
     * Use this to communicate actions or data back to ChurchTools
     *
     * @param event - Event name (use namespaced format: 'category:action')
     * @param data - Optional data to send
     *
     * @example
     * ```typescript
     * // Suggest a different date
     * emit('date:suggest', { date: new Date(), reason: 'Better availability' });
     * ```
     */
    emit(event: string, ...data: any[]): void;
}

/**
 * Cleanup function that extensions can return
 * Called when the extension is unmounted or re-rendered
 */
export type CleanupFunction = () => void | Promise<void>;

/**
 * Entry point function type
 * This function receives the extension context and can render content
 * or perform any initialization needed for the extension
 *
 * @template TData - Type of data specific to this extension point
 *
 * @param context - The extension context with data, events, and utilities
 * @returns Optional cleanup function for event handlers and resources
 *
 * @example
 * ```typescript
 * const myEntry: EntryPoint<MyData> = ({ data, on, emit, element }) => {
 *   // Render initial UI
 *   render(data);
 *
 *   // Listen for updates
 *   const handler = (newData) => render(newData);
 *   on('data:updated', handler);
 *
 *   // Return cleanup
 *   return () => {
 *     off('data:updated', handler);
 *   };
 * };
 * ```
 */
export type EntryPoint<TData = any> = (
    context: ExtensionContext<TData>
) => void | Promise<void> | CleanupFunction | Promise<CleanupFunction>;
