import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split the 3D stack out of the app bundle so the UI shell can
          // paint while the character engine is still being fetched.
          manualChunks: {
            three: ['three'],
            character: ['mmd-parser'],
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true'
        ? null
        : {
            // These are mutable runtime files, not application source. Watching
            // them causes a full refresh whenever MYRAA saves memory or logs.
            ignored: [
              '**/.myraa-data/**',
              '**/cognition/*.json',
              '**/logs/**',
              '**/memories.json',
              '**/settings.json',
              '**/secrets.json',
            ],
          },
    },
  };
});
