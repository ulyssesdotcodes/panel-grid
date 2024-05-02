import type { Options } from "tsup";

export const tsup: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  minify: false,
  bundle: true,
  skipNodeModulesBundle: true,
  entry: ["src/panel-grid-react.tsx"],
  target: "node20",
  treeshake: true,
};
