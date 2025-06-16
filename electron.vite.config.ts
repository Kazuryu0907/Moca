import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { builtinModules } from 'module'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main.ts')
        },
        external: [
          'electron',
          'fsevents',
          ...builtinModules,
          ...builtinModules.map(m => `node:${m}`)
        ]
      }
    },
    resolve: {
      extensions: ['.js', '.ts', '.json']
    },
    define: {
      __dirname: '__dirname',
      __filename: '__filename'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload.ts')
        },
        external: [
          'electron',
          ...builtinModules,
          ...builtinModules.map(m => `node:${m}`)
        ]
      }
    },
    resolve: {
      extensions: ['.js', '.ts', '.json']
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
    server: {
      port: 5173
    },
    resolve: {
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@': resolve(__dirname, 'src')
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
    define: {
      global: 'globalThis'
    }
  }
})