import { BODY_FIELD } from "@/constants/api";
import resolveFilename from "@/utils/resolveFilename";
import type { UploadFile } from "@/types/upload";
import type { QueryParams } from "@/types/request";

interface BuildFormDataParams {
  file: UploadFile;
  filename?: string | undefined;
  /** Extra multipart fields. Undefined values are dropped. */
  fields?: QueryParams | undefined;
}

const isAsyncIterable = (value: unknown): value is AsyncIterable<Uint8Array> =>
  typeof value === "object" &&
  value !== null &&
  Symbol.asyncIterator in (value as object);

const collectStream = async (
  stream: AsyncIterable<Uint8Array>,
): Promise<Uint8Array<ArrayBuffer>> => {
  const chunks: Uint8Array[] = [];
  let length = 0;

  for await (const chunk of stream) {
    const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    chunks.push(bytes);
    length += bytes.byteLength;
  }

  const collected = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    collected.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return collected;
};

/**
 * Packs a file and its fields into multipart form data.
 *
 * A Node stream is read fully into memory first: `fetch` can't stream a
 * multipart body, so there is nowhere to hand an unbuffered source. That is the
 * reason presignUpload exists — it PUTs the bytes straight to storage and never
 * takes this path.
 */
const buildFormData = async ({
  file,
  filename,
  fields,
}: BuildFormDataParams): Promise<FormData> => {
  const formData = new FormData();
  const name = resolveFilename({ file, filename });

  if (file instanceof Blob) {
    formData.append(BODY_FIELD.FILE, file, name);
  } else if (isAsyncIterable(file)) {
    formData.append(
      BODY_FIELD.FILE,
      new Blob([await collectStream(file)]),
      name,
    );
  } else {
    // Copied rather than cast: a Node Buffer is a view into a shared pool,
    // which isn't the standalone ArrayBuffer a BlobPart requires.
    formData.append(BODY_FIELD.FILE, new Blob([new Uint8Array(file)]), name);
  }

  for (const [key, value] of Object.entries(fields ?? {})) {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  }

  return formData;
};

export default buildFormData;
