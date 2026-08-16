import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import Dreep from "@/Dreep";
import DreepError from "@/errors/DreepError";
import { ERROR_MESSAGE } from "@/constants/errors";

const API_KEY = "drp_live_test";

const ASSET = {
  id: "2f928a3f-1d2a-4a2b",
  url: "https://cdn.dreep.cloud/api/v1/fetch/2f928a3f-1d2a-4a2b",
};

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "document");
});

test("rejects a missing API key", () => {
  assert.throws(
    () => new Dreep({ apiKey: "" }),
    (error: unknown) =>
      error instanceof DreepError &&
      error.message === ERROR_MESSAGE.MISSING_API_KEY,
  );
});

test("refuses to construct in a browser", () => {
  Object.assign(globalThis, { window: {}, document: {} });

  assert.throws(
    () => new Dreep({ apiKey: API_KEY }),
    (error: unknown) =>
      error instanceof DreepError &&
      error.message === ERROR_MESSAGE.BROWSER_RUNTIME,
  );
});

test("exposes every documented method", () => {
  const dreep = new Dreep({ apiKey: API_KEY });

  const expected = [
    "upload",
    "presignUpload",
    "confirmUpload",
    "listMedia",
    "listAllMedia",
    "deleteMedia",
    "createFolder",
    "listFolders",
    "createPreset",
    "listPresets",
    "deletePreset",
    "removeBackground",
    "extractText",
    "getUsage",
    "url",
    "signedUrl",
  ];

  for (const method of expected) {
    assert.equal(
      typeof (dreep as unknown as Record<string, unknown>)[method],
      "function",
      `${method} should be callable`,
    );
  }
});

test("url() appends a transform without a network call", () => {
  const dreep = new Dreep({ apiKey: API_KEY });

  assert.equal(
    dreep.url(ASSET, { width: 400, format: "webp" }),
    `${ASSET.url}?format=webp&width=400`,
  );
});

test("url() accepts a stored URL string", () => {
  const dreep = new Dreep({ apiKey: API_KEY });

  assert.equal(dreep.url(ASSET.url, { width: 400 }), `${ASSET.url}?width=400`);
});

test("url() returns the URL untouched when there is no transform", () => {
  const dreep = new Dreep({ apiKey: API_KEY });

  assert.equal(dreep.url(ASSET), ASSET.url);
});

test("signedUrl() requires a signing secret", () => {
  const dreep = new Dreep({ apiKey: API_KEY });

  assert.throws(
    () => dreep.signedUrl(ASSET, { expiresIn: 60 }),
    (error: unknown) =>
      error instanceof DreepError &&
      error.message === ERROR_MESSAGE.MISSING_SIGNING_SECRET,
  );
});

test("signedUrl() signs when the secret is configured", () => {
  const dreep = new Dreep({ apiKey: API_KEY, signingSecret: "secret" });
  const url = new URL(dreep.signedUrl(ASSET, { expiresIn: 60 }));

  assert.match(url.searchParams.get("sig") ?? "", /^[0-9a-f]{64}$/);
  assert.ok(Number(url.searchParams.get("exp")) > Date.now() / 1000);
});
