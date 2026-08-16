import { API_PATH, BODY_FIELD } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import buildFormData from "@/utils/buildFormData";
import type { Asset } from "@/types/asset";
import type { FolderTarget, ResourceParams } from "@/types/resource";
import type { UploadFile } from "@/types/upload";

export interface RemoveBackgroundParams extends ResourceParams, FolderTarget {
  file: UploadFile;
  filename?: string | undefined;
}

/**
 * Cuts the subject out of an image and stores it as a new asset.
 *
 * The alpha channel is kept rather than flattened, so one removal serves any
 * number of background colours as ordinary transforms — pass `bg` to url().
 *
 * @example
 * const asset = await removeBackground({ request, file });
 */
const removeBackground = ({
  request,
  file,
  filename,
  folder,
  folderId,
  autoCreateFolders,
  signal,
}: RemoveBackgroundParams): Promise<Asset> =>
  buildFormData({
    file,
    filename,
    fields: {
      [BODY_FIELD.FOLDER]: folder,
      [BODY_FIELD.FOLDER_ID]: folderId,
      [BODY_FIELD.AUTO_CREATE_FOLDERS]: autoCreateFolders,
    },
  }).then((formData) =>
    request<Asset>({
      method: HTTP_METHOD.POST,
      path: API_PATH.BG_REMOVE,
      formData,
      signal,
    }),
  );

export default removeBackground;
