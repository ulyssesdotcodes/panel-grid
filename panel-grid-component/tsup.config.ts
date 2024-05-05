import { Options, defineConfig } from "tsup";
export const options: Options = {
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  minify: false,
  bundle: true,
  skipNodeModulesBundle: true,
  entry: ["src/panel-grid.ts"],
  target: "node20",
  treeshake: true,
};

export default defineConfig(options);
