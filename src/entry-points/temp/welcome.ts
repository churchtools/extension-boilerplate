import type { EntryPoint } from '../lib/main';

/**
 * Simple welcome message entry point
 * Displays a welcome message with the user's name
 */
const welcomeEntryPoint: EntryPoint = ({ user, element }) => {
    element.innerHTML = `
        <div style="display: flex; place-content: center; place-items: center; height: 100vh;">
            <h1>Welcome ${[user.firstName, user.lastName].join(' ')}</h1>
        </div>
    `;
};

// Named export for simple mode (static import)
export { welcomeEntryPoint };

// Default export for advanced mode (dynamic import)
export default welcomeEntryPoint;
