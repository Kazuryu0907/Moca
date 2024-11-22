import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import {nodePolyfills} from "vite-plugin-node-polyfills"

// https://vite.dev/config/
export default defineConfig({
  resolve:{
    // alias:{            
    //   os: 'rollup-plugin-node-polyfills/polyfills/os',
    // }
  },
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
  plugins: [react(),nodePolyfills({
    include:["os"],
    globals:{
      Buffer: true,
      process: true,
      global: true,
    },
    protocolImports: true,
  })],
  build:{
    outDir: "../electron/src/hono/dist"
  }
  // build:{
  //   rollupOptions:{
  //     plugins:[
  //       // nodePolyfills(),
  //       polyfillNode(),
  //     ]
  //   }
  // }
})
