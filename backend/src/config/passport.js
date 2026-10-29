import "./env.js";

/**
 * Cấu hình xác thực Google OAuth / SSO
 */
export const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
  frontendURL: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default googleOAuthConfig;
