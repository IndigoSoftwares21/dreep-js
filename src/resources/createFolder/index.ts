import { API_PATH, BODY_FIELD } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { AccessControlType } from "@/constants/storage";
import type { Folder } from "@/types/folder";
import type { ResourceParams } from "@/types/resource";

export interface CreateFolderParams extends ResourceParams {
  /** A single folder name. Mutually exclusive with path. */
  name?: string | undefined;
  /** Slug path to create, creating every missing segment and returning the leaf. */
  path?: string | undefined;
  parentId?: string | undefined;
  parentPath?: string | undefined;
  /** Inherited by every subfolder created beneath this one. */
  accessControlType?: AccessControlType | undefined;
  /** Default link lifetime for assets in a signed folder. */
  defaultExpirySeconds?: number | undefined;
}

/**
 * Creates a folder. Uploads create folders on demand, so this is only needed
 * when the access control has to be set before anything lands in it.
 *
 * @example
 * const folder = await createFolder({ request, path: "2026/q1/launch" });
 * folder.id;
 */
const createFolder = ({
  request,
  name,
  path,
  parentId,
  parentPath,
  accessControlType,
  defaultExpirySeconds,
  signal,
}: CreateFolderParams): Promise<Folder> =>
  request<Folder>({
    method: HTTP_METHOD.POST,
    path: API_PATH.FOLDERS,
    body: {
      [BODY_FIELD.NAME]: name,
      [BODY_FIELD.PATH]: path,
      [BODY_FIELD.PARENT_ID]: parentId,
      [BODY_FIELD.PARENT_PATH]: parentPath,
      [BODY_FIELD.ACCESS_CONTROL_TYPE]: accessControlType,
      [BODY_FIELD.DEFAULT_EXPIRY_SECONDS]: defaultExpirySeconds,
    },
    signal,
  });

export default createFolder;
