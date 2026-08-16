import assert from "node:assert/strict";
import { test } from "node:test";
import buildQueryString from "@/utils/buildQueryString";

test("returns an empty string when there is nothing to serialise", () => {
  assert.equal(buildQueryString({ params: {} }), "");
  assert.equal(buildQueryString({ params: { width: undefined } }), "");
});

test("drops undefined entries but keeps falsy ones", () => {
  assert.equal(
    buildQueryString({
      params: { width: 0, height: undefined, recursive: false },
    }),
    "?recursive=false&width=0",
  );
});

test("sorts keys so identical params always produce the same URL", () => {
  const one = buildQueryString({
    params: { width: 400, format: "webp", fit: "cover" },
  });
  const two = buildQueryString({
    params: { fit: "cover", width: 400, format: "webp" },
  });

  assert.equal(one, two);
  assert.equal(one, "?fit=cover&format=webp&width=400");
});

test("encodes values", () => {
  assert.equal(
    buildQueryString({ params: { folder: "avatars/2024 q1" } }),
    "?folder=avatars%2F2024+q1",
  );
});
