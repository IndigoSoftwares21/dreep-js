import toDreepError, { type ApiErrorBody } from "@/errors/toDreepError";

interface ParseResponseParams {
    response: Response;
}

/** Reads a JSON body, tolerating an empty or non-JSON one. */
const readJson = async (response: Response): Promise<unknown> => {
    const text = await response.text();

    if (text.length === 0) {
        return undefined;
    }

    try {
        return JSON.parse(text);
    } catch {
        // A proxy or gateway error page, not the API. The status still tells us
        // what happened, so the body is simply discarded.
        return undefined;
    }
};

const isEnvelope = (body: unknown): body is { data: unknown } =>
    typeof body === "object" && body !== null && "data" in body;

/**
 * Turns a response into the payload a resource should return, or throws a typed
 * error.
 *
 * The API wraps every success in `{ message, code, data }`, so this unwraps
 * `data` — callers get the asset, not the envelope around it.
 */
const parseResponse = async <TResponse>({
    response,
}: ParseResponseParams): Promise<TResponse> => {
    const body = await readJson(response);

    if (!response.ok) {
        throw toDreepError({
            status: response.status,
            body: body as ApiErrorBody | undefined,
        });
    }

    return (isEnvelope(body) ? body.data : body) as TResponse;
};

export default parseResponse;
