/**
 * ChurchTools Extension Boilerplate
 *
 * Main exports for the extension library
 *
 * This file supports both build modes:
 * - Simple mode: Use loadEntryPoint() - entry points bundled together
 * - Advanced mode: Use loadEntryPoint() - entry points code-split on demand
 *
 * Using loadEntryPoint() works optimally in both modes:
 * - Simple mode: Returns pre-loaded entry points immediately
 * - Advanced mode: Dynamically imports and code-splits entry points
 */

// Core functionality
export { renderExtension, KEY } from './main';

// Types
export type { ExtensionContext, EntryPoint, CleanupFunction } from './types/extension';
export type { ExtensionInstance } from './main';

// Entry point loaders - work in both simple and advanced modes
// In simple mode: Entry points are bundled, returned immediately
// In advanced mode: Entry points are loaded on demand (code splitting)
export {
    loadEntryPoint,
    getAvailableEntryPoints,
    hasEntryPoint,
    registerEntryPoint,
    configureExtension,
} from './loaders';

// Configuration types
export type { ExtensionConfig } from './loaders';
