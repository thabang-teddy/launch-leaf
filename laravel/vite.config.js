import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        // Force IPv4 so the origin matches http://launch-leaf.test
        host: '127.0.0.1',
        port: 5173,
        // Tell the Laravel Vite plugin what URL to inject into <script> tags.
        // Without this it auto-detects [::1] when Node resolves "localhost" to IPv6.
        origin: 'http://127.0.0.1:5173',
        // Allow requests from any .test domain (Herd) or localhost
        cors: {
            origin: [
                /https?:\/\/.*\.test(:\d+)?$/,
                /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
            ],
        },
    },
});
