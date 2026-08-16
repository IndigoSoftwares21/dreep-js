/**
 * Anything acceptable as an upload source.
 *
 * A Node `Readable` satisfies AsyncIterable<Uint8Array>, so it is covered
 * without the SDK importing anything from node:stream.
 */
export type UploadFile = Blob | Uint8Array | AsyncIterable<Uint8Array>;
