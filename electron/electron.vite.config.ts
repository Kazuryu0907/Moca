import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/web'),
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/web/index.html')
        }
      }
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss
        ]
      }
    },
    publicDir: resolve(__dirname, 'graphics'),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})