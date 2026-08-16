import type { AssetStatus } from "@/constants/storage";

/**
 * A stored asset, as returned by upload, confirmUpload and removeBackground.
 *
 * `sizeBytes` is normalised to a number by the SDK — the API sends it as a
 * string, because Postgres BIGINT columns serialise that way over JSON.
 */
export interface Asset {
  id: string;
  /** Ready-to-use delivery URL, extension included. Pass to url() to transform. */
  url: string;
  originalFilename: string;
  mimetype: string;
  /** Images only. */
  format?: string;
  sizeBytes: number;
  /** Images only. */
  width?: number;
  /** Images only. */
  height?: number;
  status: AssetStatus;
  folderId: string | null;
  /** Slug path of the folder the asset lives in. */
  folder: string;
  projectId: string;
  createdAt: string;
}

/** The lighter shape returned by listMedia. */
export interface MediaListItem {
  id: string;
  filename: string;
  /** Ready-to-use delivery URL. Pass to url() to transform. */
  url: string;
  /** MIME type, e.g. `image/webp`. */
  type: string;
  /** Normalised to a number by the SDK. */
  sizeBytes: number;
  /** `image` or `file`. */
  assetType: string;
  folderId: string;
  /** Slug path of the folder the asset lives in. */
  folder: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  /** Total assets matching the filter, across all pages. */
  total: number;
}

export interface MediaListing {
  assets: MediaListItem[];
  pagination: Pagination;
}

/** A presigned upload, before the bytes have been PUT to storage. */
export interface PresignedUpload {
  /** Pass to confirmUpload once the bytes are in place. */
  id: string;
  /** Absent when alreadyExists is true — there is nothing left to upload. */
  uploadUrl?: string;
  contentType: string;
  /** True when contentHash matched content Dreep already stores. */
  alreadyExists: boolean;
}
