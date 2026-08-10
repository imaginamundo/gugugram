import { createAuthClient } from "better-auth/client";

// Shared better-auth client for client-side auth calls (e.g. signOut). The
// server-side config lives in src/auth.ts.
export const authClient = createAuthClient();
