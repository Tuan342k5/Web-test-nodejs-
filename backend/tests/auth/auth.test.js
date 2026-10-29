import test from "node:test";
import assert from "node:assert/strict";
import "../../src/config/env.js";
import { createAccessToken, verifyAccessToken } from "../../src/security/token.service.js";
import { hashPassword, comparePassword } from "../../src/security/password.service.js";
import { blacklistToken, isTokenBlacklisted } from "../../src/security/tokenBlacklist.service.js";
import { getGoogleOAuthUrl, authenticateWithGoogle } from "../../src/security/sso.service.js";

test("Auth Module Tests", async (t) => {
  await t.test("Password service should hash and compare passwords correctly", async () => {
    const raw = "SuperSecret123!";
    const hashed = await hashPassword(raw);
    assert.notEqual(raw, hashed);

    const isMatch = await comparePassword(raw, hashed);
    assert.equal(isMatch, true);

    const isWrongMatch = await comparePassword("WrongPassword", hashed);
    assert.equal(isWrongMatch, false);
  });

  await t.test("Token service should create and verify valid JWT token", () => {
    const mockUser = {
      id: "test-user-id-01",
      email: "tester@example.com",
      role: "USER",
    };

    const token = createAccessToken(mockUser);
    assert.ok(typeof token === "string" && token.length > 0);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.sub, mockUser.id);
    assert.equal(decoded.email, mockUser.email);
    assert.equal(decoded.role, mockUser.role);
    assert.ok(decoded.jti);
  });

  await t.test("Token blacklist service should blacklist token and check status", async () => {
    const jti = "test-jti-uuid-1234";
    const initialStatus = await isTokenBlacklisted(jti);
    assert.equal(initialStatus, false);

    await blacklistToken(jti, 60, { email: "tester@example.com", role: "USER" });
    const blacklistedStatus = await isTokenBlacklisted(jti);
    assert.equal(blacklistedStatus, true);
  });

  await t.test("SSO service should build valid Google OAuth redirect URL", () => {
    const url = getGoogleOAuthUrl("test-state");
    assert.ok(url.startsWith("https://accounts.google.com/o/oauth2/v2/auth"));
    assert.ok(url.includes("client_id="));
    assert.ok(url.includes("redirect_uri="));
    assert.ok(url.includes("scope="));
  });

  await t.test("SSO synchronization: Same Google email across Form Login and Google OAuth maps to identical account", async () => {
    const testEmail = "sync.user." + Date.now() + "@gmail.com";

    // 1. Đăng nhập lần đầu bằng form Google SSO
    const res1 = await authenticateWithGoogle({ email: testEmail, name: "Initial Google User" });
    assert.equal(res1.isNewAccount, true);
    assert.equal(res1.user.email, testEmail);
    const userId = res1.user.id;

    // 2. Đăng nhập lần 2 (như khi người dùng bấm nút Google OAuth cho cùng email đó)
    const res2 = await authenticateWithGoogle({ email: testEmail, name: "Google Verified Name" });
    assert.equal(res2.isNewAccount, false);
    assert.equal(res2.user.id, userId); // Cùng ID, đồng bộ 1 tài khoản duy nhất
    assert.equal(res2.user.email, testEmail);
    assert.equal(res2.user.role, res1.user.role);
  });
});
