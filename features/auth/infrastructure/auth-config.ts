export type AuthRuntimeConfig = {
  sessionSecret: Uint8Array;
  secureCookies: boolean;
};

export function getAuthRuntimeConfig(): AuthRuntimeConfig {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }
  return {
    sessionSecret: new TextEncoder().encode(secret),
    secureCookies: process.env.APP_ENV === "production",
  };
}
