import assert from "node:assert/strict";
import { test } from "node:test";
import { QUERY_PARAM } from "@/constants/api";
import listAllMedia from "@/resources/listAllMedia";
import type { MediaListItem } from "@/types/asset";
import type { RequestOptions } from "@/types/request";

const item = (id: string): MediaListItem => ({
  id,
  filename: `${id}.jpg`,
  url: `https://cdn.dreep.cloud/api/v1/fetch/${id}`,
  type: "image/jpeg",
  sizeBytes: 1024,
  assetType: "image",
  folder: "avatars",
  folderId: "folder-1",
  createdAt: "2026-08-16T00:00:00.000Z",
});

/** Serves fixed pages and records the query each request carried. */
const pagedRequest = (pages: MediaListItem[][]) => {
  const sent: RequestOptions[] = [];
  const request = (async (options: RequestOptions) => {
    sent.push(options);
    const page = Number(options.query?.[QUERY_PARAM.PAGE] ?? 1);
    const assets = pages[page - 1] ?? [];
    const total = pages.reduce((sum, items) => sum + items.length, 0);

    return { assets, pagination: { page, limit: 2, total } } as never;
  }) as never;

  return { sent, request };
};

test("yields every item across pages", async () => {
  const { request } = pagedRequest([
    [item("a"), item("b")],
    [item("c")],
  ]);

  const seen: string[] = [];
  for await (const asset of listAllMedia({ request, limit: 2 })) {
    seen.push(asset.id);
  }

  assert.deepEqual(seen, ["a", "b", "c"]);
});

test("stops on a short page rather than asking for an empty one", async () => {
  const { sent, request } = pagedRequest([[item("a")]]);

  for await (const _ of listAllMedia({ request, limit: 2 })) {
    // draining
  }

  assert.equal(sent.length, 1);
});

test("stops requesting when the consumer breaks out early", async () => {
  const { sent, request } = pagedRequest([
    [item("a"), item("b")],
    [item("c"), item("d")],
    [item("e")],
  ]);

  for await (const asset of listAllMedia({ request, limit: 2 })) {
    if (asset.id === "a") {
      break;
    }
  }

  assert.equal(sent.length, 1);
});

test("passes the folder filter through to every page", async () => {
  const { sent, request } = pagedRequest([[item("a")], []]);

  for await (const _ of listAllMedia({ request, folder: "avatars", limit: 1 })) {
    // draining
  }

  assert.equal(sent[0]?.query?.[QUERY_PARAM.FOLDER], "avatars");
});
