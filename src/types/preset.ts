import type { TransformParams } from "@/types/transform";

/** A named transform, applied by key via the `preset` transform parameter. */
export interface Preset {
  id: string;
  key: string;
  name: string;
  params: TransformParams;
}
