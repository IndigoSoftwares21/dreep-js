import { API_PATH, BODY_FIELD } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { PresignedUpload } from "@/types/asset";
import type { FolderTarget, ResourceParams } from "@/types/resource";

export interface PresignUploadParams extends ResourceParams, FolderTarget {
    contentType: string;
    sizeBytes: number;
    /** Optional when `key` supplies the name. */
    filename?: string | undefined;
    key?: string | undefined;
    /** Target format to re-encode to on confirm. */
    format?: string | undefined;
    presetKey?: string | undefined;
    /** SHA-256 of the file — lets Dreep skip content it already stores. */
    contentHash?: string | undefined;
}

/**
 * Starts a direct-to-storage upload, returning a short-lived URL to PUT the
 * bytes to. The file never passes through the Dreep API, which is what makes
 * this the right path for large files and for browser uploads.
 *
 * @example
 * const upload = await presignUpload({ request, contentType, sizeBytes });
 * await fetch(upload.uploadUrl, { method: "PUT", body: file });
 * await confirmUpload({ request, id: upload.id });
 */
const presignUpload = ({
    request,
    contentType,
    sizeBytes,
    filename,
    folder,
    key,
    folderId,
    autoCreateFolders,
    format,
    presetKey,
    contentHash,
    signal,
}: PresignUploadParams): Promise<PresignedUpload> =>
    request<PresignedUpload>({
        method: HTTP_METHOD.POST,
        path: API_PATH.UPLOAD_PRESIGN,
        body: {
            [BODY_FIELD.CONTENT_TYPE]: contentType,
            [BODY_FIELD.SIZE_BYTES]: sizeBytes,
            [BODY_FIELD.FILENAME]: filename,
            [BODY_FIELD.FOLDER]: folder,
            [BODY_FIELD.KEY]: key,
            [BODY_FIELD.FOLDER_ID]: folderId,
            [BODY_FIELD.AUTO_CREATE_FOLDERS]: autoCreateFolders,
            format,
            [BODY_FIELD.PRESET_KEY]: presetKey,
            [BODY_FIELD.CONTENT_HASH]: contentHash,
        },
        signal,
    });

export default presignUpload;
