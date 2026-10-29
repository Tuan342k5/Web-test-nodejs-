import { pool } from "../../config/database.js";
import bcrypt from "bcryptjs";

// Khởi tạo bộ nhớ đệm dự phòng nếu mất kết nối mạng đến PostgreSQL Supabase
const demoPasswordHash = await bcrypt.hash("User123!", 10);
const memoryUsers = [
  {
    id: "u001",
    email: "master@example.com",
    name: "Master Admin",
    passwordHash: demoPasswordHash,
    role: "MASTER_ADMIN",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u002",
    email: "admin@example.com",
    name: "Admin",
    passwordHash: demoPasswordHash,
    role: "ADMIN",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u003",
    email: "user@example.com",
    name: "Demo User",
    passwordHash: demoPasswordHash,
    role: "USER",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Tìm người dùng theo email từ database PostgreSQL Supabase
 */
export async function findByEmail(email) {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  try {
    const res = await pool.query(
      `SELECT id, email, name, password_hash AS "passwordHash", role, active, created_at AS "createdAt"
       FROM public.users 
       WHERE LOWER(email) = LOWER($1) 
       LIMIT 1`,
      [normalized]
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn("[PostgreSQL] Lỗi findByEmail từ database, sử dụng dự phòng:", err.message);
  }

  return memoryUsers.find((u) => u.email.toLowerCase() === normalized) || null;
}

/**
 * Tìm người dùng theo ID từ database PostgreSQL Supabase
 */
export async function findById(id) {
  if (!id) return null;

  try {
    const res = await pool.query(
      `SELECT id, email, name, password_hash AS "passwordHash", role, active, created_at AS "createdAt"
       FROM public.users 
       WHERE id = $1 
       LIMIT 1`,
      [id]
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn("[PostgreSQL] Lỗi findById từ database, sử dụng dự phòng:", err.message);
  }

  return memoryUsers.find((u) => u.id === id) || null;
}

/**
 * Lấy danh sách toàn bộ người dùng từ database PostgreSQL
 */
export async function getAllUsers() {
  try {
    const res = await pool.query(
      `SELECT id, email, name, role, active, created_at AS "createdAt"
       FROM public.users 
       ORDER BY id ASC`
    );

    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch (err) {
    console.warn("[PostgreSQL] Lỗi getAllUsers từ database, sử dụng dự phòng:", err.message);
  }

  return memoryUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
  }));
}

/**
 * Tìm hoặc tự động tạo mới tài khoản Google SSO vào database PostgreSQL Supabase
 */
export async function findOrCreateSSOUser({ email, name, role = "USER", provider = "google" }) {
  const normalized = email.toLowerCase().trim();

  const existing = await findByEmail(normalized);
  if (existing) {
    // Nếu có tên đầy đủ từ Google và tài khoản cũ chưa có tên (hoặc chỉ có prefix email), cập nhật tên mới
    if (name && (!existing.name || existing.name === normalized.split("@")[0])) {
      try {
        await pool.query(`UPDATE public.users SET name = $1 WHERE id = $2`, [name, existing.id]);
        existing.name = name;
      } catch (err) {
        const mem = memoryUsers.find((u) => u.id === existing.id);
        if (mem) mem.name = name;
      }
    }
    return { user: existing, isNew: false };
  }

  let assignedRole = role;
  if (!role || role === "USER") {
    if (normalized.includes("master")) assignedRole = "MASTER_ADMIN";
    else if (normalized.includes("admin")) assignedRole = "ADMIN";
    else assignedRole = "USER";
  }

  const newId = `u${Date.now().toString().slice(-4)}`;
  const userName = name || normalized.split("@")[0];
  const ssoPlaceholderHash = "$2b$10$SSO_GOOGLE_ACCOUNT_NO_LOCAL_PASSWORD_ALLOWED$";

  try {
    const res = await pool.query(
      `INSERT INTO public.users (id, email, name, password_hash, role, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, email, name, role, active, created_at AS "createdAt"`,
      [newId, normalized, userName, ssoPlaceholderHash, assignedRole, true]
    );

    if (res.rows.length > 0) {
      console.log(`[PostgreSQL DB] Đã lưu tài khoản SSO Google mới vào DB: ${normalized}`);
      return { user: res.rows[0], isNew: true };
    }
  } catch (err) {
    console.warn("[PostgreSQL] Lỗi khi thêm tài khoản SSO vào DB, lưu dự phòng:", err.message);
  }

  const memUser = {
    id: newId,
    email: normalized,
    name: userName,
    passwordHash: null,
    role: assignedRole,
    active: true,
    createdAt: new Date().toISOString(),
  };
  memoryUsers.push(memUser);
  return { user: memUser, isNew: true };
}

/**
 * Cập nhật vai trò (Role) trong database PostgreSQL
 */
export async function updateUserRole(id, newRole) {
  try {
    const res = await pool.query(
      `UPDATE public.users 
       SET role = $1 
       WHERE id = $2 
       RETURNING id, email, name, role, active`,
      [newRole, id]
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn("[PostgreSQL] Lỗi updateUserRole từ database:", err.message);
  }

  const user = memoryUsers.find((u) => u.id === id);
  if (user) user.role = newRole;
  return user;
}

/**
 * Khóa hoặc Mở khóa tài khoản trong database PostgreSQL
 */
export async function toggleUserStatus(id) {
  if (id === "u001") {
    throw new Error("Không thể khóa tài khoản MASTER_ADMIN tối cao.");
  }

  try {
    const res = await pool.query(
      `UPDATE public.users 
       SET active = NOT active 
       WHERE id = $1 
       RETURNING id, email, name, role, active`,
      [id]
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn("[PostgreSQL] Lỗi toggleUserStatus từ database:", err.message);
  }

  const user = memoryUsers.find((u) => u.id === id);
  if (user) user.active = !user.active;
  return user;
}

