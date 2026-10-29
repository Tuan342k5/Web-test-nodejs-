import "./env.js";

/**
 * Cấu hình xác thực Google OAuth / SSO
 */
export const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
};

