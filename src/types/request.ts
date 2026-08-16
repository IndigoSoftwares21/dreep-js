import type { HttpMethod } from "@/constants/http";

/** Query values before serialisation. Undefined entries are dropped. */
export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  method: HttpMethod;
  /** Endpoint path relative to the version prefix, from API_PATH. */
  path: string;
  query?: QueryParams | undefined;
  /** Serialised as a JSON body. Mutually exclusive with formData. */
  body?: Record<string, unknown> | undefined;
  /** Sent as multipart. Mutually exclusive with body. */
  formData?: FormData | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * The seam between resources and the network. Every resource takes one of
 * these rather than reaching for fetch, so resource tests never touch HTTP.
 */
export type RequestFn = <TResponse>(
  options: RequestOptions,
) => Promise<TResponse>;
