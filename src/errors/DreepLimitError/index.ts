import DreepError, { type DreepErrorOptions } from "@/errors/DreepError";

export interface DreepLimitErrorOptions extends DreepErrorOptions {
    /** Which plan feature ran out, e.g. `storage_bytes`. */
    featureKey?: string;
    /** The plan's ceiling, or null when the feature is unavailable on the plan. */
    limit?: number | null;
    /** Consumption at the time the request was rejected. */
    used?: number;
}

/**
 * 402 — a plan limit was reached. Carries the billing metadata from the error
 * body so callers can show what ran out instead of a generic failure.
 */
class DreepLimitError extends DreepError {
    readonly featureKey: string | undefined;
    readonly limit: number | null | undefined;
    readonly used: number | undefined;

    constructor(message: string, options: DreepLimitErrorOptions = {}) {
        super(message, options);
        this.featureKey = options.featureKey;
        this.limit = options.limit;
        this.used = options.used;
    }
}

export default DreepLimitError;
