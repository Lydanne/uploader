import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "./src/index.ts",
  output: [
    {
      file: "./lib/uploader.cjs.js",
      format: "cjs",
    },
    {
      file: "./lib/uploader.esm.js",
      format: "esm",
    },
  ],
  plugins: [typescript()],
});
