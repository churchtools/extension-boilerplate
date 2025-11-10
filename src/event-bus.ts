/**
 * Simple event bus for bidirectional communication between ChurchTools and extensions
 */

type EventHandler = (...args: any[]) => void;

export class EventBus {
    private handlers: Map<string, Set<EventHandler>> = new Map();

    /**
     * Subscribe to an event
     * @param event - Event name (use namespaced format: 'category:action')
     * @param handler - Function to call when event is emitted
     */
    on(event: string, handler: EventHandler): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler);
    }

    /**
     * Unsubscribe from an event
     * @param event - Event name
     * @param handler - Handler function to remove
     */
    off(event: string, handler: EventHandler): void {
        const eventHandlers = this.handlers.get(event);
        if (eventHandlers) {
            eventHandlers.delete(handler);
            if (eventHandlers.size === 0) {
                this.handlers.delete(event);
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param event - Event name
     * @param data - Data to pass to handlers
     */
    emit(event: string, ...data: any[]): void {
        // get handlers for '*' event (wildcard) AND specific event
        let eventHandlers = this.handlers.get(event);
        const wildcardHandlers = this.handlers.get('*');
        // Combine both sets of handlers
        if (wildcardHandlers) {
            eventHandlers = eventHandlers
                ? new Set([...eventHandlers, ...wildcardHandlers])
                : new Set(wildcardHandlers);
        }
        if (eventHandlers) {
            eventHandlers.forEach(handler => {
                try {
                    handler(...data);
                } catch (error) {
                    console.error(`[EventBus] Error in handler for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Subscribe to an event for a single emission (auto-unsubscribes after first call)
     * @param event - Event name
     * @param handler - Function to call when event is emitted
     */
    once(event: string, handler: EventHandler): void {
        const onceHandler: EventHandler = (...args) => {
            this.off(event, onceHandler);
            handler(...args);
        };
        this.on(event, onceHandler);
    }

    /**
     * Remove all handlers for an event, or all handlers if no event specified
     * @param event - Optional event name. If omitted, removes all handlers.
     */
    clear(event?: string): void {
        if (event) {
            this.handlers.delete(event);
        } else {
            this.handlers.clear();
        }
    }

    /**
     * Get list of all registered event names
     */
    getEvents(): string[] {
        return Array.from(this.handlers.keys());
    }

    /**
     * Check if an event has any handlers
     */
    hasHandlers(event: string): boolean {
        return this.handlers.has(event) && this.handlers.get(event)!.size > 0;
    }
}
