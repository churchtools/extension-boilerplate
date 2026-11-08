import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    return defineConfig({
        base: `/ccm/${process.env.VITE_KEY}/`,
        build: {
            // Keep the browser targets used by Vite 7.
            target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
        },
    });
};
