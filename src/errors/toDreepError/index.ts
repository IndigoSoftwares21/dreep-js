import { HTTP_STATUS } from "@/constants/http";
import { ERROR_MESSAGE } from "@/constants/errors";
import DreepAuthError from "@/errors/DreepAuthError";
import DreepConflictError from "@/errors/DreepConflictError";
import DreepError, { type ValidationIssue } from "@/errors/DreepError";
import DreepLimitError from "@/errors/DreepLimitError";
import DreepNotFoundError from "@/errors/DreepNotFoundError";
import DreepValidationError from "@/errors/DreepValidationError";

/** The error envelope the API sends: message and code at the top, details in data. */
export interface ApiErrorBody {
    message?: string;
    code?: string;
    validationErrors?: ValidationIssue[];
    data?: {
        code?: string;
        featureKey?: string;
        limit?: number | null;
        used?: number;
    };
}

interface ToDreepErrorParams {
    status: number;
    body: ApiErrorBody | undefined;
}

/**
 * The single place an HTTP status becomes a typed error. Everything else in the
 * SDK throws what this returns, so adding a status means editing one function.
 */
const toDreepError = ({ status, body }: ToDreepErrorParams): DreepError => {
    const message = body?.message ?? ERROR_MESSAGE.UNKNOWN;

    const options = {
        status,
        ...(body?.data?.code !== undefined ? { code: body.data.code } : {}),
        ...(body?.validationErrors !== undefined
            ? { validationErrors: body.validationErrors }
            : {}),
    };

    if (status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) {
        return new DreepAuthError(message, options);
    }

    if (status === HTTP_STATUS.BAD_REQUEST) {
        return new DreepValidationError(message, options);
    }

    if (status === HTTP_STATUS.NOT_FOUND) {
        return new DreepNotFoundError(message, options);
    }

    if (status === HTTP_STATUS.CONFLICT) {
        return new DreepConflictError(message, options);
    }

    if (status === HTTP_STATUS.PAYMENT_REQUIRED) {
        return new DreepLimitError(message, {
            ...options,
            ...(body?.data?.featureKey !== undefined
                ? { featureKey: body.data.featureKey }
                : {}),
            ...(body?.data?.limit !== undefined ? { limit: body.data.limit } : {}),
            ...(body?.data?.used !== undefined ? { used: body.data.used } : {}),
        });
    }

    return new DreepError(message, options);
};

export default toDreepError;
