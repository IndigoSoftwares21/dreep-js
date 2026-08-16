import { API_PREFIX } from "@/constants/api";
import { REQUEST_TIMEOUT_MS } from "@/constants/defaults";
import buildHeaders from "@/http/buildHeaders";
import isRetryable from "@/http/isRetryable";
import parseResponse from "@/http/parseResponse";
import sendRequest from "@/http/sendRequest";
import withRetry from "@/http/withRetry";
import DreepError from "@/errors/DreepError";
import buildQueryString from "@/utils/buildQueryString";
import resolveApiUrl from "@/utils/resolveApiUrl";
import withTimeoutSignal from "@/utils/withTimeoutSignal";
import type { RequestFn, RequestOptions } from "@/types/request";

interface CreateRequestParams {
  apiKey: string;
}

/**
 * Builds the request function every resource is handed. Closing over the API
 * key here is what keeps resources free of configuration — they receive a
 * `request` and know nothing about auth, retries or the host.
 */
const createRequest = ({ apiKey }: CreateRequestParams): RequestFn => {
  const request = async <TResponse>({
    method,
    path,
    query,
    body,
    formData,
    signal,
  }: RequestOptions): Promise<TResponse> => {
    const url = `${resolveApiUrl()}${API_PREFIX}${path}${buildQueryString({
      params: query ?? {},
    })}`;

    // Uploads get no default timeout — a large file legitimately takes
    // longer than any number we could pick. Callers bound them with `signal`.
    const timeout = withTimeoutSignal({
      signal,
      timeoutMs: formData === undefined ? REQUEST_TIMEOUT_MS : undefined,
    });

    try {
      return await withRetry({
        run: async () => {
          const response = await sendRequest({
            url,
            method,
            headers: buildHeaders({ apiKey, hasJsonBody: body !== undefined }),
            body:
              formData ??
              (body === undefined ? undefined : JSON.stringify(body)),
            signal: timeout.signal,
          });

          return await parseResponse<TResponse>({ response });
        },
        shouldRetry: (error) =>
          isRetryable({
            method,
            status: error instanceof DreepError ? error.status : undefined,
          }),
      });
    } finally {
      timeout.clear();
    }
  };

  return request;
};

export default createRequest;
