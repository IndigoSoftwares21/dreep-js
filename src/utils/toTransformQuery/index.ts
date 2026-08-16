import { QUERY_PARAM } from "@/constants/api";
import type { QueryParams } from "@/types/request";
import type { TransformParams } from "@/types/transform";

interface ToTransformQueryParams {
    transform: TransformParams | undefined;
}

/**
 * Maps transform options onto their wire names. The only field that differs is
 * `preset`, which the API reads as `p`.
 */
const toTransformQuery = ({ transform }: ToTransformQueryParams): QueryParams => {
    if (!transform) {
        return {};
    }

    return {
        [QUERY_PARAM.FORMAT]: transform.format,
        [QUERY_PARAM.WIDTH]: transform.width,
        [QUERY_PARAM.HEIGHT]: transform.height,
        [QUERY_PARAM.FIT]: transform.fit,
        [QUERY_PARAM.QUALITY]: transform.quality,
        [QUERY_PARAM.GRAVITY]: transform.gravity,
        [QUERY_PARAM.CROP]: transform.crop,
        [QUERY_PARAM.DPR]: transform.dpr,
        [QUERY_PARAM.ROTATE]: transform.rotate,
        [QUERY_PARAM.BLUR]: transform.blur,
        [QUERY_PARAM.BG]: transform.bg,
        [QUERY_PARAM.RADIUS]: transform.radius,
        [QUERY_PARAM.TRIM_START]: transform.trimStart,
        [QUERY_PARAM.TRIM_END]: transform.trimEnd,
        [QUERY_PARAM.VIDEO_CODEC]: transform.videoCodec,
        [QUERY_PARAM.FPS]: transform.fps,
        [QUERY_PARAM.PRESET]: transform.preset,
    };
};

export default toTransformQuery;
