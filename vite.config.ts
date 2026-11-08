import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { copyFileSync, readFileSync } from 'fs';

// https://vitejs.dev/config/
export default ({ mode }) => {
    if (mode === 'development') {
        // load the .env file only in development mode
        process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    }

    // Read the key from manifest.json
    let key = 'default';
    try {
        const manifestPath = resolve(import.meta.dirname, 'manifest.json');
        const manifestContent = readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        key = manifest.key || 'default';
    } catch (error) {
        console.warn('Could not read manifest.json, will use `default` for key.');
    }

    const isDevelopment = mode === 'development';
    const buildMode = process.env.VITE_BUILD_MODE || 'simple';

    // Create a unique global name for UMD based on the extension key
    // This prevents namespace collisions when multiple extensions are loaded
    const globalName = `ChurchToolsExtension_${key}`;

    console.log(`Building in ${buildMode} mode for key: ${key}`);

    // Simple mode: Single bundle with all entry points
    // Disable code splitting to bundle everything together
    const simpleBuildConfig = {
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.ts'),
            name: globalName,
            formats: ['es'],
            fileName: (format) => `extension.${format}.js`,
        },
        rolldownOptions: {
            output: {
                // Inline all dynamic imports to create a single bundle
                codeSplitting: false,
            },
        },
    };

    // Advanced mode: Code splitting with dynamic imports
    const advancedBuildConfig = {
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.ts'),
            name: globalName,
            formats: ['es'],
            fileName: (format) => `extension.${format}.js`,
        },
        // Enable code splitting for dynamic imports
        modulePreload: false,
        // Smaller chunk size threshold for better splitting
        chunkSizeWarningLimit: 100,
    };

    return defineConfig({
        // For development, use the ccm path
        // For production library builds, use relative paths so ChurchTools can control deployment location
        base: `/extensions/${key}/`,
        build: {
            // Keep the browser targets used by Vite 7.
            target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
            ...(isDevelopment ? {} : (buildMode === 'advanced' ? advancedBuildConfig : simpleBuildConfig)),
        },
        plugins: isDevelopment ? [] : [
            // Copy manifest.json to dist after build
            {
                name: 'copy-manifest',
                closeBundle() {
                    const manifestSource = resolve(import.meta.dirname, 'manifest.json');
                    const manifestDest = resolve(import.meta.dirname, 'dist/manifest.json');
                    try {
                        copyFileSync(manifestSource, manifestDest);
                        console.log('✓ Copied manifest.json to dist/');
                    } catch (error) {
                        console.error('Failed to copy manifest.json:', error);
                    }
                },
            },
        ],
    });
};
