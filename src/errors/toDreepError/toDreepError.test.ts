import assert from "node:assert/strict";
import { test } from "node:test";
import { ERROR_CODE, ERROR_MESSAGE } from "@/constants/errors";
import { HTTP_STATUS } from "@/constants/http";
import DreepAuthError from "@/errors/DreepAuthError";
import DreepConflictError from "@/errors/DreepConflictError";
import DreepError from "@/errors/DreepError";
import DreepLimitError from "@/errors/DreepLimitError";
import DreepNotFoundError from "@/errors/DreepNotFoundError";
import DreepValidationError from "@/errors/DreepValidationError";
import toDreepError from "@/errors/toDreepError";

test("maps each status onto its class", () => {
  const cases = [
    [HTTP_STATUS.BAD_REQUEST, DreepValidationError],
    [HTTP_STATUS.UNAUTHORIZED, DreepAuthError],
    [HTTP_STATUS.FORBIDDEN, DreepAuthError],
    [HTTP_STATUS.PAYMENT_REQUIRED, DreepLimitError],
    [HTTP_STATUS.NOT_FOUND, DreepNotFoundError],
    [HTTP_STATUS.CONFLICT, DreepConflictError],
  ] as const;

  for (const [status, expected] of cases) {
    const error = toDreepError({ status, body: { message: "nope" } });
    assert.ok(
      error instanceof expected,
      `${status} should be ${expected.name}`,
    );
    assert.equal(error.status, status);
    assert.equal(error.message, "nope");
  }
});

test("falls back to DreepError for an unmapped status", () => {
  const error = toDreepError({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    body: { message: "boom" },
  });

  assert.ok(error instanceof DreepError);
  assert.equal(error.constructor.name, "DreepError");
});

test("every subclass is catchable as DreepError", () => {
  const error = toDreepError({ status: HTTP_STATUS.NOT_FOUND, body: {} });

  assert.ok(error instanceof DreepError);
  assert.equal(error.name, "DreepNotFoundError");
});

test("carries billing metadata off a 402", () => {
  const error = toDreepError({
    status: HTTP_STATUS.PAYMENT_REQUIRED,
    body: {
      message: "Storage limit reached",
      data: {
        code: ERROR_CODE.LIMIT_EXCEEDED,
        featureKey: "storage_bytes",
        limit: 1000,
        used: 1200,
      },
    },
  });

  assert.ok(error instanceof DreepLimitError);
  assert.equal(error.code, ERROR_CODE.LIMIT_EXCEEDED);
  assert.equal(error.featureKey, "storage_bytes");
  assert.equal(error.limit, 1000);
  assert.equal(error.used, 1200);
});

test("keeps validation issues from a 400", () => {
  const error = toDreepError({
    status: HTTP_STATUS.BAD_REQUEST,
    body: {
      message: "Validation failed",
      validationErrors: [{ path: ["width"], message: "too large" }],
    },
  });

  assert.deepEqual(error.validationErrors, [
    { path: ["width"], message: "too large" },
  ]);
});

test("uses a fallback message when the body carries none", () => {
  const error = toDreepError({
    status: HTTP_STATUS.NOT_FOUND,
    body: undefined,
  });

  assert.equal(error.message, ERROR_MESSAGE.UNKNOWN);
});
