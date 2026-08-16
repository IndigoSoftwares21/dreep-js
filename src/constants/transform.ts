export const IMAGE_FORMAT = {
    JPEG: "jpeg",
    PNG: "png",
    WEBP: "webp",
    AVIF: "avif",
    GIF: "gif",
    TIFF: "tiff",
    HEIC: "heic",
    HEIF: "heif",
} as const;

export const VIDEO_FORMAT = {
    MP4: "mp4",
    WEBM: "webm",
    MOV: "mov",
    HLS: "hls",
    M3U8: "m3u8",
    GIF: "gif",
} as const;

export const AUDIO_FORMAT = {
    MP3: "mp3",
    WAV: "wav",
    AAC: "aac",
} as const;

/** Requesting a text format on an image or PDF runs OCR rather than a conversion. */
export const TEXT_FORMAT = {
    TXT: "txt",
    TEXT: "text",
} as const;

export const FIT = {
    COVER: "cover",
    CONTAIN: "contain",
    FILL: "fill",
    INSIDE: "inside",
    OUTSIDE: "outside",
} as const;

export const GRAVITY = {
    CENTER: "center",
    NORTH: "north",
    NORTHEAST: "northeast",
    EAST: "east",
    SOUTHEAST: "southeast",
    SOUTH: "south",
    SOUTHWEST: "southwest",
    WEST: "west",
    NORTHWEST: "northwest",
} as const;

export const ROTATE = {
    QUARTER: 90,
    HALF: 180,
    THREE_QUARTER: 270,
} as const;

export const VIDEO_CODEC = {
    H264: "h264",
    VP8: "vp8",
    VP9: "vp9",
    HEVC: "hevc",
} as const;

/** `max` turns the corner radius into a full circle or pill. */
export const RADIUS_MAX = "max";

export const MAX_DIMENSION = 4000;
export const MAX_DPR = 3;

/**
 * Copied from dreep_server/src/services/sharp/constants.ts.
 *
 * The API snaps these four parameters onto fixed breakpoints before hashing a
 * cache key — and before verifying a signed URL's signature. Signing has to
 * apply the identical snapping or the resulting link 401s, so these tables are
 * duplicated state: changing them on the server without changing them here
 * silently breaks every signed URL carrying a transform.
 *
 * The pinned-signature test in buildSignedAssetUrl is what catches that drift.
 */
export const WIDTH_BREAKPOINTS = [
    16, 32, 64, 128, 256, 384, 512, 640, 750, 828, 960, 1080, 1200, 1440, 1920,
    2560, 3200, 4000,
] as const;

export const QUALITY_BREAKPOINTS = [50, 65, 75, 85, 95, 100] as const;

export const DPR_BREAKPOINTS = [1, 2, 3] as const;

/**
 * The key order the API serialises canonical transform params in before
 * signing. JSON.stringify follows insertion order, so this array is what keeps
 * our payload byte-identical to the server's.
 */
export const CANONICAL_PARAM_ORDER = [
    "format",
    "width",
    "height",
    "fit",
    "quality",
    "gravity",
    "dpr",
    "rotate",
    "blur",
    "bg",
    "radius",
] as const;
