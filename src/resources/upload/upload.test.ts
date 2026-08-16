import assert from "node:assert/strict";
import { test } from "node:test";
import { API_PATH, BODY_FIELD, QUERY_PARAM } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import upload from "@/resources/upload";
import type { RequestOptions } from "@/types/request";

/** Captures what a resource asked for, without any HTTP involved. */
const captureRequest = () => {
  const sent: RequestOptions[] = [];
  const request = (async (options: RequestOptions) => {
    sent.push(options);
    return {} as never;
  }) as never;

  return { sent, request };
};

test("posts multipart to the upload endpoint", async () => {
  const { sent, request } = captureRequest();

  await upload({ request, file: new Blob(["x"]), filename: "hero.jpg" });

  assert.equal(sent[0]?.method, HTTP_METHOD.POST);
  assert.equal(sent[0]?.path, API_PATH.UPLOAD);
  assert.ok(sent[0]?.formData instanceof FormData);
});

test("sends the file under the field the API expects", async () => {
  const { sent, request } = captureRequest();

  await upload({ request, file: new Blob(["x"]), filename: "hero.jpg" });

  const file = sent[0]?.formData?.get(BODY_FIELD.FILE);
  assert.ok(file instanceof File);
  assert.equal(file.name, "hero.jpg");
});

test("flattens the transform into multipart fields", async () => {
  const { sent, request } = captureRequest();

  await upload({
    request,
    file: new Blob(["x"]),
    transform: { width: 800, format: "webp" },
  });

  assert.equal(sent[0]?.formData?.get(QUERY_PARAM.WIDTH), "800");
  assert.equal(sent[0]?.formData?.get(QUERY_PARAM.FORMAT), "webp");
});

test("sends presetKey as `p`, which is what the endpoint reads", async () => {
  const { sent, request } = captureRequest();

  await upload({ request, file: new Blob(["x"]), presetKey: "thumbnail" });

  assert.equal(sent[0]?.formData?.get(QUERY_PARAM.PRESET), "thumbnail");
});

test("omits destination fields that weren't given", async () => {
  const { sent, request } = captureRequest();

  await upload({ request, file: new Blob(["x"]), folder: "avatars/2024" });

  assert.equal(sent[0]?.formData?.get(BODY_FIELD.FOLDER), "avatars/2024");
  assert.equal(sent[0]?.formData?.get(BODY_FIELD.FOLDER_ID), null);
  assert.equal(sent[0]?.formData?.get(BODY_FIELD.KEY), null);
});

test("accepts a Buffer and names it from the filename", async () => {
  const { sent, request } = captureRequest();

  await upload({ request, file: Buffer.from("bytes"), filename: "notes.pdf" });

  const file = sent[0]?.formData?.get(BODY_FIELD.FILE);
  assert.ok(file instanceof File);
  assert.equal(file.name, "notes.pdf");
  assert.equal(await file.text(), "bytes");
});

test("accepts an async iterable, buffering it into the body", async () => {
  const { sent, request } = captureRequest();

  async function* chunks(): AsyncGenerator<Uint8Array> {
    yield new TextEncoder().encode("hello ");
    yield new TextEncoder().encode("world");
  }

  await upload({ request, file: chunks(), filename: "stream.txt" });

  const file = sent[0]?.formData?.get(BODY_FIELD.FILE);
  assert.ok(file instanceof File);
  assert.equal(await file.text(), "hello world");
});
