/** How long a JSON request waits before aborting. Uploads are exempt — see withTimeoutSignal. */
export const REQUEST_TIMEOUT_MS = 30_000;

/** Retries after the initial attempt, for idempotent requests only. */
export const RETRY_ATTEMPTS = 2;

/** Base delay for exponential backoff between retries, in milliseconds. */
export const RETRY_BASE_DELAY_MS = 250;

/** Page size used by listAllMedia when the caller doesn't specify one. */
export const DEFAULT_PAGE_SIZE = 20;
