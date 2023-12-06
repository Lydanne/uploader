import { defineConfig } from "rollup";
import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";

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
  external: ["wx"],
  plugins: [
    nodeResolve(),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
  ],
});
