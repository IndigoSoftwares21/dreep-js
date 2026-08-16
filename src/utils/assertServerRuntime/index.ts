import { ERROR_MESSAGE } from "@/constants/errors";
import DreepError from "@/errors/DreepError";

/**
 * Refuses to construct a client in a browser. The API key is a full-project
 * credential, so shipping it to a page would expose every asset in the project
 * — failing loudly at construction beats discovering it in a bundle later.
 */
const assertServerRuntime = (): void => {
  const hasWindow = typeof globalThis !== "undefined" && "window" in globalThis;
  const hasDocument =
    typeof globalThis !== "undefined" && "document" in globalThis;

  if (hasWindow && hasDocument) {
    throw new DreepError(ERROR_MESSAGE.BROWSER_RUNTIME);
  }
};

export default assertServerRuntime;
