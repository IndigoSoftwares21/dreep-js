# Implementation plan

Internal document. The [README](README.md) is the spec — this is how we build to it.

## Conventions

These are enforced in review. They exist so any file can be opened, understood and
tested without reading its neighbours.

1. **One exported function per file**, at `<area>/<functionName>/index.ts`. The folder is
   named after the function, so the import path reads as the call: `import buildAssetUrl
   from "@/url/buildAssetUrl"`.
2. **`const` arrow functions, default export only.** One export per file, every file, no
   exceptions:

   ```ts
   /**
    * Builds a delivery URL for an asset.
    *
    * @example
    * buildAssetUrl({ id, transform: { width: 400 } })
    * // https://cdn.dreep.cloud/api/v1/fetch/<id>?width=400
    */
   const buildAssetUrl = ({ id, transform }: BuildAssetUrlParams): string => {
       // …
   };

   export default buildAssetUrl;
   ```

   The one place named exports appear is `src/index.ts`, which re-exports the public
   surface so users can write `import { Dreep } from "dreep"`.

   Named parameters in a single object, always — so call sites read as
   `uploadMedia({ request, file, folder })` and adding a parameter never reshuffles an
   argument list.
3. **Utils follow `utils/<utilName>/index.ts`** — same rule, no shared `helpers.ts`
   dumping grounds.
4. **No magic strings.** Every literal that crosses a boundary — HTTP methods, header
   names, paths, query parameter names, error codes, env var names, enum values — comes
   from `src/constants/`. If you type a quoted string outside `constants/` or a test
   fixture, it belongs in a constant.
5. **No runtime dependencies.** Non-negotiable, see the README's house rules.
6. **Types are separate from logic.** `src/types/` holds interfaces only, no runtime code.
7. **JSDoc on everything public**, with `@example` on the methods people actually call.
   Internal functions get JSDoc only where the *why* isn't obvious from the name — a
   comment explaining what the code already says is noise.
8. **Every function has a test file beside it**, named after the function —
   `toDreepError/toDreepError.test.ts`, not `index.test.ts`. A tree of identical
   `index.test.ts` tabs is unreadable in an editor.

## Toolchain

| Tool | Version | Role |
| --- | --- | --- |
| `typescript` | `^7.0.2` | Compiler, both builds |
| `@types/node` | `^26` | Node globals |
| `tsc-alias` | `^1` | Rewrites `@/` to relative paths at build time |

Three dev dependencies, zero runtime dependencies. `tsc-alias` earns its place because
TypeScript resolves path aliases for typechecking but emits them unchanged — without it
the published JS contains `require("@/utils/…")`, which fails at runtime. It's the same
approach `dreep_server` already uses.

> **Alternative considered:** Node's native `imports` field (`#utils/*`) needs no tooling
> at all, but the mapping has to be declared twice for the dual ESM/CJS build and TS only
> resolves it under `nodenext`. `tsc-alias` is the simpler, already-proven path here.

### TypeScript 7 differences

Two options that every older tsconfig on the internet still uses were **removed** in TS 7,
and both bite this setup:

- **`baseUrl` is gone.** Path mappings must be relative on their own:
  `"paths": { "@/*": ["./src/*"] }`. There is no base to resolve against.
- **`moduleResolution: "node"` (node10) is gone.** The CJS build uses `"Bundler"`
  resolution and `"module": "CommonJS"` — the resolution mode and the emit format are
  independent, so this still emits real `require()` calls.

### Scripts

```jsonc
{
  "build": "npm run build:esm && npm run build:cjs",
  "build:esm": "tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json",
  "build:cjs": "tsc -p tsconfig.cjs.json && tsc-alias -p tsconfig.cjs.json",
  "dev": "tsc -p tsconfig.build.json --watch",
  "test": "node --test 'src/**/*.test.ts'",
  "test:watch": "node --test --watch 'src/**/*.test.ts'",
  "typecheck": "tsc --noEmit"
}
```

`dev` and `test:watch` are the two loops: one recompiling on save, one re-running the
tests for the file you touched. Both are native — no nodemon, no vitest, and no build
step before tests: Node runs the `.ts` files directly by stripping the types. Verified on
Node 22.22, no flag needed.

> Contributors therefore need **Node 22+**, even though the published package supports
> Node 18+. Type stripping is a test-time convenience; it has no bearing on what ships.

## Layout

```
src/
  index.ts                      Public exports. The only file users' imports resolve to
  Dreep/index.ts                Composition root — builds the request fn, wires resources

  constants/
    http.ts                     HTTP_METHOD, HEADER, CONTENT_TYPE, HTTP_STATUS
    api.ts                      API_URL, API_PATH, QUERY_PARAM (no CDN host — see below)
    transform.ts                IMAGE_FORMAT, VIDEO_FORMAT, FIT, GRAVITY, VIDEO_CODEC…
    storage.ts                  ACCESS_CONTROL_TYPE, ASSET_STATUS
    errors.ts                   ERROR_CODE, ERROR_MESSAGE
    defaults.ts                 REQUEST_TIMEOUT_MS, RETRY_ATTEMPTS, DEFAULT_PAGE_SIZE
    env.ts                      ENV_VAR names for the internal URL overrides

  types/
    config.ts    asset.ts    folder.ts    preset.ts    usage.ts    transform.ts
    request.ts                  RequestFn — the seam every resource depends on

  errors/
    DreepError/index.ts         Base: status, code, requestId
    DreepAuthError/index.ts     DreepValidationError, DreepNotFoundError,
    …one file per class         DreepConflictError, DreepLimitError, DreepConnectionError
    toDreepError/index.ts       Maps an HTTP status + body onto the right class

  http/
    createRequest/index.ts      Closes over config, returns the RequestFn
    sendRequest/index.ts        The single fetch() call in the codebase
    buildHeaders/index.ts       Authorization + content type
    parseResponse/index.ts      Unwraps { message, code, data }, throws on !ok
    withRetry/index.ts          Backoff wrapper
    isRetryable/index.ts        Status/method predicate

  url/
    buildAssetUrl/index.ts      url()
    buildSignedAssetUrl/index.ts  signedUrl()

  resources/                    One folder per public method, named identically
    upload/            presignUpload/     confirmUpload/
    listMedia/         listAllMedia/      deleteMedia/
    createFolder/      listFolders/
    createPreset/      listPresets/       deletePreset/
    removeBackground/  extractText/       getUsage/

  utils/
    buildQueryString/index.ts   Drops undefined, encodes, stable key order
    buildFormData/index.ts      File + fields → FormData
    toTransformQuery/index.ts   TransformParams → query record via QUERY_PARAM
    computeSignature/index.ts   HMAC-SHA256
    resolveFilename/index.ts    Filename from a Buffer/Stream/File/Blob input
    withTimeoutSignal/index.ts  Caller signal + default timeout → one signal
    assertServerRuntime/index.ts  Throws if constructed in a browser
```

Every folder above gets a `<functionName>.test.ts` next to its `index.ts`.

### Aliases at test time

`paths` is a compile-time fiction: Node resolves imports itself and reads `@/errors/…` as
a bare package specifier. `tsc-alias` fixes the published build, but tests run against
source, so `scripts/aliasHook.mjs` — a ~25-line resolver registered through `--import` —
maps `@/` onto `src/` for the test process. It tries `name.ts` then `name/index.ts`, since
both spellings exist. No dependency, and it never touches what ships.

### The public surface is flat

Sixteen methods, no namespaces. `dreep.delete()` was never possible — media, presets and
folders are all deletable — so a namespace would only have grouped names that already
carry their noun. Flat drops a level of indirection and makes each file *be* a method:

| Method | File | Endpoint |
| --- | --- | --- |
| `dreep.upload()` | `resources/upload` | `POST /upload` |
| `dreep.presignUpload()` | `resources/presignUpload` | `POST /upload/presign` |
| `dreep.confirmUpload()` | `resources/confirmUpload` | `POST /upload/:id/confirm` |
| `dreep.listMedia()` | `resources/listMedia` | `GET /media` |
| `dreep.listAllMedia()` | `resources/listAllMedia` | `GET /media`, paged |
| `dreep.deleteMedia()` | `resources/deleteMedia` | `DELETE /media/:id` |
| `dreep.createFolder()` | `resources/createFolder` | `POST /folders` |
| `dreep.listFolders()` | `resources/listFolders` | `GET /folders` |
| `dreep.createPreset()` | `resources/createPreset` | `POST /presets` |
| `dreep.listPresets()` | `resources/listPresets` | `GET /presets` |
| `dreep.deletePreset()` | `resources/deletePreset` | `DELETE /presets/:id` |
| `dreep.removeBackground()` | `resources/removeBackground` | `POST /bg-remove` |
| `dreep.extractText()` | `resources/extractText` | `POST /ocr` |
| `dreep.getUsage()` | `resources/getUsage` | `GET /usage` |
| `dreep.url()` | `url/buildAssetUrl` | none — string only |
| `dreep.signedUrl()` | `url/buildSignedAssetUrl` | none — string only |

The two URL helpers are the only place a file name differs from its method: internally
they're descriptive, externally they're short.

**This is a one-way door.** Adding namespaces later breaks every call site, so it's a bet
that the public API stays around this size. Dashboard-only endpoints don't count.

### No CDN host in the SDK

`url()` and `signedUrl()` **append to the URL the API returned** rather than building one.
The server derives the delivery host from `API_CDN_URL`/`API_BASE_URL` and the version
from `API_VERSION` ([buildAssetUrl](../dreep_server/src/utils/buildAssetUrl.ts)), so any
host baked in here would be a second source of truth that breaks on local dev, staging, a
CNAME change, or a version bump. `fetchAppAsset` reads `format` as a query parameter, so
transforms are pure query-string appends — no path or extension rewriting either.

`signedUrl()` still needs the asset **id** for the HMAC, which is why it takes the asset
rather than a bare URL string.

## No magic strings, concretely

```ts
// constants/http.ts
export const HTTP_METHOD = { GET: "GET", POST: "POST", PUT: "PUT", DELETE: "DELETE" } as const;
export const HEADER = { AUTHORIZATION: "Authorization", CONTENT_TYPE: "Content-Type" } as const;
export const CONTENT_TYPE = { JSON: "application/json", FORM_DATA: "multipart/form-data" } as const;

// constants/api.ts
export const API_PATH = {
  UPLOAD: "/upload",
  UPLOAD_PRESIGN: "/upload/presign",
  MEDIA: "/media",
  FOLDERS: "/folders",
  PRESETS: "/presets",
  OCR: "/ocr",
  BG_REMOVE: "/bg-remove",
  USAGE: "/usage",
  FETCH: "/fetch",
} as const;

/** Paths carrying a path parameter, so no call site interpolates a URL by hand. */
export const buildApiPath = {
  uploadConfirm: (id: string) => `${API_PATH.UPLOAD}/${id}/confirm`,
  mediaById: (id: string) => `${API_PATH.MEDIA}/${id}`,
  presetById: (id: string) => `${API_PATH.PRESETS}/${id}`,
} as const;

/** Wire names for every transform and list parameter. */
export const QUERY_PARAM = {
  FORMAT: "format", WIDTH: "width", HEIGHT: "height", FIT: "fit", QUALITY: "quality",
  PRESET: "p", EXPIRES: "exp", SIGNATURE: "sig", PAGE: "page", LIMIT: "limit",
  FOLDER: "folder", FOLDER_ID: "folderId", RECURSIVE: "recursive",
} as const;
```

The payoff: renaming `p` to `preset` on the API touches one line, and a typo in a query
key becomes a compile error instead of a silently ignored parameter.

## Build order

Bottom-up, so every phase is testable the moment it's written and nothing is stubbed.

### Phase 0 — Scaffold
`package.json` (exports map, `files`, `engines`), `tsconfig.json` + `tsconfig.build.json`
+ `tsconfig.cjs.json`, `LICENSE`, `.gitignore`, publish workflow with `--provenance`.
**Done when** `npm run build` emits an empty-but-valid dual package and `npm pack`
contains only `dist/`.

### Phase 1 — Constants and types
No logic, no tests — these are declarations. Everything downstream imports from here, so
getting the names right now avoids churn later.
**Done when** `npm run typecheck` passes and no other phase needs a string literal.

### Phase 2 — Errors
One class per file plus `toDreepError`, which is the only place status codes map to
classes.
**Tests:** each status produces the right class; `DreepLimitError` carries `featureKey`,
`used`, `limit` off the 402 body; an unrecognised status falls back to `DreepError`.

### Phase 3 — Utils
Pure functions, no I/O, the easiest things in the codebase to test exhaustively.
**Tests:** `buildQueryString` drops `undefined` and encodes correctly; `toTransformQuery`
maps every parameter; `computeSignature` matches a known-good vector generated from the
server's own signing code; `resolveFilename` handles all four input kinds.

### Phase 4 — HTTP layer
`sendRequest` is the only place `fetch` is called. `createRequest` closes over the API key
and returns the `RequestFn` every resource takes as its first argument — that seam is what
makes resources testable without touching the network.
**Tests:** stub `globalThis.fetch`; assert the auth header, the unwrapping of
`{ message, code, data }`, error mapping, retry on 5xx, no retry on POST, and that an
aborted signal surfaces as `DreepConnectionError`.

### Phase 5 — URL builders
Pure string building, no network, no API key.
**Tests:** format becomes a file extension; params serialise in stable order; a signed URL
verifies against the server's `verifyAssetAccess` logic; `signedUrl` without a configured
`signingSecret` throws.

### Phase 6 — Resources
Each takes `RequestFn` and returns typed data. Fifteen small files, all the same shape.
**Tests:** each asserts the method, path and body it sends, against a fake `RequestFn` —
no `fetch` involved at this level.

### Phase 7 — Composition root
`Dreep/index.ts` builds the request function and hangs the namespaces off it.
`index.ts` re-exports the class, the error classes and the public types.
**Tests:** the constructor rejects a missing API key and throws in a browser-like global;
namespaces are all present.

### Phase 8 — Ship
Integration tests against a real key, `npm pack` + dual-format smoke test, README examples
executed as a script so the docs can't drift, then publish `0.1.0`.

## Signing matches the API as it is today

No server change. `buildSignedAssetUrl` replicates what `fetchAppAsset` does before it
verifies, so a signed URL carrying transforms validates:

1. Snap `width` and `height` **up** to the next `WIDTH_BREAKPOINTS` value, `quality` to
   the **nearest** `QUALITY_BREAKPOINTS` value, and `dpr` up through `DPR_BREAKPOINTS`.
2. Serialise the snapped params in the server's fixed key order, then
   `JSON.stringify({ ...canonical, p: presetKey })`.
3. Sign `assetId:expires:paramsString`, or `assetId:expires` when there are no params and
   no preset.

The breakpoint tables live in `constants/transform.ts`, copied from
`dreep_server/src/services/sharp/constants.ts`:

```ts
export const WIDTH_BREAKPOINTS = [16, 32, 64, 128, 256, 384, 512, 640, 750, 828,
  960, 1080, 1200, 1440, 1920, 2560, 3200, 4000] as const;
export const QUALITY_BREAKPOINTS = [50, 65, 75, 85, 95, 100] as const;
export const DPR_BREAKPOINTS = [1, 2, 3] as const;
```

**This is duplicated state and will drift if nobody guards it.** Two mitigations, both
required:

- A test signs a fixed set of params and asserts the exact hex signature, generated once
  from the server's own `signAssetAccess`. Any change to snapping on either side turns
  that test red rather than producing 401s in production.
- A comment on the server's `constants.ts` pointing here, so whoever edits the tables
  knows a published SDK depends on them.

## Settled

- `new Dreep()`, not a factory — the class is the one exception to the arrow-function rule.
- Flat public API, no namespaces.
- `url()`/`signedUrl()` append to the API's URL; the SDK holds no CDN host.
- Signing replicates the server's current behaviour; no server change.
- `removeBackground` is a top-level method.
