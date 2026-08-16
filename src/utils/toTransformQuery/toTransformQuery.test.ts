import assert from "node:assert/strict";
import { test } from "node:test";
import { QUERY_PARAM } from "@/constants/api";
import buildQueryString from "@/utils/buildQueryString";
import toTransformQuery from "@/utils/toTransformQuery";

test("returns nothing for an absent transform", () => {
  assert.deepEqual(toTransformQuery({ transform: undefined }), {});
});

test("maps preset onto the API's `p` parameter", () => {
  const query = toTransformQuery({ transform: { preset: "thumbnail" } });

  assert.equal(query[QUERY_PARAM.PRESET], "thumbnail");
});

test("serialises only the fields that were set", () => {
  const query = toTransformQuery({
    transform: { width: 400, format: "webp", fit: "cover" },
  });

  assert.equal(
    buildQueryString({ params: query }),
    "?fit=cover&format=webp&width=400",
  );
});

test("covers every transform field", () => {
  const query = toTransformQuery({
    transform: {
      format: "webp",
      width: 400,
      height: 300,
      fit: "cover",
      quality: 80,
      gravity: "north",
      crop: "1,2,3,4",
      dpr: 2,
      rotate: 90,
      blur: 5,
      bg: "ffffff",
      radius: "max",
      trimStart: 1,
      trimEnd: 2,
      videoCodec: "h264",
      fps: 30,
      preset: "thumb",
    },
  });

  const missing = Object.entries(query)
    .filter(([, value]) => value === undefined)
    .map(([key]) => key);

  assert.deepEqual(missing, [], "every field should map to a wire name");
});
