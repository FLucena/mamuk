import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze'
  
  return {
    plugins: [
      react({
        babel: {
          // This adds react-refresh babel plugin in dev
          // It also allows customizing the babel config without ejecting
          plugins: [
            ['babel-plugin-styled-components', { displayName: true, fileName: false }]
          ],
        },
      }),
      isAnalyze && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        // Configure preprocessor options if needed (e.g., scss, less)
      }
    },
    build: {
      cssCodeSplit: true, // Split CSS into smaller chunks
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-components': [
              '@headlessui/react',
              '@heroicons/react',
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-slot',
              'lucide-react',
              'framer-motion'
            ]
          }
        }
      },
      chunkSizeWarningLimit: 800 // Increase from default 500kb to 800kb
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    base: '/', // Ensure base URL is set correctly
    preview: {
      port: 5173,
      strictPort: true
    }
  }
})
