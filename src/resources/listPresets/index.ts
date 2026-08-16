import { API_PATH } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { Preset } from "@/types/preset";
import type { ResourceParams } from "@/types/resource";

export type ListPresetsParams = ResourceParams;

/** Every saved transform preset on the project. */
const listPresets = ({ request, signal }: ListPresetsParams): Promise<Preset[]> =>
  request<Preset[]>({
    method: HTTP_METHOD.GET,
    path: API_PATH.PRESETS,
    signal,
  });

export default listPresets;
