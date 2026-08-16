interface ToNumberParams {
  value: unknown;
}

/**
 * Coerces a numeric field that may arrive as a string.
 *
 * Postgres BIGINT columns (sizeBytes, storageBytes) serialise to JSON as
 * strings, so without this `a.sizeBytes + b.sizeBytes` concatenates instead of
 * adding — the kind of bug that reads as a wildly wrong total rather than a
 * crash.
 */
const toNumber = ({ value }: ToNumberParams): number => Number(value ?? 0);

export default toNumber;
