import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/uploader.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "./lib/uploader.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
});
