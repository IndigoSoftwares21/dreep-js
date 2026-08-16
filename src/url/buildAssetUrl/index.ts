import toTransformQuery from "@/utils/toTransformQuery";
import type { TransformParams } from "@/types/transform";
import type { UrlTarget } from "@/types/urlTarget";

interface BuildAssetUrlParams {
  target: UrlTarget;
  transform?: TransformParams | undefined;
}

/**
 * Appends transform parameters to an asset's delivery URL.
 *
 * It never constructs a URL from scratch. The API decides the delivery host and
 * version — both come from server configuration — so the only correct base is
 * the one the API already handed back.
 *
 * @example
 * buildAssetUrl({ target: asset, transform: { width: 400, format: "webp" } })
 * // https://cdn.dreep.cloud/api/v1/fetch/<id>?format=webp&width=400
 */
const buildAssetUrl = ({ target, transform }: BuildAssetUrlParams): string => {
  const base = typeof target === "string" ? target : target.url;
  const url = new URL(base);

  for (const [key, value] of Object.entries(toTransformQuery({ transform }))) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  // Sorted so the same transform always yields the same URL regardless of the
  // order params were set in, which keeps CDN cache entries from splitting.
  url.searchParams.sort();

  return url.toString();
};

export default buildAssetUrl;
