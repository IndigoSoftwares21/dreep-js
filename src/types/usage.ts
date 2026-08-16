/** Current storage and object counts for the project. */
export interface Usage {
  /** Normalised to a number by the SDK. */
  storageBytes: number;
  imageCount: number;
  fileCount: number;
  folderCount: number;
}
