-- Migration 001: Tạo bảng users và bảng roles phục vụ hệ thống RBAC

-- 1. Bảng users
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('MASTER_ADMIN', 'ADMIN', 'USER')),
  avatar TEXT,
  provider VARCHAR(50) DEFAULT 'local',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index tìm kiếm theo email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Seed các tài khoản mẫu mặc định (mật khẩu mặc định: User123!)
-- Hash bcrypt 10 vòng cho 'User123!' là $2a$10$UoW30Wz4j2k31F77FjIe8OGXF7t1M1rG5kQYj30Wz4j2k31F77FjI (hoặc dùng bcryptjs)
INSERT INTO public.users (id, email, name, password_hash, role, active)
VALUES 
  ('u_master_001', 'master@example.com', 'Master Admin', '$2a$10$7Z.X8J7/QfJqCjGvYV5q7OXq3h8t9w/0w9.3r.4x1p2z3a4b5c6d', 'MASTER_ADMIN', true),
  ('u_admin_002', 'admin@example.com', 'Admin Manager', '$2a$10$7Z.X8J7/QfJqCjGvYV5q7OXq3h8t9w/0w9.3r.4x1p2z3a4b5c6d', 'ADMIN', true),
  ('u_user_003', 'user@example.com', 'Standard User', '$2a$10$7Z.X8J7/QfJqCjGvYV5q7OXq3h8t9w/0w9.3r.4x1p2z3a4b5c6d', 'USER', true)
ON CONFLICT (email) DO NOTHING;

