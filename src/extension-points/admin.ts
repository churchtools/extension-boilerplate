/**
 * Extension Point: admin
 *
 * Location: Admin → Extensions → Extension Settings
 * Purpose: Render admin configuration interface for the extension
 *
 * This file defines the contract for the admin configuration extension point.
 */

/**
 * Data provided by ChurchTools for admin configuration extension
 */
export interface AdminData {
    /** Current extension settings */
    settings: Record<string, any>;
    /** Extension metadata */
    extensionInfo: {
        /** Extension name */
        name: string;
        /** Extension version */
        version: string;
        /** Extension key/identifier */
        key: string;
        /** Extension description */
        description?: string;
        /** Extension author */
        author?: {
            name: string;
            email?: string;
        };
    };
    /** Admin user info */
    adminUser?: {
        /** User ID */
        userId: number;
        /** User name */
        name: string;
        /** User permissions */
        permissions: string[];
    };
}

/**
 * Events FROM ChurchTools
 */
export interface AdminEvents {
    /**
     * Fired when settings are reloaded from server
     * @param newSettings - Reloaded settings object
     */
    'settings:reload': (newSettings: Record<string, any>) => void;

    /**
     * Fired when save operation completes (success or failure)
     * @param result - Save operation result
     */
    'settings:saveComplete': (result: { success: boolean; error?: string }) => void;

    /**
     * Fired when admin panel is about to close
     */
    'admin:closing': () => void;

    /**
     * Fired when validation is requested
     */
    'settings:validate': () => void;
}

/**
 * Events TO ChurchTools
 */
export interface AdminEmits {
    /**
     * Request to save settings
     * @param newSettings - Settings object to save
     */
    'settings:save': (newSettings: Record<string, any>) => void;

    /**
     * Request to reset settings to defaults
     */
    'settings:reset': () => void;

    /**
     * Request to validate settings
     * @param settings - Settings to validate
     */
    'settings:validate': (settings: Record<string, any>) => void;

    /**
     * Test connection with current settings
     * @param data - Connection test parameters
     */
    'connection:test': (data: { apiKey?: string; endpoint?: string }) => void;

    /**
     * Show status message to admin
     * @param data - Status message details
     */
    'status:show': (data: {
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        duration?: number;
    }) => void;

    /**
     * Request to export current settings
     */
    'settings:export': () => void;

    /**
     * Request to import settings
     * @param settings - Settings object to import
     */
    'settings:import': (settings: Record<string, any>) => void;
}

/**
 * Full contract for admin configuration extension point
 */
export type AdminContract = {
    data: AdminData;
    events: AdminEvents;
    emits: AdminEmits;
};
