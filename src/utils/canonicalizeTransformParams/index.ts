import {
    CANONICAL_PARAM_ORDER,
    DPR_BREAKPOINTS,
    QUALITY_BREAKPOINTS,
    WIDTH_BREAKPOINTS,
} from "@/constants/transform";
import snapToNearestBreakpoint from "@/utils/snapToNearestBreakpoint";
import snapUpToBreakpoint from "@/utils/snapUpToBreakpoint";
import type { TransformParams } from "@/types/transform";

interface CanonicalizeTransformParamsParams {
    transform: TransformParams;
}

/**
 * Reproduces what the API does to transform parameters before it verifies a
 * signed URL: four of them are snapped onto fixed breakpoints, and the result
 * is serialised in a fixed key order.
 *
 * Signing the raw values instead would produce a link the API rejects — a
 * request for `width=803` is verified against `width=828`.
 *
 * The key order matters as much as the values: JSON.stringify follows
 * insertion order, and the signature is over that exact string.
 */
const canonicalizeTransformParams = ({
    transform,
}: CanonicalizeTransformParamsParams): Record<string, unknown> => {
    const snapped: Record<string, unknown> = {
        format: transform.format,
        width:
            transform.width === undefined
                ? undefined
                : snapUpToBreakpoint({
                      value: transform.width,
                      breakpoints: WIDTH_BREAKPOINTS,
                  }),
        height:
            transform.height === undefined
                ? undefined
                : snapUpToBreakpoint({
                      value: transform.height,
                      breakpoints: WIDTH_BREAKPOINTS,
                  }),
        fit: transform.fit,
        quality:
            transform.quality === undefined
                ? undefined
                : snapToNearestBreakpoint({
                      value: transform.quality,
                      breakpoints: QUALITY_BREAKPOINTS,
                  }),
        gravity: transform.gravity,
        dpr:
            transform.dpr === undefined
                ? undefined
                : snapUpToBreakpoint({
                      value: transform.dpr,
                      breakpoints: DPR_BREAKPOINTS,
                  }),
        rotate: transform.rotate,
        blur: transform.blur,
        bg: transform.bg,
        radius: transform.radius,
    };

    // Rebuilt in the canonical order rather than returned as-is, so the object
    // literal above can be reordered without silently changing signatures.
    const canonical: Record<string, unknown> = {};

    for (const key of CANONICAL_PARAM_ORDER) {
        canonical[key] = snapped[key];
    }

    return canonical;
};

export default canonicalizeTransformParams;
