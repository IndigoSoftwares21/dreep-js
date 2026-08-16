import { API_PATH, BODY_FIELD } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import type { FolderListing } from "@/types/folder";
import type { ResourceParams } from "@/types/resource";

export interface ListFoldersParams extends ResourceParams {
  /** List the children of this path. Omit both filters for the whole project. */
  path?: string | undefined;
  parentId?: string | undefined;
}

/**
 * Lists folders. With no filter this returns every folder at any depth, each
 * carrying its full path — enough to build the whole tree from one call.
 */
const listFolders = ({
  request,
  path,
  parentId,
  signal,
}: ListFoldersParams): Promise<FolderListing> =>
  request<FolderListing>({
    method: HTTP_METHOD.GET,
    path: API_PATH.FOLDERS,
    query: {
      [BODY_FIELD.PATH]: path,
      [BODY_FIELD.PARENT_ID]: parentId,
    },
    signal,
  });

export default listFolders;
