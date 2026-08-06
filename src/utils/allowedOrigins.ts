/**
 * Origins allowed to submit cross-site requests (enforced by the
 * `checkOrigin` middleware for non-GET/HEAD requests). `site` in
 * `astro.config.js` is the canonical URL; add any additional domains you
 * control (e.g. staging) here instead of scattering them across files.
 */
export const ALLOWED_ORIGINS = ["https://www.gugugram.com", "https://gugugram.com"] as const;
