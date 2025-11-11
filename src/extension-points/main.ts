/**
 * Extension Point: main
 *
 * Location: ChurchTools main menu → Extension module
 * Purpose: Render extension as a standalone module with its own menu entry
 *
 * This file defines the contract for the main module extension point.
 */

/**
 * Data provided by ChurchTools for main module extension
 */
export interface MainModuleData {
    /** Current user ID */
    userId: number;
    /** User's permissions in this extension */
    permissions: string[];
    /** Extension settings from admin panel */
    settings?: Record<string, any>;
    /** Additional context data */
    context?: {
        /** Module parameters from URL */
        params?: Record<string, string>;
        /** Navigation state */
        route?: string;
    };
}

/**
 * Events FROM ChurchTools
 */
export interface MainModuleEvents {
    /**
     * Fired when extension settings change
     * @param newSettings - Updated settings object
     */
    'settings:changed': (newSettings: Record<string, any>) => void;

    /**
     * Fired when user permissions change
     * @param newPermissions - Updated permissions array
     */
    'permissions:changed': (newPermissions: string[]) => void;

    /**
     * Fired when module is about to be hidden/unmounted
     */
    'module:hidden': () => void;

    /**
     * Fired when module is shown again after being hidden
     */
    'module:shown': () => void;

    /**
     * Fired when navigation within module occurs
     * @param route - New route/path
     */
    'navigation:changed': (route: string) => void;
}

/**
 * Events TO ChurchTools
 */
export interface MainModuleEmits {
    /**
     * Notify ChurchTools about view changes
     * @param view - Current view identifier
     */
    'view:changed': (view: string) => void;

    /**
     * Request navigation to a different module
     * @param data - Navigation target and parameters
     */
    'navigation:request': (data: { module: string; params?: Record<string, any> }) => void;

    /**
     * Notify about action triggers (for analytics/tracking)
     * @param data - Action details
     */
    'action:triggered': (data: { view: string; action?: string }) => void;

    /**
     * Update module title dynamically
     * @param title - New title text
     */
    'title:update': (title: string) => void;

    /**
     * Show notification to user
     * @param data - Notification details
     */
    'notification:show': (data: {
        message: string;
        type?: 'info' | 'success' | 'warning' | 'error';
        duration?: number;
    }) => void;
}

/**
 * Full contract for main module extension point
 */
export type MainModuleContract = {
    data: MainModuleData;
    events: MainModuleEvents;
    emits: MainModuleEmits;
};
