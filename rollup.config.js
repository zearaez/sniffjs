import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

const input = "src/index.ts";

export default [
  // JS bundle (UMD + ESM)
  {
    input,
    output: [
      {
        file: "dist/index.js", // UMD build
        format: "umd",
        name: "@zearaez/sniff-js",
        sourcemap: true
      },
      {
        file: "dist/index.mjs", // ESM build
        format: "esm",
        sourcemap: true
      }
    ],
    plugins: [resolve(), commonjs(), typescript()],
  },

  // Type declarations
  {
    input,
    output: {
      file: "dist/index.d.ts",
      format: "es"
    },
    plugins: [dts()]
  }
];