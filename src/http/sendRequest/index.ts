import { ERROR_MESSAGE } from "@/constants/errors";
import DreepConnectionError from "@/errors/DreepConnectionError";
import type { HttpMethod } from "@/constants/http";

interface SendRequestParams {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string | FormData | undefined;
  signal?: AbortSignal | undefined;
}

/**
 * The only fetch call in the SDK.
 *
 * Anything that prevents a response — DNS failure, a dropped connection, an
 * aborted signal — becomes a DreepConnectionError, so callers never have to
 * handle a raw TypeError from fetch alongside the typed errors.
 */
const sendRequest = async ({
  url,
  method,
  headers,
  body,
  signal,
}: SendRequestParams): Promise<Response> => {
  try {
    return await fetch(url, {
      method,
      headers,
      ...(body === undefined ? {} : { body }),
      ...(signal === undefined ? {} : { signal }),
    });
  } catch (error) {
    const aborted = signal?.aborted === true;

    throw new DreepConnectionError(
      aborted ? ERROR_MESSAGE.REQUEST_ABORTED : ERROR_MESSAGE.REQUEST_FAILED,
      { cause: error },
    );
  }
};

export default sendRequest;
