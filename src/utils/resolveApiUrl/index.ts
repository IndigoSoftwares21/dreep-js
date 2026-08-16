import { API_URL } from "@/constants/api";
import { ENV_VAR } from "@/constants/env";

/**
 * The API host to talk to. The env override exists so the SDK can be pointed at
 * a local server during development — it is deliberately not part of the public
 * config, because self-hosting isn't a supported deployment.
 */
const resolveApiUrl = (): string =>
  globalThis.process?.env?.[ENV_VAR.API_URL] ?? API_URL;

export default resolveApiUrl;
