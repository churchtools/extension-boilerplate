/**
 * Entry Point Registry
 *
 * This file is where you register your extension's entry points.
 * Add your entry points to the registry below.
 *
 * Entry points are the different UI components your extension provides
 * that can be rendered in various locations within ChurchTools.
 */

import type { EntryPoint } from '../types/extension';

/**
 * Entry point loader function type
 * Returns a promise that resolves to a module with a default export
 */
export type EntryPointLoader = () => Promise<{ default: EntryPoint }>;

/**
 * Entry Point Registry
 *
 * Add your entry points here by mapping a name to a dynamic import.
 * The import path should be relative to this file.
 *
 * Example:
 * ```typescript
 * myNewFeature: () => import('./my-new-feature'),
 * ```
 */
export const entryPointRegistry: Record<string, EntryPointLoader> = {
    // Admin configuration entry point
    admin: () => import('./admin'),

    // Main module entry point
    main: () => import('./main'),

    // Add your custom entry points here:
    // myFeature: () => import('./my-feature'),
};
