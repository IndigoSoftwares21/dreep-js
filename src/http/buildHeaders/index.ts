import { AUTH_SCHEME, CONTENT_TYPE, HEADER } from "@/constants/http";

interface BuildHeadersParams {
  apiKey: string;
  /** True only for JSON bodies — see below. */
  hasJsonBody: boolean;
}

/**
 * Authorization, plus a content type only when we're sending JSON.
 *
 * Multipart deliberately gets no Content-Type: fetch generates one containing
 * the boundary it picked, and setting our own would replace it with a header
 * the server can't parse the body against.
 */
const buildHeaders = ({
  apiKey,
  hasJsonBody,
}: BuildHeadersParams): Record<string, string> => ({
  [HEADER.AUTHORIZATION]: `${AUTH_SCHEME} ${apiKey}`,
  ...(hasJsonBody ? { [HEADER.CONTENT_TYPE]: CONTENT_TYPE.JSON } : {}),
});

export default buildHeaders;
