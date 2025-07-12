import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { builtinModules } from 'node:module'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            minify: 'terser',  // Aggressive minification
            chunkSizeWarningLimit: 1000, // Disable size warnings
            reportCompressedSize: true,  // Show actual compressed sizes
            rollupOptions: {
              external: [
                ...builtinModules,
                'sharp',
                'fluent-ffmpeg',
                '@ffmpeg-installer/ffmpeg',
                '@ffprobe-installer/ffprobe',
                'ffmpeg-static',
                'ffprobe-static'
              ],
              output: {
                manualChunks: (id) => {
                  if (id.includes('node_modules')) {
                    return 'vendor'; // Better chunking
                  }
                }
              },
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
})