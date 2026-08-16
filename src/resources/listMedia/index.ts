import { API_PATH, QUERY_PARAM } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import toNumber from "@/utils/toNumber";
import type { MediaListing } from "@/types/asset";
import type { ResourceParams } from "@/types/resource";

export interface ListMediaParams extends ResourceParams {
  page?: number | undefined;
  limit?: number | undefined;
  /** Slug path to list. Mutually exclusive with folderId. */
  folder?: string | undefined;
  folderId?: string | undefined;
  /** With a folder filter, also include every subfolder beneath it. */
  recursive?: boolean | undefined;
}

/**
 * Lists one page of media, with the pagination totals alongside it.
 *
 * @example
 * const { assets, pagination } = await listMedia({ request, folder: "avatars" });
 * console.log(`${assets.length} of ${pagination.total}`);
 */
const listMedia = async ({
  request,
  page,
  limit,
  folder,
  folderId,
  recursive,
  signal,
}: ListMediaParams): Promise<MediaListing> => {
  const listing = await request<MediaListing>({
    method: HTTP_METHOD.GET,
    path: API_PATH.MEDIA,
    query: {
      [QUERY_PARAM.PAGE]: page,
      [QUERY_PARAM.LIMIT]: limit,
      [QUERY_PARAM.FOLDER]: folder,
      [QUERY_PARAM.FOLDER_ID]: folderId,
      [QUERY_PARAM.RECURSIVE]: recursive,
    },
    signal,
  });

  return {
    ...listing,
    assets: listing.assets.map((asset) => ({
      ...asset,
      sizeBytes: toNumber({ value: asset.sizeBytes }),
    })),
  };
};

export default listMedia;
