import { HTTP_METHOD, HTTP_STATUS, type HttpMethod } from "@/constants/http";

interface IsRetryableParams {
  method: HttpMethod;
  /** Undefined when the request failed before any response arrived. */
  status?: number | undefined;
}

/**
 * Only GET is retried. The others aren't safe to repeat blindly — a retried
 * upload would bill a second transformation and store a duplicate asset.
 *
 * A missing status means the connection failed, which is retryable for a GET.
 */
const isRetryable = ({ method, status }: IsRetryableParams): boolean => {
  if (method !== HTTP_METHOD.GET) {
    return false;
  }

  if (status === undefined) {
    return true;
  }

  return (
    status === HTTP_STATUS.TOO_MANY_REQUESTS ||
    status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

export default isRetryable;
