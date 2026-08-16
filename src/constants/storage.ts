/** Who can fetch an asset, set per folder and inherited by subfolders. */
export const ACCESS_CONTROL_TYPE = {
    PUBLIC: "public",
    PRIVATE: "private",
    SIGNED: "signed",
} as const;

export type AccessControlType =
    (typeof ACCESS_CONTROL_TYPE)[keyof typeof ACCESS_CONTROL_TYPE];

/** An asset is only listable and fetchable once it reaches `ready`. */
export const ASSET_STATUS = {
    PENDING: "pending",
    READY: "ready",
    ABANDONED: "abandoned",
} as const;

export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];
