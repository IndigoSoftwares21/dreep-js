/** Machine-readable codes the API returns in an error body's `data.code`. */
export const ERROR_CODE = {
    LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
} as const;

/** Messages for failures the SDK raises itself, before any request is sent. */
export const ERROR_MESSAGE = {
    MISSING_API_KEY: "An apiKey is required to create a Dreep client.",
    BROWSER_RUNTIME:
        "The Dreep client must not run in a browser — an API key is a full-project credential. Use presignUpload() from your server instead.",
    MISSING_SIGNING_SECRET:
        "signedUrl() requires a signingSecret in the client config. Find it on the API Keys page of your dashboard.",
    REQUEST_ABORTED: "The request was aborted.",
    REQUEST_FAILED: "The request failed before a response was received.",
    UNKNOWN: "The request failed.",
} as const;
