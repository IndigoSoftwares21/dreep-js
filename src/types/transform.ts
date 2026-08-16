import type {
  AUDIO_FORMAT,
  FIT,
  GRAVITY,
  IMAGE_FORMAT,
  RADIUS_MAX,
  ROTATE,
  TEXT_FORMAT,
  VIDEO_CODEC,
  VIDEO_FORMAT,
} from "@/constants/transform";

export type ImageFormat = (typeof IMAGE_FORMAT)[keyof typeof IMAGE_FORMAT];
export type VideoFormat = (typeof VIDEO_FORMAT)[keyof typeof VIDEO_FORMAT];
export type AudioFormat = (typeof AUDIO_FORMAT)[keyof typeof AUDIO_FORMAT];
export type TextFormat = (typeof TEXT_FORMAT)[keyof typeof TEXT_FORMAT];

export type OutputFormat = ImageFormat | VideoFormat | AudioFormat | TextFormat;

export type Fit = (typeof FIT)[keyof typeof FIT];
export type Gravity = (typeof GRAVITY)[keyof typeof GRAVITY];
export type Rotate = (typeof ROTATE)[keyof typeof ROTATE];
export type VideoCodec = (typeof VIDEO_CODEC)[keyof typeof VIDEO_CODEC];
export type Radius = number | typeof RADIUS_MAX;

/**
 * Transforms applied on the fly by the fetch endpoint, or before storage when
 * passed to upload. Every field is optional; an empty object is a no-op.
 */
export interface TransformParams {
  /** Output format. Also decides OCR (`txt`) and video thumbnail extraction. */
  format?: OutputFormat;
  /** Target width in pixels, up to MAX_DIMENSION. */
  width?: number;
  /** Target height in pixels, up to MAX_DIMENSION. */
  height?: number;
  fit?: Fit;
  /** 1–100. */
  quality?: number;
  gravity?: Gravity;
  /** Explicit crop as `left,top,width,height`. */
  crop?: string;
  /** Device pixel ratio multiplier, up to MAX_DPR. */
  dpr?: number;
  rotate?: Rotate;
  blur?: number;
  /** Hex fill colour without the leading `#`, e.g. `ffffff`. */
  bg?: string;
  radius?: Radius;
  /** Video trim start, in seconds. */
  trimStart?: number;
  /** Video trim end, in seconds. */
  trimEnd?: number;
  videoCodec?: VideoCodec;
  fps?: number;
  /** Key of a saved preset, applied instead of the individual fields. */
  preset?: string;
}
