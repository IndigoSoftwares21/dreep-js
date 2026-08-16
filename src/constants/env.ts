/**
 * Environment variables read at runtime. Deliberately absent from the public
 * config type — these exist so the SDK can be pointed at a local API during
 * development, not as a self-hosting feature.
 */
export const ENV_VAR = {
    API_URL: "DREEP_API_URL",
} as const;
