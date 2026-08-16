import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const ALIAS_PREFIX = "@/";
const SRC_DIR = resolvePath(dirname(fileURLToPath(import.meta.url)), "../src");

// Tests import source directly, and Node has no knowledge of tsconfig `paths` —
// it sees "@/errors/DreepError" as a bare package specifier and fails. tsc-alias
// solves this for the published build only, so this hook covers the test run.
// A file may be either `name.ts` or `name/index.ts`; both spellings are used.
const resolveAlias = (specifier) => {
    const base = resolvePath(SRC_DIR, specifier.slice(ALIAS_PREFIX.length));

    for (const candidate of [`${base}.ts`, resolvePath(base, "index.ts")]) {
        if (existsSync(candidate)) {
            return pathToFileURL(candidate).href;
        }
    }

    return null;
};

export const resolve = (specifier, context, nextResolve) => {
    if (!specifier.startsWith(ALIAS_PREFIX)) {
        return nextResolve(specifier, context);
    }

    const resolved = resolveAlias(specifier);

    if (!resolved) {
        return nextResolve(specifier, context);
    }

    return nextResolve(resolved, context);
};
