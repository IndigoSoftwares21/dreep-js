import type { RequestFn } from "@/types/request";

/** Every resource receives the request function and an optional signal. */
export interface ResourceParams {
    request: RequestFn;
    signal?: AbortSignal | undefined;
}

/** Destination options shared by upload, presign, ocr and background removal. */
export interface FolderTarget {
    /** Slug path relative to the project root. Missing folders are created. */
    folder?: string | undefined;
    /** UUID of an existing folder. Mutually exclusive with folder. */
    folderId?: string | undefined;
    /** Set false to require that the folder path already exists. */
    autoCreateFolders?: boolean | undefined;
}
