import DreepError from "@/errors/DreepError";

/** 409 — most often confirming an upload whose bytes haven't landed yet. */
class DreepConflictError extends DreepError {}

export default DreepConflictError;
