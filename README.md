```
 ██████╗ ██████╗ ███████╗███████╗██████╗
 ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗
 ██║  ██║██████╔╝█████╗  █████╗  ██████╔╝
 ██║  ██║██╔══██╗██╔══╝  ██╔══╝  ██╔═══╝
 ██████╔╝██║  ██║███████╗███████╗██║
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝

 media storage · transforms · ocr · background removal

 $ npm install dreep
```

# dreep

The official Node.js SDK for [Dreep](https://dreep.cloud) — media storage, image and video transformation, OCR, and background removal.

- **Zero dependencies.** Built on native `fetch` and `node:crypto`.
- **Fully typed.** Written in TypeScript, ships `.d.ts` — every transform parameter is autocompleted and checked.
- **ESM and CommonJS.** `import` and `require` both work.

```bash
npm install dreep
```

Requires Node.js 18 or later.

## Quickstart

```ts
import { Dreep } from "dreep";

const dreep = new Dreep({ apiKey: process.env.DREEP_API_KEY });

// Upload a file, resized and converted on the way in
const asset = await dreep.upload({
  file: fs.createReadStream("hero.jpg"),
  folder: "marketing/2026",
  transform: { width: 1200, format: "webp" },
});

console.log(asset.url);
// https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b

// Build a transformed URL for the same asset — no network call
dreep.url(asset, { width: 400, format: "webp" });
// https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b?width=400&format=webp
```

## Authentication

Create an API key in the **API Keys** page of your Dreep dashboard.

```ts
const dreep = new Dreep({
  apiKey: process.env.DREEP_API_KEY, // required — "drp_live_…"
  signingSecret: process.env.DREEP_SIGNING_SECRET, // optional — only for signedUrl()
});
```

> **Your API key is a full-project credential. Keep it server-side.**
> It must never appear in browser or mobile app code. To upload from a browser,
> use the [presigned upload](#browser-and-large-file-uploads-presigned) flow, where your
> backend hands the client a short-lived URL and the key never leaves your server.
> The SDK throws on construction if it detects a browser environment.

## Uploading

### Direct upload

The file streams through the Dreep API. Simplest option, good up to a few hundred MB.

```ts
const asset = await dreep.upload({
  file: fs.createReadStream("hero.jpg"),
  folder: "marketing/2026",
});
```

`file` accepts a `Buffer`, a `Readable` stream, a `Blob`, or a `File`. Pass `filename`
explicitly when the source doesn't carry one:

```ts
const asset = await dreep.upload({ file: buffer, filename: "hero.jpg" });
```

Every upload resolves to the stored asset:

```ts
{
  id: "2f928a3f-1d2a-4a2b",
  url: "https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b",
  originalFilename: "hero.jpg",
  mimetype: "image/webp",
  format: "webp",          // images only
  width: 1200,             // images only
  height: 800,             // images only
  sizeBytes: 245000,
  status: "ready",
  folderId: "78b52933-…",
  projectId: "3ca76fa8-…",
  createdAt: "2026-08-16T18:53:29.000Z",
}
```

**Choosing a destination.** Three mutually exclusive options — omit all three and the
asset lands in the project's default folder:

```ts
{
  folder: "avatars/2024/q1";
} // slug path; missing folders are created
{
  key: "avatars/2024/q1/me.webp";
} // S3-style key; last segment is the filename
{
  folderId: "78b52933-…";
} // UUID of an existing folder
```

Pass `autoCreateFolders: false` to require that the path already exists — an unknown
path then throws `DreepNotFoundError` instead of creating the folders.

**Transforming on upload.** Anything in `transform` is applied _before_ storage, so the
transformed result is what gets stored and returned — the original is not kept:

```ts
const asset = await dreep.upload({
  file,
  transform: { width: 800, format: "webp", quality: 80 },
});

asset.width; // 800
asset.format; // "webp"

// or apply a saved preset
const thumb = await dreep.upload({ file, presetKey: "thumbnail" });
```

This counts against your plan's monthly transformation quota.

### Browser and large file uploads (presigned)

The bytes go straight to storage and never pass through the Dreep API. Three steps:

```ts
// 1. On your server — get a short-lived upload URL
const upload = await dreep.presignUpload({
  filename: "video.mp4",
  contentType: "video/mp4",
  sizeBytes: 84_000_000,
  folder: "uploads/2026",
});

// 2. Anywhere — PUT the bytes to upload.uploadUrl
await fetch(upload.uploadUrl, { method: "PUT", body: file });

// 3. On your server — finalize
const asset = await dreep.confirmUpload(upload.id);
```

Until `confirm` is called the asset stays `pending` and is excluded from media listings.

**Skipping duplicate uploads.** Pass the file's SHA-256 as `contentHash` and Dreep will
tell you if it already stores that content. When it does, `uploadUrl` is absent and you
can go straight to confirm:

```ts
const upload = await dreep.presignUpload({ …, contentHash });

if (!upload.alreadyExists) {
  await fetch(upload.uploadUrl!, { method: "PUT", body: file });
}

const asset = await dreep.confirmUpload(upload.id);
```

`confirm` also accepts a transform, applied before the asset goes `ready`:

```ts
const asset = await dreep.confirmUpload(upload.id, {
  transform: { width: 1200, format: "webp" },
});
```

## Serving media

Every asset comes back with a ready-to-use `url` — use it as is:

```ts
<img src={asset.url} />
```

### `dreep.url(asset, transform)`

Applies a transform to an asset's URL by appending query parameters. It never builds a
URL from scratch — the host and API version are the API's to decide, so the SDK only ever
adds to what the API handed back.

```ts
asset.url;
// https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b

dreep.url(asset, { width: 400, height: 400, fit: "cover", format: "webp" });
// https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b?width=400&height=400&fit=cover&format=webp

dreep.url(asset, { preset: "thumbnail" });
// https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b?p=thumbnail
```

Pure string work — no network call and no API key, so it's safe in a hot render path. If
you store URLs rather than assets, pass the string directly: `dreep.url(storedUrl, { width: 400 })`.

Transforms run on the fly and are cached, so one original serves every size you ask for.
Requesting an image format on a video extracts a thumbnail; requesting `txt` on an image
or PDF runs OCR and returns plain text.

### `dreep.signedUrl(asset, options)`

For assets in **signed** folders, which aren't fetchable with a bare URL. Appends a
time-limited `exp` and `sig` using your project's signing secret. Requires
`signingSecret` in the client config, and the asset's `id` — the signature is computed
over it — so this one takes the asset, not a bare URL string.

```ts
dreep.signedUrl(asset, { expiresIn: 3600 });
// …/fetch/2f928a3f-1d2a-4a2b?exp=1774118400&sig=a3f9e2b1…

dreep.signedUrl(asset, { expiresIn: 900, transform: { width: 800 } });
```

The link stops working at `exp`. Anyone holding it can fetch the asset until then — no
API key needed — so treat a signed URL as a bearer token and keep expiries short.

### Transform parameters

Accepted by `url()`, `signedUrl()`, `upload()` and `confirmUpload()`:

| Parameter              | Applies to          | Description                                                                                                                                                                                 |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`               | image, video, audio | Output format. Images: `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, `heic`, `heif`. Videos: `mp4`, `webm`, `mov`, `hls`, `m3u8`, `gif`. Audio: `mp3`, `wav`, `aac`. Text: `txt` (runs OCR) |
| `width`, `height`      | image, video        | Target size in pixels, max 4000                                                                                                                                                             |
| `fit`                  | image, video        | `cover`, `contain`, `fill`, `inside`, `outside`                                                                                                                                             |
| `quality`              | image, video        | 1–100                                                                                                                                                                                       |
| `gravity`              | image               | Crop anchor when resizing                                                                                                                                                                   |
| `crop`                 | image               | Explicit crop, `left,top,width,height`                                                                                                                                                      |
| `dpr`                  | image               | Device pixel ratio multiplier, max 3                                                                                                                                                        |
| `rotate`               | image               | `90`, `180` or `270`                                                                                                                                                                        |
| `blur`                 | image               | Blur sigma                                                                                                                                                                                  |
| `bg`                   | image               | Hex fill colour without `#`, e.g. `ffffff`                                                                                                                                                  |
| `radius`               | image               | Corner radius in px, or `max` for a circle                                                                                                                                                  |
| `trimStart`, `trimEnd` | video               | Trim points in seconds                                                                                                                                                                      |
| `videoCodec`           | video               | `h264`, `vp8`, `vp9`, `hevc`                                                                                                                                                                |
| `fps`                  | video               | Output frame rate                                                                                                                                                                           |
| `preset`               | image, video        | A saved preset key, applied instead of individual fields                                                                                                                                    |

Conversion stays within media families — image to image, video to video, HLS or GIF.
Raw files such as PDFs are stored as-is and can't be format-converted.

## Media

```ts
// One page, plus the totals
const { assets, pagination } = await dreep.listMedia({ page: 1, limit: 20 });

assets[0].url; // https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b
pagination.total; // 127 — every asset matching the filter, across all pages

// Filter by folder
const avatars = await dreep.listMedia({
  folder: "avatars/2024",
  recursive: true,
});
const byId = await dreep.listMedia({ folderId: "78b52933-…" });

// Walk every page
for await (const asset of dreep.listAllMedia({ folder: "avatars" })) {
  console.log(asset.filename, asset.url);
}

await dreep.deleteMedia({ id });
```

Deleting an asset removes the original from storage along with every cached transform of
it, and credits the space back against your plan.

## Folders

Folders carry access control, which every asset inside inherits.

```ts
// Creates missing segments, resolves to the leaf folder
const launch = await dreep.createFolder({ path: "2026/q1/launch" });
launch.id; // "78b52933-…"  — pass to uploads as folderId
launch.path; // "2026/q1/launch"

const avatars = await dreep.createFolder({
  name: "Avatars",
  accessControlType: "signed",
  defaultExpirySeconds: 3600,
});

const { folders } = await dreep.listFolders(); // whole project, any depth
const { folders, currentFolder } = await dreep.listFolders({
  path: "avatars/2024",
});
```

Each folder carries `id`, `name`, `slug`, `path`, `parentId` and `accessControlType`.
Because `path` is the full slug path from the project root, one unfiltered `list()` is
enough to build the entire tree.

| Access    | Who can fetch it                                                    |
| --------- | ------------------------------------------------------------------- |
| `public`  | Anyone with the URL. The default                                    |
| `private` | Nobody through the public API — dashboard members only              |
| `signed`  | Anyone holding an unexpired [signed URL](#dreepsignedurlid-options) |

Uploads create folders on demand, so `createFolder` is only necessary when you want to
set access control up front.

## Presets

A named transform you can apply by key, so callers don't repeat parameters and you can
change the recipe without touching call sites.

```ts
const preset = await dreep.createPreset({
  key: "thumbnail",
  name: "Thumbnail",
  width: 200,
  height: 200,
  fit: "cover",
  format: "webp",
});

const presets = await dreep.listPresets();
await dreep.deletePreset({ id: preset.id });

// then, anywhere
dreep.url(asset, { preset: "thumbnail" });
```

## OCR

Extracts text from an image or PDF.

```ts
const { text, blocks } = await dreep.extractText({ file });

// Save the extracted text into Dreep as a .txt asset
const { text, savedAsset } = await dreep.extractText({
  file,
  folder: "receipts/2026",
});
```

`blocks` carries the raw line and word objects with bounding boxes, for when you need
positions rather than just the concatenated text.

Already-uploaded assets can be read without re-uploading, via the `txt` format:

```ts
dreep.url(asset, { format: "txt" });
```

## Background removal

Returns a cutout of the subject with a transparent background, stored as a new asset.

```ts
const asset = await dreep.removeBackground({ file, folder: "products" });
```

The alpha channel is preserved rather than flattened, so one removal serves any number
of background colours as ordinary transforms:

```ts
dreep.url(asset, { bg: "ffffff" });
dreep.url(asset, { bg: "000000" });
```

## Usage

```ts
const { usage, limits } = await dreep.getUsage();

console.log(`${usage.storageBytes} of ${limits.storageBytes} bytes used`);
```

## Errors

Every failure throws a subclass of `DreepError`, carrying the HTTP status and the API's
message.

```ts
import { DreepError, DreepLimitError, DreepNotFoundError } from "dreep";

try {
  const asset = await dreep.upload({ file });
  return asset.url;
} catch (error) {
  if (error instanceof DreepLimitError) {
    // 402 — plan limit reached
    console.log(error.featureKey, error.used, error.limit);
  } else if (error instanceof DreepError) {
    console.log(error.status, error.message);
  }
}
```

| Class                  | Status | Raised when                                                    |
| ---------------------- | ------ | -------------------------------------------------------------- |
| `DreepAuthError`       | 401    | Missing, malformed or revoked API key                          |
| `DreepValidationError` | 400    | Invalid parameters — `error.validationErrors` lists each field |
| `DreepNotFoundError`   | 404    | Unknown asset, folder or preset                                |
| `DreepConflictError`   | 409    | Confirming an upload whose bytes haven't landed yet            |
| `DreepLimitError`      | 402    | Plan limit reached — carries `featureKey`, `used`, `limit`     |
| `DreepConnectionError` | —      | Network failure or timeout                                     |

Timeouts and 5xx responses on safe, idempotent requests are retried twice with
exponential backoff. Uploads are never retried automatically.

## Cancelling and timeouts

Requests time out after 30 seconds. Uploads don't — a large file can legitimately take
minutes — so pass a `signal` when you want to bound one:

```ts
const asset = await dreep.upload({
  file,
  signal: AbortSignal.timeout(120_000),
});

const controller = new AbortController();
const pending = dreep.listMedia({ signal: controller.signal });
controller.abort(); // throws DreepConnectionError
```

Every method accepts `signal`.

## TypeScript

Types ship with the package — no `@types/dreep` needed. The transform parameters are a
discriminated set, so invalid combinations are caught at compile time:

```ts
import type { Asset, Folder, Preset, TransformParams } from "dreep";

dreep.url(asset, { width: 400, fit: "cover" }); // ok
dreep.url(asset, { fit: "squish" }); // Type error
dreep.url(asset, { width: 99_999 }); // Type error — max 4000
```

## Contributing

Issues and pull requests are welcome. For anything larger than a bug fix, open an issue
first so we can agree on the shape before you write code.

### Setup

Requires Node.js 18 or later.

```bash
git clone https://github.com/dreep/dreep-js
cd dreep-js
npm ci            # not `npm install` — respects the lockfile exactly
npm test
```

| Script                     | What it does                                                        |
| -------------------------- | ------------------------------------------------------------------- |
| `npm run build`            | Two `tsc` passes → ESM in `dist/`, CJS in `dist/cjs/`, plus `.d.ts` |
| `npm test`                 | Unit tests via the built-in `node:test` runner, `fetch` stubbed     |
| `npm run test:integration` | Hits a real API — needs `DREEP_API_KEY`, skipped without it         |
| `npm run typecheck`        | `tsc --noEmit` across src and tests                                 |
| `npm run lint`             | Formatting and lint                                                 |

### Running against a local API

Point the SDK at a local `dreep_server` with `DREEP_API_URL` and `DREEP_CDN_URL`. These
are deliberately undocumented in the public config — they exist for development, not as
a self-hosting feature, so don't add them to the client options type.

```bash
DREEP_API_URL=http://localhost:6969 npm run test:integration
```

### House rules

- **No runtime dependencies.** This is the one rule with no exceptions. Everything the
  SDK needs — `fetch`, `FormData`, `crypto` — is in Node 18+. A dependency here becomes
  a dependency in every customer's server, and a supply-chain surface we don't control.
  Dev dependencies need a good reason too.
- **The README is the spec.** If a change alters the public API, update the README in the
  same PR. It's what users read, and it's what we design against.
- **Both module formats must work.** `npm pack`, then verify `require("dreep")` and
  `import "dreep"` both resolve before opening the PR.
- **Everything the API returns is unwrapped.** The HTTP layer strips the
  `{ message, code, data }` envelope; resources return the payload directly.
- **Errors are typed.** A new failure mode gets a `DreepError` subclass, not a bare
  `throw`.

### Releasing

Publishing is done from CI with npm provenance, so the tarball is cryptographically
linked to the commit that built it:

```bash
npm version minor
git push --follow-tags     # the tag triggers the publish workflow
```

> **`1.0.0` can never be published.** That version was published and unpublished under
> this package name in 2021, and npm permanently reserves used version numbers. The
> first stable release is `1.0.1`.

## License

[MIT](LICENSE) © Dreep

Free to use, modify and distribute, including commercially. The software is provided as
is, without warranty.
