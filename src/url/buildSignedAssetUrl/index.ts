import { QUERY_PARAM } from "@/constants/api";
import { ERROR_MESSAGE } from "@/constants/errors";
import DreepError from "@/errors/DreepError";
import buildAssetUrl from "@/url/buildAssetUrl";
import canonicalizeTransformParams from "@/utils/canonicalizeTransformParams";
import computeSignature from "@/utils/computeSignature";
import type { SignableAsset } from "@/types/urlTarget";
import type { TransformParams } from "@/types/transform";

interface BuildSignedAssetUrlParams {
  asset: SignableAsset;
  signingSecret: string | undefined;
  /** Seconds from now until the link stops working. */
  expiresIn: number;
  transform?: TransformParams | undefined;
}

const SECONDS_PER_MILLISECOND = 1000;

/**
 * Builds a time-limited URL for an asset in a signed folder.
 *
 * The payload is `assetId:expires`, or `assetId:expires:params` when a
 * transform or preset is involved — where `params` is the *canonical* form the
 * API verifies against, not the values passed in. See
 * canonicalizeTransformParams for why raw values produce a link that 401s.
 *
 * @example
 * buildSignedAssetUrl({ asset, signingSecret, expiresIn: 3600 })
 * // https://cdn.dreep.cloud/api/v1/fetch/<id>?exp=1774118400&sig=6b10e0…
 */
const buildSignedAssetUrl = ({
  asset,
  signingSecret,
  expiresIn,
  transform,
}: BuildSignedAssetUrlParams): string => {
  if (!signingSecret) {
    throw new DreepError(ERROR_MESSAGE.MISSING_SIGNING_SECRET);
  }

  const expires = Math.floor(Date.now() / SECONDS_PER_MILLISECOND) + expiresIn;

  const canonical = canonicalizeTransformParams({ transform: transform ?? {} });
  const preset = transform?.preset;

  const hasParams =
    Object.values(canonical).some((value) => value !== undefined) ||
    preset !== undefined;

  // JSON.stringify drops undefined values, which is what leaves an unset
  // transform out of the payload entirely rather than as nulls.
  const paramsString = hasParams
    ? JSON.stringify({ ...canonical, [QUERY_PARAM.PRESET]: preset })
    : undefined;

  const payload =
    paramsString === undefined
      ? `${asset.id}:${expires}`
      : `${asset.id}:${expires}:${paramsString}`;

  const url = new URL(buildAssetUrl({ target: asset, transform }));
  url.searchParams.set(QUERY_PARAM.EXPIRES, String(expires));
  url.searchParams.set(
    QUERY_PARAM.SIGNATURE,
    computeSignature({ payload, secret: signingSecret }),
  );

  return url.toString();
};

export default buildSignedAssetUrl;
