import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Gộp chung antd, @ant-design và các thư viện lõi rc- vào chung 1 cục
            // Điều này fix 100% lỗi Circular Dependency của Antd
            if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) {
              return 'vendor-antd';
            }
            // Tách Three.js ra riêng
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            // Tách Recharts ra riêng
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Các thư viện còn lại (react, react-dom...)
            return 'vendor-core';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
