import DreepError from "@/errors/DreepError";

/** 401 — the API key is missing, malformed, or has been revoked. */
class DreepAuthError extends DreepError {}

export default DreepAuthError;
