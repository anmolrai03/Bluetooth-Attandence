import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({

  plugins: [
    react() ,  
    tailwindcss(),
  ],

  define: {
    global: 'globalThis', // Fix for QR scanner
  },
  optimizeDeps:{
    esbuildOptions: {
      define: {
        global: 'globalThis', // Buffer polyfill if needed
      },
    },
  }
})
