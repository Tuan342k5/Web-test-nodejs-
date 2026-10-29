import "./../config/env.js";
import { login, ssoGoogleLogin, logout } from "../controllers/auth.controller.js";
import { getAllUsers } from "../repositories/user.repository.js";
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware.js";

async function runFullTest() {
  console.log("=== TEST 1: EMAIL & PASSWORD LOGIN ===");
  let userToken = null;
  const loginReq = { body: { email: "user@example.com", password: "User123!" } };
  const loginRes = {
    status(c) { this.code = c; return this; },
    json(d) {
      console.log("Login Code:", this.code, "Success:", d.success);
      userToken = d.data.accessToken;
    }
  };
  await login(loginReq, loginRes, (e) => console.error(e));

  console.log("\n=== TEST 2: GOOGLE SSO AUTO-REGISTRATION INTO DB ===");
  let ssoToken = null;
  const ssoReq = {
    body: {
      email: "newbie.google@gmail.com",
      name: "Nguyen Van Newbie",
      avatar: "https://lh3.googleusercontent.com/a/default-user",
    }
  };
  const ssoRes = {
    status(c) { this.code = c; return this; },
    json(d) {
      console.log("SSO Code:", this.code, "Message:", d.message);
      console.log("Is New Account registered in DB?:", d.data.isNewAccount);
      console.log("User registered in DB:", d.data.user);
      ssoToken = d.data.accessToken;
    }
  };
  await ssoGoogleLogin(ssoReq, ssoRes, (e) => console.error(e));

  console.log("\n=== TEST 3: VERIFY DB CONTAINS NEW SSO USER ===");
  const allUsers = await getAllUsers();
  console.log("Total users in DB now:", allUsers.length);
  const found = allUsers.find(u => u.email === "newbie.google@gmail.com");
  console.log("Found in DB?:", !!found, found ? `Role: ${found.role}, Provider: ${found.provider}` : "");

  console.log("\n=== TEST 4: RBAC PERMISSION CHECKS ===");
  const req = { headers: { authorization: "Bearer " + userToken } };
  const mockRes = { status(c) { this.code = c; return this; }, json(d) { this.data = d; } };
  await authenticateToken(req, mockRes, () => {});
  console.log("User authenticated as:", req.auth.email, "Role:", req.auth.role);

  let adminPassed = false;
  const adminCheck = authorizeRoles("ADMIN", "MASTER_ADMIN");
  adminCheck(req, mockRes, () => { adminPassed = true; });
  console.log("USER accessing ADMIN route -> Passed?", adminPassed, "Status Code:", mockRes.code, mockRes.data?.message);

  console.log("\n=== TEST 5: LOGOUT & REDIS BAN ===");
  const logoutReq = { headers: { authorization: "Bearer " + userToken }, auth: req.auth };
  const logoutRes = {
    status(c) { this.code = c; return this; },
    json(d) { console.log("Logout Code:", this.code, "Message:", d.message); }
  };
  await logout(logoutReq, logoutRes, (e) => console.error(e));

  console.log("\n=== TEST 6: REUSING TOKEN AFTER LOGOUT (REDIS BLACKLIST) ===");
  let accessPassed = false;
  const reuseRes = {
    status(c) { this.code = c; return this; },
    json(d) { console.log("Access Code:", this.code, "Banned Message:", d.message); }
  };
  await authenticateToken(req, reuseRes, () => { accessPassed = true; });
  console.log("Did post-logout request pass? ->", accessPassed ? "FAILED (Security leak)" : "BLOCKED AS EXPECTED (401)");
}

runFullTest();

