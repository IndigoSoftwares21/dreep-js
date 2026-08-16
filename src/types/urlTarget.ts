/**
 * Anything url() accepts: an asset from the API, or a URL it previously
 * returned that the caller stored.
 */
export type UrlTarget = { url: string } | string;

/** signedUrl() additionally needs the id — the signature is computed over it. */
export interface SignableAsset {
    id: string;
    url: string;
}
