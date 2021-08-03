import path from "path";
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import legacy from '@vitejs/plugin-legacy'

const config = defineConfig({
  base:'./',
  resolve: {
    alias: {
      "@": `${path.resolve(__dirname, "src")}`,
    },
    dedupe: ["vue-demi"],
  },

  build: {
    minify: true,
    cleanCssOptions:{
      level: 1
    }
  },

  server: {
    port: 8081,
    proxy:{
        '/proxy': {
          target: 'https://ab.welife001.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/proxy/, '')
        }
    }
  },

  plugins: [
    createVuePlugin(),
    legacy()
  ],
});

export default config;