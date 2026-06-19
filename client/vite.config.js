import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Diagnósticos Soft',
        short_name: 'DiagSoft',
        description: 'Software de gestión de diagnósticos',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            size: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            size: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            size: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
