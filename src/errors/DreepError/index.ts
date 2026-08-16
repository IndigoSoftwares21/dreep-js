/** A field-level complaint from the API's validation layer. */
export interface ValidationIssue {
    path: (string | number)[];
    message: string;
}

export interface DreepErrorOptions {
    /** HTTP status, or undefined when the request never got a response. */
    status?: number;
    /** Machine-readable code from the error body, when the API sent one. */
    code?: string;
    validationErrors?: ValidationIssue[];
    cause?: unknown;
}

/**
 * Base class for every failure the SDK raises. Catching this catches all of
 * them; the subclasses exist so callers can branch on the ones worth handling
 * differently without comparing status numbers.
 */
class DreepError extends Error {
    readonly status: number | undefined;
    readonly code: string | undefined;
    readonly validationErrors: ValidationIssue[] | undefined;

    constructor(message: string, options: DreepErrorOptions = {}) {
        super(message, options.cause === undefined ? {} : { cause: options.cause });
        this.name = new.target.name;
        this.status = options.status;
        this.code = options.code;
        this.validationErrors = options.validationErrors;

        // Without this, `instanceof` fails for subclasses when the package is
        // consumed from a build that downlevels classes to ES5 functions.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export default DreepError;
