import { API_PATH, BODY_FIELD, QUERY_PARAM } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import buildFormData from "@/utils/buildFormData";
import toTransformQuery from "@/utils/toTransformQuery";
import type { Asset } from "@/types/asset";
import type { FolderTarget, ResourceParams } from "@/types/resource";
import type { TransformParams } from "@/types/transform";
import type { UploadFile } from "@/types/upload";

export interface UploadParams extends ResourceParams, FolderTarget {
    file: UploadFile;
    /** Needed when the source carries no name of its own, such as a Buffer. */
    filename?: string | undefined;
    /** Full S3-style object key. Mutually exclusive with folder. */
    key?: string | undefined;
    /** Applied before storage — the transformed result is what gets stored. */
    transform?: TransformParams | undefined;
    /** A saved preset, applied instead of individual transform fields. */
    presetKey?: string | undefined;
}

/**
 * Uploads a file, optionally transforming it on the way in.
 *
 * @example
 * const asset = await upload({ request, file, folder: "avatars/2024" });
 * asset.url;
 */
const upload = ({
    request,
    file,
    filename,
    folder,
    key,
    folderId,
    autoCreateFolders,
    transform,
    presetKey,
    signal,
}: UploadParams): Promise<Asset> =>
    buildFormData({
        file,
        filename,
        fields: {
            ...toTransformQuery({ transform }),
            [BODY_FIELD.FOLDER]: folder,
            [BODY_FIELD.KEY]: key,
            [BODY_FIELD.FOLDER_ID]: folderId,
            [BODY_FIELD.AUTO_CREATE_FOLDERS]: autoCreateFolders,
            // The upload endpoint reads a preset from `p`, the same name the
            // fetch endpoint uses — not the `presetKey` that presign takes.
            [QUERY_PARAM.PRESET]: presetKey ?? transform?.preset,
        },
    }).then((formData) =>
        request<Asset>({
            method: HTTP_METHOD.POST,
            path: API_PATH.UPLOAD,
            formData,
            signal,
        }),
    );

export default upload;
