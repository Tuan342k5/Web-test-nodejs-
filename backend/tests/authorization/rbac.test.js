import test from "node:test";
import assert from "node:assert/strict";
import "../../src/config/env.js";
import { authorize } from "../../src/middlewares/authorize.js";
import { ROLES } from "../../src/constants/roles.js";

test("Authorization (RBAC) Middleware Tests", async (t) => {
  await t.test("Should allow access when user role matches allowed roles", () => {
    const middleware = authorize(ROLES.MASTER_ADMIN, ROLES.ADMIN);
    let nextCalled = false;
    let nextError = null;

    const req = {
      auth: { id: "1", email: "admin@example.com", role: ROLES.ADMIN },
    };
    const res = {};
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
  });

  await t.test("Should block access (403) when user role is not authorized", () => {
    const middleware = authorize(ROLES.MASTER_ADMIN);
    let nextCalled = false;
    let nextError = null;

    const req = {
      auth: { id: "2", email: "user@example.com", role: ROLES.USER },
    };
    const res = {};
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 403);
  });

  await t.test("Should block access (401) when user is not authenticated", () => {
    const middleware = authorize(ROLES.USER);
    let nextCalled = false;
    let nextError = null;

    const req = {};
    const res = {};
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    middleware(req, res, next);
    assert.equal(nextCalled, true);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 401);
  });
});

