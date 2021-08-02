import path from "path";
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";


const config = defineConfig({
  resolve: {
    alias: {
      "@": `${path.resolve(__dirname, "src")}`,
    },
    dedupe: ["vue-demi"],
  },

  build: {
    minify: true,
  },

  server: {
    port: 8081,
    proxy:{
        '/proxy': {
          target: 'http://localhost:8088',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/proxy/, '')
        }
    }
  },

  plugins: [
    createVuePlugin()
  ],
});

export default config;