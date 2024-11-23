import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import {viteSingleFile} from "vite-plugin-singlefile"

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  // resolve:{
  //   // alias:{            
  //   //   os: 'rollup-plugin-node-polyfills/polyfills/os',
  //   // }
  // },
  // optimizeDeps:{
  //   esbuildOptions:{
  //     define:{
  //       global: "globalThis"
  //     },
  //     plugins:[
  //       NodeGlobalsPolyfillPlugin({
  //         process: true,
  //         buffer: true,
  //       }),
  //       NodeModulesPolyfillPlugin()
  //     ]
  //   }
  // },
  server:{
    host: true
  },
  plugins: [react(),viteSingleFile()],
  // plugins: [react(),nodePolyfills({
  //   include:["os"],
  //   globals:{
  //     Buffer: true,
  //     process: true,
  //     global: true,
  //   },
  //   protocolImports: true,
  // })],
  // build:{
    // outDir: "../webserver/"
  // }
  build:{
    // outDir: "../electron/src/hono/dist",
    // outDir: "../actix/dist",
    // outDir: "./src/dist",
    rollupOptions:{
      external: ["react-router","react-router-dom"],
    }
  }
})
