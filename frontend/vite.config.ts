import { defineConfig } from 'vite'
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: true,
        port: 5173,
        https: {
            key: fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.pem')),
        },
        watch: {
            usePolling: true
        }
    }
})
