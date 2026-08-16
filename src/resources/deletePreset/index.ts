import { buildApiPath } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { ResourceParams } from "@/types/resource";

export interface DeletePresetParams extends ResourceParams {
  id: string;
}

/** Deletes a preset. Assets already transformed with it are unaffected. */
const deletePreset = ({ request, id, signal }: DeletePresetParams): Promise<void> =>
  request<void>({
    method: HTTP_METHOD.DELETE,
    path: buildApiPath.presetById(id),
    signal,
  });

export default deletePreset;
