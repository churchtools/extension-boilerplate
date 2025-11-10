import type { EntryPoint } from '../main';
import type { CalendarDialogData } from '../extension-points/calendar-dialog';

/**
 * Calendar Availability Entry Point
 *
 * Demonstrates event-based communication with ChurchTools.
 * This entry point:
 * - Receives initial date/time from ChurchTools
 * - Listens for changes to date/time
 * - Displays user availability
 * - Suggests alternative times back to ChurchTools
 */
const calendarAvailabilityEntryPoint: EntryPoint<CalendarDialogData> = ({
    data,
    on,
    off,
    emit,
    element,
    churchtoolsClient,
}) => {
    console.log('[Calendar Availability] Initializing with data:', data);

    // Function to render availability UI
    function renderAvailability(date: Date, time: string, duration: number) {
        element.innerHTML = `
            <div style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                <h3 style="margin-top: 0;">Availability Check</h3>
                <p><strong>Date:</strong> ${date.toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>

                <div id="availability-status" style="margin: 1rem 0; padding: 0.5rem; background: #fff; border-radius: 4px;">
                    <p>Checking availability...</p>
                </div>

                <h4>Alternative Times</h4>
                <div id="alternatives" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="suggest-btn" data-time="10:00">10:00 AM</button>
                    <button class="suggest-btn" data-time="14:00">2:00 PM</button>
                    <button class="suggest-btn" data-time="16:00">4:00 PM</button>
                </div>
            </div>
        `;

        // Simulate availability check
        setTimeout(() => {
            const statusEl = element.querySelector('#availability-status');
            if (statusEl) {
                const isAvailable = Math.random() > 0.5;
                statusEl.innerHTML = `
                    <p style="color: ${isAvailable ? 'green' : 'orange'};">
                        ${isAvailable ? '✓ Available' : '⚠ Limited availability'}
                    </p>
                `;

                // Emit availability status to ChurchTools
                emit('availability:status', {
                    available: isAvailable,
                    conflicts: isAvailable ? [] : ['Team meeting', 'Another event'],
                });
            }
        }, 1000);

        // Handle suggestion clicks
        element.querySelectorAll('.suggest-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const suggestedTime = (btn as HTMLElement).dataset.time!;
                console.log('[Calendar Availability] Suggesting time:', suggestedTime);

                // Emit suggestion to ChurchTools
                emit('time:suggest', {
                    time: suggestedTime,
                    reason: 'Better availability at this time',
                });
            });
        });
    }

    // Initial render
    renderAvailability(data.selectedDate, data.selectedTime, data.duration);

    // Listen for updates from ChurchTools
    const dateChangedHandler = (newDate: Date) => {
        console.log('[Calendar Availability] Date changed:', newDate);
        renderAvailability(newDate, data.selectedTime, data.duration);
        data.selectedDate = newDate; // Update local data reference
    };

    const timeChangedHandler = (newTime: string) => {
        console.log('[Calendar Availability] Time changed:', newTime);
        renderAvailability(data.selectedDate, newTime, data.duration);
        data.selectedTime = newTime; // Update local data reference
    };

    const durationChangedHandler = (newDuration: number) => {
        console.log('[Calendar Availability] Duration changed:', newDuration);
        renderAvailability(data.selectedDate, data.selectedTime, newDuration);
        data.duration = newDuration; // Update local data reference
    };

    const dialogClosingHandler = () => {
        console.log('[Calendar Availability] Dialog closing, cleaning up...');
    };

    // Subscribe to events
    on('date:changed', dateChangedHandler);
    on('time:changed', timeChangedHandler);
    on('duration:changed', durationChangedHandler);
    on('dialog:closing', dialogClosingHandler);

    // Return cleanup function
    return () => {
        console.log('[Calendar Availability] Cleanup called');
        off('date:changed', dateChangedHandler);
        off('time:changed', timeChangedHandler);
        off('duration:changed', durationChangedHandler);
        off('dialog:closing', dialogClosingHandler);
    };
};

// Named export for simple mode
export { calendarAvailabilityEntryPoint };

// Default export for advanced mode
export default calendarAvailabilityEntryPoint;
