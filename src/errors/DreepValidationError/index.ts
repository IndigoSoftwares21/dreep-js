import DreepError from "@/errors/DreepError";

/** 400 — invalid parameters. `validationErrors` lists the offending fields. */
class DreepValidationError extends DreepError {}

export default DreepValidationError;
