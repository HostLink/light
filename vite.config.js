import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';


export default defineConfig({
    plugins: [
        dts()
    ],
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'lib/index.ts'),
            name: 'light',
            // the proper extensions will be added
            fileName: 'light',
        },
        rollupOptions: {
            external: ["axios", "json-to-graphql-query", "@github/webauthn-json"],
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8888/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})