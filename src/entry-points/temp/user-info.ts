import type { EntryPoint } from '../lib/main';

/**
 * User info entry point
 * Displays detailed information about the current user
 */
const userInfoEntryPoint: EntryPoint = ({ user, element }) => {
    element.innerHTML = `
        <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
            <h1>User Information</h1>
            <div style="margin-top: 1rem;">
                <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                <p><strong>ID:</strong> ${user.id}</p>
            </div>
        </div>
    `;
};

// Named export for simple mode (static import)
export { userInfoEntryPoint };

// Default export for advanced mode (dynamic import)
export default userInfoEntryPoint;
