import { writeFileSync } from "node:fs";

// The root package.json declares "type": "module", which would make Node treat
// dist/cjs/*.js as ESM and reject the require() build outright. A nested
// package.json flips the type back for that directory only.
writeFileSync(
  new URL("../dist/cjs/package.json", import.meta.url),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
);
