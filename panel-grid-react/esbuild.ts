import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/panel-grid.tsx"],
  outfile: "dist/index.js",
  bundle: true,
  minify: false,
  sourcemap: true,
});
