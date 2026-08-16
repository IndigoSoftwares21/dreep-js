import type { QueryParams } from "@/types/request";

interface BuildQueryStringParams {
    params: QueryParams;
}

/**
 * Serialises query parameters, dropping undefined entries and returning an
 * empty string when nothing survives — so callers can always concatenate the
 * result onto a path.
 *
 * Keys are sorted so the same parameters always produce the same URL no matter
 * what order they were built in, which keeps CDN cache entries from splitting.
 */
const buildQueryString = ({ params }: BuildQueryStringParams): string => {
    const search = new URLSearchParams();

    for (const key of Object.keys(params).sort()) {
        const value = params[key];

        if (value !== undefined) {
            search.set(key, String(value));
        }
    }

    const serialised = search.toString();

    return serialised.length > 0 ? `?${serialised}` : "";
};

export default buildQueryString;
