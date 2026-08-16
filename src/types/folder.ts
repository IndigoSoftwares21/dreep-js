import type { AccessControlType } from "@/constants/storage";

export interface Folder {
  id: string;
  name: string;
  slug: string;
  /** Slug path from the project root, e.g. `avatars/2024/q1`. */
  path: string;
  parentId: string | null;
  accessControlType: AccessControlType;
}

export interface FolderListing {
  folders: Folder[];
  /** The folder named by the path or parentId filter, when one was given. */
  currentFolder: Folder | null;
}
