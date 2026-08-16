import { register } from "node:module";

// Entry point for `node --import`. Registering from a separate module is what
// gets the resolver in place before the test files are loaded.
register("./aliasHook.mjs", import.meta.url);
