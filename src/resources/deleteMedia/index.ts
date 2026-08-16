import { buildApiPath } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { ResourceParams } from "@/types/resource";

export interface DeleteMediaParams extends ResourceParams {
  id: string;
}

/**
 * Deletes an asset, its cached transforms and the storage they occupied. The
 * space is credited back against the project's plan.
 */
const deleteMedia = ({ request, id, signal }: DeleteMediaParams): Promise<void> =>
  request<void>({
    method: HTTP_METHOD.DELETE,
    path: buildApiPath.mediaById(id),
    signal,
  });

export default deleteMedia;
