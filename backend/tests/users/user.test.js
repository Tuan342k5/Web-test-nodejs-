import test from "node:test";
import assert from "node:assert/strict";
import "../../src/config/env.js";
import { getAllRoles, isValidRole } from "../../src/repositories/role.repository.js";
import { validateUpdateRole } from "../../src/modules/users/user.validation.js";
import { ROLES } from "../../src/constants/roles.js";

test("Users Module Tests", async (t) => {
  await t.test("Role repository should provide all 3 RBAC roles", async () => {
    const roles = await getAllRoles();
    assert.equal(roles.length, 3);

    const validMaster = await isValidRole(ROLES.MASTER_ADMIN);
    assert.equal(validMaster, true);

    const validAdmin = await isValidRole(ROLES.ADMIN);
    assert.equal(validAdmin, true);

    const validUser = await isValidRole(ROLES.USER);
    assert.equal(validUser, true);

    const invalidRole = await isValidRole("SUPER_HACKER");
    assert.equal(invalidRole, false);
  });

  await t.test("User role validation schema should validate correctly", () => {
    const validReq = { body: { role: ROLES.ADMIN } };
    const validRes = validateUpdateRole(validReq);
    assert.equal(validRes.isValid, true);

    const invalidReq = { body: { role: "GUEST" } };
    const invalidRes = validateUpdateRole(invalidReq);
    assert.equal(invalidRes.isValid, false);
  });
});

