import bcrypt from "bcryptjs";

// Database người dùng mô phỏng với dữ liệu khởi tạo
const demoPasswordHash = await bcrypt.hash("User123!", 10);

const users = [
  {
    id: "u001",
    email: "master@example.com",
    name: "Master Admin (Tổng Quản Trị)",
    passwordHash: demoPasswordHash,
    role: "MASTER_ADMIN",
    provider: "local",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=master",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u002",
    email: "admin@example.com",
    name: "Admin (Quản Trị Viên)",
    passwordHash: demoPasswordHash,
    role: "ADMIN",
    provider: "local",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u003",
    email: "user@example.com",
    name: "Demo User (Người Dùng)",
    passwordHash: demoPasswordHash,
    role: "USER",
    provider: "local",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=user",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Tìm người dùng theo email
 */
export async function findByEmail(email) {
  if (!email) return null;
  return users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase().trim()
  ) ?? null;
}

/**
 * Tìm người dùng theo ID
 */
export async function findById(id) {
  if (!id) return null;
  return users.find((user) => user.id === id) ?? null;
}

/**
 * Lấy danh sách toàn bộ người dùng (loại bỏ mật khẩu hash)
 */
export async function getAllUsers() {
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    provider: u.provider || "local",
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`,
    active: u.active,
    createdAt: u.createdAt,
  }));
}

/**
 * Đăng ký mới hoặc tìm người dùng qua luồng SSO Google
 * Nếu tài khoản chưa có trong DB -> Tự động đăng ký mới vào DB
 */
export async function findOrCreateSSOUser({
  email,
  name,
  avatar,
  provider = "google",
  role = "USER",
}) {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await findByEmail(normalizedEmail);

  if (existingUser) {
    // Nếu đã tồn tại, cập nhật avatar hoặc name mới nhất nếu có
    if (avatar && !existingUser.avatar) {
      existingUser.avatar = avatar;
    }
    return { user: existingUser, isNew: false };
  }

  // Tự động gán quyền nếu email demo mang tên master hoặc admin
  let assignedRole = role;
  if (!role || role === "USER") {
    if (normalizedEmail.includes("master")) {
      assignedRole = "MASTER_ADMIN";
    } else if (normalizedEmail.includes("admin")) {
      assignedRole = "ADMIN";
    } else {
      assignedRole = "USER";
    }
  }

  // Tự động tạo tài khoản mới vào Database
  const newUser = {
    id: `u${String(users.length + 1).padStart(3, "0")}`,
    email: normalizedEmail,
    name: name || normalizedEmail.split("@")[0],
    passwordHash: null, // SSO không cần mật khẩu cục bộ
    role: assignedRole,
    provider,
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedEmail}`,
    active: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  console.log(`[Database] Đã đăng ký tài khoản SSO Google mới vào DB: ${newUser.email} (${newUser.role})`);

  return { user: newUser, isNew: true };
}

/**
 * Cập nhật vai trò (Role) của người dùng
 */
export async function updateUserRole(id, newRole) {
  const user = await findById(id);
  if (!user) {
    const error = new Error("Không tìm thấy người dùng.");
    error.statusCode = 404;
    throw error;
  }

  if (!["MASTER_ADMIN", "ADMIN", "USER"].includes(newRole)) {
    const error = new Error("Vai trò không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }

  user.role = newRole;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  };
}

/**
 * Khóa hoặc Mở khóa tài khoản người dùng
 */
export async function toggleUserStatus(id) {
  const user = await findById(id);
  if (!user) {
    const error = new Error("Không tìm thấy người dùng.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "MASTER_ADMIN") {
    const error = new Error("Không thể khóa tài khoản MASTER_ADMIN tối cao.");
    error.statusCode = 400;
    throw error;
  }

  user.active = !user.active;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    active: user.active,
    role: user.role,
  };
}
