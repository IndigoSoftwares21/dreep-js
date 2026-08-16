import { ERROR_MESSAGE } from "@/constants/errors";
import DreepError from "@/errors/DreepError";
import createRequest from "@/http/createRequest";
import confirmUpload, { type ConfirmUploadParams } from "@/resources/confirmUpload";
import createFolder, { type CreateFolderParams } from "@/resources/createFolder";
import createPreset, { type CreatePresetParams } from "@/resources/createPreset";
import deleteMedia, { type DeleteMediaParams } from "@/resources/deleteMedia";
import deletePreset, { type DeletePresetParams } from "@/resources/deletePreset";
import extractText, {
  type ExtractedText,
  type ExtractTextParams,
} from "@/resources/extractText";
import getUsage from "@/resources/getUsage";
import listAllMedia, { type ListAllMediaParams } from "@/resources/listAllMedia";
import listFolders, { type ListFoldersParams } from "@/resources/listFolders";
import listMedia, { type ListMediaParams } from "@/resources/listMedia";
import listPresets from "@/resources/listPresets";
import presignUpload, { type PresignUploadParams } from "@/resources/presignUpload";
import removeBackground, {
  type RemoveBackgroundParams,
} from "@/resources/removeBackground";
import upload, { type UploadParams } from "@/resources/upload";
import buildAssetUrl from "@/url/buildAssetUrl";
import buildSignedAssetUrl from "@/url/buildSignedAssetUrl";
import assertServerRuntime from "@/utils/assertServerRuntime";
import type {
  Asset,
  MediaListing,
  MediaListItem,
  PresignedUpload,
} from "@/types/asset";
import type { DreepConfig } from "@/types/config";
import type { Folder, FolderListing } from "@/types/folder";
import type { Preset } from "@/types/preset";
import type { RequestFn } from "@/types/request";
import type { TransformParams } from "@/types/transform";
import type { SignableAsset, UrlTarget } from "@/types/urlTarget";
import type { Usage } from "@/types/usage";

/** Resources receive the request function from the client, never from callers. */
type Public<TParams> = Omit<TParams, "request">;

export interface SignedUrlOptions {
  /** Seconds from now until the link stops working. */
  expiresIn: number;
  transform?: TransformParams | undefined;
}

/**
 * The Dreep client.
 *
 * The only class in the codebase, and deliberately thin: it validates the
 * config, builds the request function once, and hands it to the resource
 * functions that hold the actual behaviour.
 *
 * @example
 * const dreep = new Dreep({ apiKey: process.env.DREEP_API_KEY });
 * const asset = await dreep.upload({ file, folder: "avatars" });
 * dreep.url(asset, { width: 400, format: "webp" });
 */
class Dreep {
  readonly #request: RequestFn;
  readonly #signingSecret: string | undefined;

  constructor({ apiKey, signingSecret }: DreepConfig) {
    assertServerRuntime();

    if (!apiKey) {
      throw new DreepError(ERROR_MESSAGE.MISSING_API_KEY);
    }

    this.#request = createRequest({ apiKey });
    this.#signingSecret = signingSecret;
  }

  /** Uploads a file, optionally transforming it before storage. */
  upload(params: Public<UploadParams>): Promise<Asset> {
    return upload({ ...params, request: this.#request });
  }

  /** Starts a direct-to-storage upload for large files and browser clients. */
  presignUpload(params: Public<PresignUploadParams>): Promise<PresignedUpload> {
    return presignUpload({ ...params, request: this.#request });
  }

  /** Finalizes a presigned upload once its bytes are in storage. */
  confirmUpload(params: Public<ConfirmUploadParams>): Promise<Asset> {
    return confirmUpload({ ...params, request: this.#request });
  }

  /** Lists one page of media, with pagination totals. */
  listMedia(params: Public<ListMediaParams> = {}): Promise<MediaListing> {
    return listMedia({ ...params, request: this.#request });
  }

  /** Walks every page of a listing, yielding assets one at a time. */
  listAllMedia(
    params: Public<ListAllMediaParams> = {},
  ): AsyncGenerator<MediaListItem> {
    return listAllMedia({ ...params, request: this.#request });
  }

  /** Deletes an asset along with its cached transforms. */
  deleteMedia(params: Public<DeleteMediaParams>): Promise<void> {
    return deleteMedia({ ...params, request: this.#request });
  }

  /** Creates a folder, including any missing segments of a path. */
  createFolder(params: Public<CreateFolderParams>): Promise<Folder> {
    return createFolder({ ...params, request: this.#request });
  }

  /** Lists folders, with their full paths. */
  listFolders(params: Public<ListFoldersParams> = {}): Promise<FolderListing> {
    return listFolders({ ...params, request: this.#request });
  }

  /** Saves a named transform. */
  createPreset(params: Public<CreatePresetParams>): Promise<Preset> {
    return createPreset({ ...params, request: this.#request });
  }

  /** Every saved preset on the project. */
  listPresets(): Promise<Preset[]> {
    return listPresets({ request: this.#request });
  }

  /** Deletes a preset. */
  deletePreset(params: Public<DeletePresetParams>): Promise<void> {
    return deletePreset({ ...params, request: this.#request });
  }

  /** Cuts the subject out of an image, keeping the alpha channel. */
  removeBackground(params: Public<RemoveBackgroundParams>): Promise<Asset> {
    return removeBackground({ ...params, request: this.#request });
  }

  /** Runs OCR over an image or PDF. */
  extractText(params: Public<ExtractTextParams>): Promise<ExtractedText> {
    return extractText({ ...params, request: this.#request });
  }

  /** Storage consumed, and how many images, files and folders the project holds. */
  getUsage(): Promise<Usage> {
    return getUsage({ request: this.#request });
  }

  /**
   * Applies a transform to an asset's URL. Pure string work — no network call
   * and no API key, so it's safe in a render path.
   */
  url(target: UrlTarget, transform?: TransformParams): string {
    return buildAssetUrl({ target, transform });
  }

  /**
   * A time-limited URL for an asset in a signed folder. Requires
   * `signingSecret` in the client config.
   */
  signedUrl(asset: SignableAsset, { expiresIn, transform }: SignedUrlOptions): string {
    return buildSignedAssetUrl({
      asset,
      signingSecret: this.#signingSecret,
      expiresIn,
      transform,
    });
  }
}

export default Dreep;
