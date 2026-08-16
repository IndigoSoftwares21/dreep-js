import { API_PATH, BODY_FIELD } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import buildFormData from "@/utils/buildFormData";
import type { FolderTarget, ResourceParams } from "@/types/resource";
import type { UploadFile } from "@/types/upload";

export interface ExtractTextParams extends ResourceParams, FolderTarget {
  file: UploadFile;
  filename?: string | undefined;
}

export interface ExtractedText {
  /** The full text, concatenated. */
  text: string;
  /** Line and word objects with bounding boxes, for when position matters. */
  blocks: unknown[];
  /** The stored .txt asset, when a destination folder was given. */
  savedAsset: { id: string; storageKey: string } | null;
}

/**
 * Runs OCR over an image or PDF. With a folder, the extracted text is also
 * stored as a .txt asset; without one it is returned only.
 *
 * @example
 * const { text } = await extractText({ request, file });
 */
const extractText = ({
  request,
  file,
  filename,
  folder,
  folderId,
  autoCreateFolders,
  signal,
}: ExtractTextParams): Promise<ExtractedText> =>
  buildFormData({
    file,
    filename,
    fields: {
      [BODY_FIELD.FOLDER]: folder,
      [BODY_FIELD.FOLDER_ID]: folderId,
      [BODY_FIELD.AUTO_CREATE_FOLDERS]: autoCreateFolders,
    },
  }).then((formData) =>
    request<ExtractedText>({
      method: HTTP_METHOD.POST,
      path: API_PATH.OCR,
      formData,
      signal,
    }),
  );

export default extractText;
