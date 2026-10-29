import test from "node:test";
import assert from "node:assert/strict";
import { ROLES, ALL_ROLES } from "../src/constants/roles.js";
import { ROUTES, getDefaultRouteForRole } from "../src/constants/routes.js";
import { parseJwtPayload, isTokenExpired } from "../src/utils/auth.utils.js";

test("Frontend Constants & Utils Tests", async (t) => {
  await t.test("Roles should contain MASTER_ADMIN, ADMIN, USER", () => {
    assert.equal(ALL_ROLES.length, 3);
    assert.equal(ROLES.MASTER_ADMIN, "MASTER_ADMIN");
    assert.equal(ROLES.ADMIN, "ADMIN");
    assert.equal(ROLES.USER, "USER");
  });

  await t.test("Routes should resolve default destination per role", () => {
    assert.equal(getDefaultRouteForRole(ROLES.MASTER_ADMIN), ROUTES.MASTER_ADMIN);
    assert.equal(getDefaultRouteForRole(ROLES.ADMIN), ROUTES.ADMIN);
    assert.equal(getDefaultRouteForRole(ROLES.USER), ROUTES.USERS);
    assert.equal(ROUTES.USERS, "/user");
  });

  await t.test("Token parser should handle valid and invalid JWT payload strings", () => {
    const invalid = parseJwtPayload("invalid-token-string");
    assert.equal(invalid, null);

    // Mock header.payload.signature
    const mockPayload = { sub: "123", email: "test@example.com", exp: 9999999999 };
    const base64Payload = btoa(JSON.stringify(mockPayload));
    const token = `fakeHeader.${base64Payload}.fakeSig`;

    const parsed = parseJwtPayload(token);
    assert.equal(parsed.sub, "123");
    assert.equal(parsed.email, "test@example.com");

    assert.equal(isTokenExpired(token), false);
  });
});

