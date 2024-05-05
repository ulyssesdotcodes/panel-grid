import { defineConfig } from "tsup";
import { options } from "./tsup.config";

export default defineConfig({
  ...options,
  noExternal: [/lit.*/],
});
