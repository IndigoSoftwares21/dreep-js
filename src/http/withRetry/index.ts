import { RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS } from "@/constants/defaults";

interface WithRetryParams<TResult> {
  run: () => Promise<TResult>;
  /** Decides, per failure, whether another attempt is worth making. */
  shouldRetry: (error: unknown) => boolean;
  attempts?: number;
}

// Deliberately not unref'd: this delay is part of an operation the caller is
// awaiting, so the process must stay alive for it. Unref'ing lets Node exit
// mid-retry, and the awaited promise never settles.
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Runs an operation, retrying with exponential backoff while shouldRetry says
 * so. The final failure is rethrown untouched, so callers still see the typed
 * error rather than a wrapper.
 */
const withRetry = async <TResult>({
  run,
  shouldRetry,
  attempts = RETRY_ATTEMPTS,
}: WithRetryParams<TResult>): Promise<TResult> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !shouldRetry(error)) {
        throw error;
      }

      await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }

  throw lastError;
};

export default withRetry;
