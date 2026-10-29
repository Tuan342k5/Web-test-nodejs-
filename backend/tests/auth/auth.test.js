import test from "node:test";
import assert from "node:assert/strict";
import "../../src/config/env.js";
import { createAccessToken, verifyAccessToken } from "../../src/security/token.service.js";
import { hashPassword, comparePassword } from "../../src/security/password.service.js";
import { blacklistToken, isTokenBlacklisted } from "../../src/security/tokenBlacklist.service.js";

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
});

