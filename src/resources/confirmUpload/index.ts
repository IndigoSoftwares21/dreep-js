import { BODY_FIELD, buildApiPath } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { Asset } from "@/types/asset";
import type { ResourceParams } from "@/types/resource";
import type { TransformParams } from "@/types/transform";

export interface ConfirmUploadParams extends ResourceParams {
    /** The id returned by presignUpload. */
    id: string;
    /** Applied before the asset flips to ready. */
    transform?: TransformParams | undefined;
    presetKey?: string | undefined;
}

/**
 * Finalizes a presigned upload once the bytes are in storage. Until this is
 * called the asset stays `pending` and is excluded from listings.
 */
const confirmUpload = ({
    request,
    id,
    transform,
    presetKey,
    signal,
}: ConfirmUploadParams): Promise<Asset> =>
    request<Asset>({
        method: HTTP_METHOD.POST,
        path: buildApiPath.uploadConfirm(id),
        body: {
            [BODY_FIELD.TRANSFORM]: transform,
            [BODY_FIELD.PRESET_KEY]: presetKey,
        },
        signal,
    });

export default confirmUpload;
