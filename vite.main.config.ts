import { defineConfig } from 'vite'
import { resolve } from 'path'
import { builtinModules } from 'module'

export default defineConfig({
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'main',
      fileName: 'main',
      formats: ['cjs']
    },
    rollupOptions: {
      external: [
        'electron',
        'fsevents',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`)
      ],
      output: {
        entryFileNames: '[name].js'
      }
    },
    minify: process.env.NODE_ENV === 'production'
  },
  resolve: {
    extensions: ['.js', '.ts', '.json']
  },
  define: {
    __dirname: '__dirname',
    __filename: '__filename'
  }
})