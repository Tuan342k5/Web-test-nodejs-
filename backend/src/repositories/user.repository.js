
import bcrypt from "bcryptjs";

// Database giả lập trong bộ nhớ.
// Khi tích hợp PostgreSQL, ta sẽ thay lớp này bằng truy vấn database.
const demoPasswordHash = await bcrypt.hash("User123!", 10);

const users = [
  {
    id: "u001",
    email: "master@example.com",
    name: "Master Admin",
    passwordHash: demoPasswordHash,
    role: "MASTER_ADMIN",
    active: true,
  },
  {
    id: "u002",
    email: "admin@example.com",
    name: "Admin",
    passwordHash: demoPasswordHash,
    role: "ADMIN",
    active: true,
  },
  {
    id: "u003",
    email: "user@example.com",
    name: "Demo User",
    passwordHash: demoPasswordHash,
    role: "USER",
    active: true,
  },
];

export async function findByEmail(email) {
  return users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  ) ?? null;
}
