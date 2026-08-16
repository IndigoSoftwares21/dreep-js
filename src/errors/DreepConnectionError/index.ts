import DreepError from "@/errors/DreepError";

/** No response at all — network failure, timeout, or an aborted signal. */
class DreepConnectionError extends DreepError {}

export default DreepConnectionError;
