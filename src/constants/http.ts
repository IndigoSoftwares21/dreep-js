/** HTTP verbs used by the API. */
export const HTTP_METHOD = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
} as const;

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

export const HEADER = {
    AUTHORIZATION: "Authorization",
    CONTENT_TYPE: "Content-Type",
    USER_AGENT: "User-Agent",
} as const;

export const CONTENT_TYPE = {
    JSON: "application/json",
} as const;

/** The scheme the API expects in the Authorization header, before the key. */
export const AUTH_SCHEME = "Bearer";

export const HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
} as const;
