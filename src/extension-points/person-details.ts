/**
 * Extension Point: person-details-sidebar
 *
 * Location: Person details page, right sidebar
 * Purpose: Display additional person information or actions
 *
 * This file defines the contract for the person details sidebar extension point.
 */

/**
 * Data provided by ChurchTools for person details sidebar extension
 */
export interface PersonDetailsSidebarData {
    /** Person ID */
    personId: number;
    /** Person's first name */
    firstName: string;
    /** Person's last name */
    lastName: string;
    /** Person's email (may be null) */
    email?: string;
    /** Person's phone number (may be null) */
    phone?: string;
    /** Person's status */
    status: 'active' | 'inactive' | 'archived';
    /** Custom fields (flexible) */
    customFields?: Record<string, any>;
}

/**
 * Events FROM ChurchTools
 */
export interface PersonDetailsSidebarEvents {
    /**
     * Fired when person data is updated
     * @param updatedData - Partial data that was updated
     */
    'person:updated': (updatedData: Partial<PersonDetailsSidebarData>) => void;

    /**
     * Fired when person status changes
     * @param status - New status
     */
    'person:statusChanged': (status: 'active' | 'inactive' | 'archived') => void;

    /**
     * Fired when user navigates to a different person
     * @param personId - New person ID
     */
    'person:changed': (personId: number) => void;
}

/**
 * Events TO ChurchTools
 */
export interface PersonDetailsSidebarEmits {
    /**
     * Request to open person edit dialog
     */
    'action:edit': () => void;

    /**
     * Request to send email to person
     * @param data - Email template and subject
     */
    'action:sendEmail': (data: { subject?: string; template?: string }) => void;

    /**
     * Notify about external data sync
     * @param data - Sync status and details
     */
    'sync:status': (data: { synced: boolean; source: string; timestamp: Date }) => void;
}

/**
 * Full contract for person details sidebar extension point
 */
export type PersonDetailsSidebarContract = {
    data: PersonDetailsSidebarData;
    events: PersonDetailsSidebarEvents;
    emits: PersonDetailsSidebarEmits;
};
