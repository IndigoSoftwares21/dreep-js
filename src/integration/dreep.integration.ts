import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import Dreep from "@/Dreep";
import DreepNotFoundError from "@/errors/DreepNotFoundError";
import type { Asset } from "@/types/asset";

/**
 * Runs against the live API rather than a stub, which is the only way to catch
 * the SDK sending a field name the API silently ignores. Skipped entirely
 * without credentials, so it never blocks a normal test run.
 *
 * Run with: npm run test:integration
 */
const apiKey = process.env.DREEP_API_KEY;
const signingSecret = process.env.DREEP_SIGNING_SECRET;

/** A 1x1 transparent PNG — the smallest valid image to round-trip. */
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const TEST_FOLDER = "sdk-integration-test";

describe("live API", { skip: !apiKey && "DREEP_API_KEY not set" }, () => {
  const dreep = new Dreep({
    apiKey: apiKey ?? "",
    ...(signingSecret === undefined ? {} : { signingSecret }),
  });

  let uploaded: Asset | undefined;

  before(async () => {
    uploaded = await dreep.upload({
      file: PIXEL_PNG,
      filename: `sdk-${Date.now()}.png`,
      folder: TEST_FOLDER,
    });
  });

  // Always clean up, even if an assertion above failed.
  after(async () => {
    if (uploaded) {
      await dreep.deleteMedia({ id: uploaded.id });
    }
  });

  test("upload returns the documented asset shape", () => {
    assert.ok(uploaded, "upload should resolve");
    assert.match(uploaded.id, /^[0-9a-f-]{36}$/);
    assert.ok(uploaded.url.startsWith("http"), uploaded.url);
    assert.equal(uploaded.mimetype, "image/png");
    assert.ok(uploaded.sizeBytes > 0);
    assert.equal(uploaded.status, "ready");
  });

  test("the returned URL serves the asset", async () => {
    const response = await fetch(uploaded!.url);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
  });

  test("url() with a transform serves a transformed asset", async () => {
    const response = await fetch(dreep.url(uploaded!, { format: "webp" }));

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
  });

  test("listMedia finds the uploaded asset, with a usable url", async () => {
    const { assets, pagination } = await dreep.listMedia({ folder: TEST_FOLDER });
    const found = assets.find((asset) => asset.id === uploaded!.id);

    assert.ok(found, "uploaded asset should appear in its folder listing");
    assert.ok(found.url.startsWith("http"), found.url);
    assert.equal(typeof found.sizeBytes, "number");
    assert.ok(pagination.total >= 1);
  });

  test("listFolders returns the folder the upload created", async () => {
    const { folders } = await dreep.listFolders();

    assert.ok(
      folders.some((folder) => folder.path === TEST_FOLDER),
      "upload should have created the folder on demand",
    );
  });

  test("getUsage returns numeric counters", async () => {
    const usage = await dreep.getUsage();

    // Numbers, not the strings the API sends for BIGINT columns.
    assert.equal(typeof usage.storageBytes, "number");
    assert.ok(Number.isFinite(usage.storageBytes));
    assert.equal(typeof usage.imageCount, "number");
  });

  test("listPresets resolves", async () => {
    assert.ok(Array.isArray(await dreep.listPresets()));
  });

  test("a missing asset raises DreepNotFoundError", async () => {
    await assert.rejects(
      dreep.deleteMedia({ id: "00000000-0000-0000-0000-000000000000" }),
      (error: unknown) => error instanceof DreepNotFoundError,
    );
  });
});
