/**
 * Extension Point: calendar-dialog-availability
 *
 * Location: Calendar event edit dialog, below time selection
 * Purpose: Display user availability and suggest alternative times
 *
 * This file defines the contract for the calendar dialog availability extension point.
 * ChurchTools provides this interface to extension developers.
 */

/**
 * Data provided by ChurchTools for calendar dialog availability extension
 */
export interface CalendarDialogData {
    /** Currently selected event date */
    selectedDate: Date;
    /** Currently selected event time (HH:MM format) */
    selectedTime: string;
    /** Event duration in minutes */
    duration: number;
    /** Optional: Person ID for availability check */
    personId?: number;
}

/**
 * Events FROM ChurchTools (extension subscribes with `on()`)
 *
 * The extension can listen to these events to react to user interactions
 * in the surrounding dialog.
 */
export interface CalendarDialogEvents {
    /**
     * Fired when user changes the event date
     * @param date - New selected date
     *
     * @example
     * ```typescript
     * on('date:changed', (date: Date) => {
     *   console.log('Date changed to:', date);
     *   updateAvailability(date);
     * });
     * ```
     */
    'date:changed': (date: Date) => void;

    /**
     * Fired when user changes the event time
     * @param time - New selected time in HH:MM format
     */
    'time:changed': (time: string) => void;

    /**
     * Fired when user changes the event duration
     * @param minutes - New duration in minutes
     */
    'duration:changed': (minutes: number) => void;

    /**
     * Fired when dialog is about to close
     * Extension should cleanup resources
     */
    'dialog:closing': () => void;
}

/**
 * Events TO ChurchTools (extension emits with `emit()`)
 *
 * The extension can emit these events to communicate back to ChurchTools.
 */
export interface CalendarDialogEmits {
    /**
     * Suggest an alternative date to the user
     * ChurchTools will update the date field and show a notification
     *
     * @param data - Suggested date and reason
     *
     * @example
     * ```typescript
     * emit('date:suggest', {
     *   date: new Date('2025-11-15'),
     *   reason: 'Better availability on this date'
     * });
     * ```
     */
    'date:suggest': (data: { date: Date; reason: string }) => void;

    /**
     * Suggest an alternative time
     * ChurchTools will update the time field and show a notification
     */
    'time:suggest': (data: { time: string; reason: string }) => void;

    /**
     * Notify ChurchTools about availability status
     * Used to show visual indicators in the dialog
     */
    'availability:status': (data: { available: boolean; conflicts?: string[] }) => void;
}

/**
 * Full type-safe contract for calendar dialog availability extension point
 */
export type CalendarDialogAvailabilityContract = {
    data: CalendarDialogData;
    events: CalendarDialogEvents;
    emits: CalendarDialogEmits;
};
