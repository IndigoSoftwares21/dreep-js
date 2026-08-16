/** Default API host. Overridable only through the internal env var, never through config. */
export const API_URL = "https://api.dreep.cloud";

/** Version prefix every endpoint sits behind. */
export const API_PREFIX = "/api/v1";

/** Endpoint paths, relative to the version prefix. */
export const API_PATH = {
    UPLOAD: "/upload",
    UPLOAD_PRESIGN: "/upload/presign",
    MEDIA: "/media",
    FOLDERS: "/folders",
    PRESETS: "/presets",
    OCR: "/ocr",
    BG_REMOVE: "/bg-remove",
    USAGE: "/usage",
} as const;

/** Paths carrying a path parameter, so no call site interpolates a URL by hand. */
export const buildApiPath = {
    uploadConfirm: (id: string): string => `${API_PATH.UPLOAD}/${id}/confirm`,
    mediaById: (id: string): string => `${API_PATH.MEDIA}/${id}`,
    presetById: (id: string): string => `${API_PATH.PRESETS}/${id}`,
} as const;

/**
 * Wire names for every query and form parameter. Transform keys double as
 * multipart field names on upload, which is why there is one table rather
 * than one per transport.
 */
export const QUERY_PARAM = {
    FORMAT: "format",
    WIDTH: "width",
    HEIGHT: "height",
    FIT: "fit",
    QUALITY: "quality",
    GRAVITY: "gravity",
    CROP: "crop",
    DPR: "dpr",
    ROTATE: "rotate",
    BLUR: "blur",
    BG: "bg",
    RADIUS: "radius",
    TRIM_START: "trimStart",
    TRIM_END: "trimEnd",
    VIDEO_CODEC: "videoCodec",
    FPS: "fps",
    PRESET: "p",
    EXPIRES: "exp",
    SIGNATURE: "sig",
    PAGE: "page",
    LIMIT: "limit",
    FOLDER: "folder",
    FOLDER_ID: "folderId",
    RECURSIVE: "recursive",
} as const;

/** Multipart and JSON body field names that aren't transform parameters. */
export const BODY_FIELD = {
    FILE: "file",
    FILENAME: "filename",
    KEY: "key",
    FOLDER: "folder",
    FOLDER_ID: "folderId",
    AUTO_CREATE_FOLDERS: "autoCreateFolders",
    CONTENT_TYPE: "contentType",
    SIZE_BYTES: "sizeBytes",
    CONTENT_HASH: "contentHash",
    PRESET_KEY: "presetKey",
    TRANSFORM: "transform",
    NAME: "name",
    PATH: "path",
    PARENT_ID: "parentId",
    PARENT_PATH: "parentPath",
    ACCESS_CONTROL_TYPE: "accessControlType",
    DEFAULT_EXPIRY_SECONDS: "defaultExpirySeconds",
} as const;
