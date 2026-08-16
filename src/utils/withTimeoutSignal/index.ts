import { ERROR_MESSAGE } from "@/constants/errors";

interface WithTimeoutSignalParams {
    signal?: AbortSignal | undefined;
    /** Omit for requests that shouldn't time out on their own, such as uploads. */
    timeoutMs?: number | undefined;
}

export interface TimeoutSignal {
    signal: AbortSignal | undefined;
    /** Always call once the request settles, or the timer keeps the process alive. */
    clear: () => void;
}

/**
 * Combines the caller's signal with an optional timeout into one signal.
 *
 * Hand-rolled rather than using AbortSignal.any, which only landed in Node 20 —
 * the package supports 18.
 */
const withTimeoutSignal = ({
    signal,
    timeoutMs,
}: WithTimeoutSignalParams): TimeoutSignal => {
    if (timeoutMs === undefined) {
        return { signal, clear: () => {} };
    }

    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort(new Error(ERROR_MESSAGE.REQUEST_ABORTED));
    }, timeoutMs);

    // Node keeps the event loop alive for a pending timer; without this a short
    // script would hang for the full timeout after the request already resolved.
    timer.unref?.();

    if (signal) {
        if (signal.aborted) {
            controller.abort(signal.reason);
        } else {
            signal.addEventListener("abort", () => controller.abort(signal.reason), {
                once: true,
            });
        }
    }

    return {
        signal: controller.signal,
        clear: () => clearTimeout(timer),
    };
};

export default withTimeoutSignal;
