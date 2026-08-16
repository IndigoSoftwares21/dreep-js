import { createHmac } from "node:crypto";

interface ComputeSignatureParams {
  payload: string;
  secret: string;
}

/** HMAC-SHA256 in hex, matching the API's signature verification. */
const computeSignature = ({
  payload,
  secret,
}: ComputeSignatureParams): string =>
  createHmac("sha256", secret).update(payload).digest("hex");

export default computeSignature;
