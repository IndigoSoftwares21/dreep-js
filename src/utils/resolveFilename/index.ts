import type { UploadFile } from "@/types/upload";

interface ResolveFilenameParams {
  file: UploadFile;
  filename?: string | undefined;
}

/** Used when neither the caller nor the file itself supplies a name. */
const FALLBACK_FILENAME = "upload";

/**
 * Works out what to call the uploaded file. An explicit filename always wins;
 * otherwise a File or Blob may carry its own name. Buffers and streams have
 * none, hence the fallback.
 */
const resolveFilename = ({ file, filename }: ResolveFilenameParams): string => {
  if (filename !== undefined && filename.length > 0) {
    return filename;
  }

  const name = (file as { name?: unknown }).name;

  if (typeof name === "string" && name.length > 0) {
    return name;
  }

  return FALLBACK_FILENAME;
};

export default resolveFilename;
