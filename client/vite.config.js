import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['flame.svg'],
      manifest: {
        name: 'EmberOne',
        short_name: 'EmberOne',
        description: 'PERN Stack starter application with React frontend',
        theme_color: '#eb5e28',
        background_color: '#fffcf2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'AppImages/windows11/SmallTile.scale-100.png',
            sizes: '71x71',
            type: 'image/png'
          },
          {
            src: 'AppImages/windows11/Square150x150Logo.scale-100.png',
            sizes: '150x150',
            type: 'image/png'
          },
          {
            src: 'AppImages/windows11/Square44x44Logo.scale-100.png',
            sizes: '44x44',
            type: 'image/png'
          },
          {
            src: 'AppImages/windows11/StoreLogo.scale-100.png',
            sizes: '50x50',
            type: 'image/png'
          },
          {
            src: 'AppImages/windows11/Wide310x150Logo.scale-100.png',
            sizes: '310x150',
            type: 'image/png'
          },
          {
            src: 'AppImages/windows11/Square44x44Logo.targetsize-256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'AppImages/windows11/LargeTile.scale-400.png',
            sizes: '1240x1240',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:3000'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.js'],
    css: true, // Handle CSS imports during testing
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        './__tests__/setup.js',
      ],
    },
  },
}); 