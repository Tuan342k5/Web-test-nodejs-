# Auth RBAC Enterprise Backend

Hệ thống Backend chuẩn Enterprise xây dựng trên nền tảng **Node.js (ES Modules)**, **Express 5**, **PostgreSQL (Supabase)**, **Redis** và **JWT (RFC 7519)**, hỗ trợ phân quyền vai trò chuyên sâu (**RBAC**), đăng nhập một lần (**Google SSO**) và cơ chế thu hồi token tức thì qua **Redis Blacklist** khi đăng xuất.

---

## 📁 Cấu Trúc Dự Án (Architecture Layout)

```
auth-rbac-backend/
├── src/
│   ├── app.js                          # Cấu hình Express App, Middlewares toàn cục & Routing
│   ├── server.js                       # Điểm khởi động HTTP Server & Graceful Shutdown
│   │
│   ├── config/                         # Cấu hình môi trường & kết nối hạ tầng
│   │   ├── env.js                      # Tải biến môi trường .env tập trung
│   │   ├── database.js                 # PostgreSQL Pool kết nối Supabase / Postgres
│   │   ├── redis.js                    # Kết nối Redis Client & tự động fallback bộ nhớ
│   │   ├── cors.js                     # Chính sách CORS cho Client
│   │   └── passport.js                 # Cấu hình Google SSO & OAuth
│   │
│   ├── routes/
│   │   └── index.js                    # Bộ tổng hợp Root Router (/api)
│   │
│   ├── modules/                        # Các Domain Modules nghiệp vụ độc lập
│   │   ├── auth/                       # Phân hệ Xác thực & Cấp quyền
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.repository.js
│   │   │
│   │   ├── users/                      # Phân hệ Quản lý Người dùng & Profile
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.validation.js
│   │   │   └── user.repository.js
│   │   │
│   │   └── admin/                      # Phân hệ Quản trị Viên & Tổng Quản Trị
│   │       ├── admin.routes.js
│   │       ├── admin.controller.js
│   │       └── admin.service.js
│   │
│   ├── middlewares/                    # Các Middlewares kiểm soát luồng Request
│   │   ├── authenticate.js             # Xác thực Access Token & kiểm tra Redis Blacklist
│   │   ├── authorize.js                # Kiểm soát phân quyền RBAC đa vai trò
│   │   ├── validate.js                 # Validate dữ liệu đầu vào
│   │   ├── rateLimiter.js              # Giới hạn tần suất gọi API phòng ngừa DDoS
│   │   ├── notFound.js                 # Bắt lỗi 404 cho các route không tồn tại
│   │   └── errorHandler.js             # Bộ xử lý lỗi tập trung chuẩn hóa JSON
│   │
│   ├── security/                       # Các Dịch vụ Bảo mật Chuyên sâu
│   │   ├── token.service.js            # Ký, kiểm tra và giải mã JWT
│   │   ├── tokenBlacklist.service.js   # Thu hồi và kiểm tra Blacklist qua Redis với TTL
│   │   ├── password.service.js         # Mã hóa & đối soát mật khẩu bằng Bcrypt
│   │   └── sso.service.js              # Giải mã ID Token Google & tạo user mới vào DB
│   │
│   ├── repositories/                   # Metadata & cấu trúc dữ liệu nền tảng
│   │   └── role.repository.js          # Khai báo vai trò và kiểm tra tính hợp lệ
│   │
│   ├── utils/                          # Tiện ích chung
│   │   ├── ApiError.js                 # Lớp lỗi chuẩn hóa mã HTTP Status
│   │   └── asyncHandler.js             # Wrapper bắt lỗi bất đồng bộ
│   │
│   └── constants/                      # Các hằng số hệ thống
│       ├── roles.js                    # Định nghĩa vai trò MASTER_ADMIN, ADMIN, USER
│       └── tokenTypes.js               # Các loại Token
│
├── migrations/                         # Scripts khởi tạo cấu trúc CSDL
│   └── 001_create_users_table.sql
│
├── tests/                              # Bộ kiểm thử tự động (Unit & Integration)
│   ├── auth/                           # Kiểm thử phân hệ Auth, Token, Password
│   ├── users/                          # Kiểm thử phân hệ User & Roles
│   └── authorization/                  # Kiểm thử Middleware phân quyền RBAC
│
├── .env.example                        # Mẫu file cấu hình môi trường
├── .gitignore                          # Danh sách bỏ qua trong Git
├── Dockerfile                          # Build Docker Image cho Production
├── docker-compose.yml                  # Khởi chạy toàn bộ hệ thống (App + DB + Redis)
├── package.json                        # Khai báo thư viện & kịch bản chạy
└── README.md                           # Tài liệu hướng dẫn sử dụng
```

---

## 🚀 Tính Năng Nổi Bật

1. **RBAC 3 Cấp Độ (Role-Based Access Control):**
   - `MASTER_ADMIN`: Toàn quyền quản trị cao nhất, phân bổ và thay đổi quyền của user, giám sát Redis Blacklist, giám sát hiệu năng hệ thống.
   - `ADMIN`: Quản lý danh sách người dùng, kích hoạt / khóa tạm thời tài khoản.
   - `USER`: Xem và chỉnh sửa thông tin hồ sơ cá nhân.
2. **Google SSO Tự Động Đăng Ký:**
   - Khi người dùng đăng nhập bằng tài khoản Google lần đầu tiên, hệ thống sẽ tự động lưu tài khoản vào cơ sở dữ liệu Supabase/PostgreSQL với vai trò mặc định `USER`.
3. **Cơ Chế Thu Hồi Token (Redis Blacklist):**
   - Khi đăng xuất (`POST /api/auth/logout`), token JWT (và mã định danh `jti`) được lưu ngay vào Redis với thời gian sống (TTL) tương ứng với thời hạn còn lại của token.
   - Mọi request sử dụng token đã bị thu hồi sẽ bị middleware `authenticate` chặn ngay lập tức (HTTP 401: Banned by Redis).
   - Nếu môi trường không cài Redis Server, hệ thống tự động kích hoạt **In-Memory Fallback** an toàn mà không làm gián đoạn ứng dụng.

---

## 🛠 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Thiết lập cấu hình môi trường
Tạo file `.env` dựa trên `.env.example`:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:...@pooler.supabase.com:6543/postgres
DB_SSL=true
JWT_ACCESS_SECRET=your-secure-jwt-secret-with-at-least-32-characters
JWT_ACCESS_EXPIRES_IN=15m
REDIS_URL=redis://127.0.0.1:6379
```

### 3. Khởi chạy
- **Chế độ phát triển (Hot reload):**
  ```bash
  npm run dev
  ```
- **Chế độ sản xuất (Production):**
  ```bash
  npm start
  ```
- **Chạy kiểm thử (Unit tests):**
  ```bash
  npm test
  ```

### 4. Triển khai bằng Docker Compose
```bash
docker-compose up -d --build
```

---

## 📡 Danh Sách API Endpoints

### 1. Xác thực & Tài khoản (`/api/auth`)
| Phương thức | Endpoint | Yêu cầu quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Công khai | Đăng nhập bằng Email & Mật khẩu |
| `POST` | `/api/auth/sso/google` | Công khai | Đăng nhập / Đăng ký nhanh qua Google SSO |
| `POST` | `/api/auth/logout` | Token hợp lệ | Đăng xuất và đưa token vào Redis Blacklist |
| `GET` | `/api/auth/me` | Token hợp lệ | Lấy thông tin tài khoản đang đăng nhập |
| `GET` | `/api/auth/redis-status` | Công khai | Kiểm tra trạng thái Redis và chế độ hoạt động |

### 2. Người dùng (`/api/user`)
| Phương thức | Endpoint | Yêu cầu quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/profile` | `USER`, `ADMIN`, `MASTER_ADMIN` | Lấy thông tin hồ sơ người dùng |

### 3. Quản trị (`/api/admin`)
| Phương thức | Endpoint | Yêu cầu quyền | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `ADMIN`, `MASTER_ADMIN` | Thống kê số lượng user và phân bổ vai trò |
| `GET` | `/api/admin/users` | `ADMIN`, `MASTER_ADMIN` | Xem danh sách toàn bộ người dùng |
| `PATCH` | `/api/admin/users/:id/status` | `ADMIN`, `MASTER_ADMIN` | Khóa hoặc Mở khóa tài khoản |
| `GET` | `/api/admin/master` | `MASTER_ADMIN` | Thông tin bảng điều khiển của Master Admin |
| `GET` | `/api/admin/master/blacklist` | `MASTER_ADMIN` | Danh sách token đang bị cấm trong Redis |
| `PATCH` | `/api/admin/master/users/:id/role`| `MASTER_ADMIN` | Nâng/Hạ vai trò của người dùng (`USER`, `ADMIN`, `MASTER_ADMIN`) |

