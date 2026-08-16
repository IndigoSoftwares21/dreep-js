import { DEFAULT_PAGE_SIZE } from "@/constants/defaults";
import listMedia, { type ListMediaParams } from "@/resources/listMedia";
import type { MediaListItem } from "@/types/asset";

export type ListAllMediaParams = Omit<ListMediaParams, "page">;

/**
 * Walks every page of a listing, yielding assets one at a time.
 *
 * Requests a page only when the consumer asks for the item after the last one
 * it yielded, so breaking out of the loop early stops the requests too.
 *
 * @example
 * for await (const asset of listAllMedia({ request, folder: "avatars" })) {
 *   console.log(asset.url);
 * }
 */
const listAllMedia = ({
  limit = DEFAULT_PAGE_SIZE,
  ...params
}: ListAllMediaParams): AsyncGenerator<MediaListItem> => {
  // A generator can't be written as an arrow function, so the arrow returns one.
  async function* iterate(): AsyncGenerator<MediaListItem> {
    for (let page = 1, seen = 0; ; page += 1) {
      const { assets, pagination } = await listMedia({ ...params, limit, page });

      for (const asset of assets) {
        yield asset;
      }

      seen += assets.length;

      // Stop on a short page, and on the total the API reports — either alone
      // would loop forever if the other were missing or wrong.
      if (assets.length < limit || seen >= pagination.total) {
        return;
      }
    }
  }

  return iterate();
};

export default listAllMedia;
