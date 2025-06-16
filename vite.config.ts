import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/web'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'src/web/index.html')
      }
    }
  },
  server: {
    port: 3000
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss')
      ]
    }  
  },
  define: {
    global: 'globalThis'
  }
})