import { API_PATH, BODY_FIELD } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import toTransformQuery from "@/utils/toTransformQuery";
import type { Preset } from "@/types/preset";
import type { ResourceParams } from "@/types/resource";
import type { TransformParams } from "@/types/transform";

export interface CreatePresetParams extends ResourceParams {
  /** The key callers pass as the `preset` transform parameter. */
  key: string;
  name: string;
  /** The recipe. Sent as flat fields, which is what the endpoint accepts. */
  transform: TransformParams;
}

/**
 * Saves a named transform, so call sites reference a key instead of repeating
 * parameters — and the recipe can change without touching them.
 *
 * @example
 * await createPreset({ request, key: "thumbnail", name: "Thumbnail",
 *   transform: { width: 200, height: 200, fit: "cover" } });
 */
const createPreset = ({
  request,
  key,
  name,
  transform,
  signal,
}: CreatePresetParams): Promise<Preset> =>
  request<Preset>({
    method: HTTP_METHOD.POST,
    path: API_PATH.PRESETS,
    body: {
      [BODY_FIELD.KEY]: key,
      [BODY_FIELD.NAME]: name,
      ...toTransformQuery({ transform }),
    },
    signal,
  });

export default createPreset;
