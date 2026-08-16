/** Everything the client is constructed with. Both fields are credentials. */
export interface DreepConfig {
  /** Project API key, `drp_live_…`. Server-side only. */
  apiKey: string;
  /** URL signing secret. Required only by signedUrl(). */
  signingSecret?: string;
}
