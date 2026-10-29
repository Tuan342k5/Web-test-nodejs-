# Auth RBAC Enterprise Frontend

Giao diện người dùng chuẩn Enterprise xây dựng trên nền tảng **React 19**, **Vite**, **Material-UI (MUI)** và **React Router 7**, hỗ trợ phân quyền vai trò chuyên sâu (**RBAC**), đăng nhập một lần (**Google SSO**) và tự động điều hướng thông minh theo quyền tài khoản.

---

## 📁 Cấu Trúc Dự Án (Architecture Layout)

```
auth-rbac-frontend/
├── public/                             # Tài nguyên tĩnh công khai (favicon, icons)
├── src/
│   ├── main.jsx                        # Điểm khởi tạo ứng dụng React Root
│   ├── App.jsx                         # Cấu hình App Providers & Router gốc
│   │
│   ├── app/                            # Cấu hình lõi ứng dụng
│   │   ├── router.jsx                  # Định nghĩa Routing toàn hệ thống & RootRedirect
│   │   └── providers.jsx               # Bọc MUI ThemeProvider, CssBaseline & AuthProvider
│   │
│   ├── config/
│   │   └── env.js                      # Cấu hình biến môi trường (VITE_API_URL)
│   │
│   ├── layouts/                        # Bố cục giao diện
│   │   ├── PublicLayout.jsx            # Layout cho các trang thông báo công khai (403, 404)
│   │   ├── AuthLayout.jsx              # Layout trang đăng nhập & SSO
│   │   └── DashboardLayout.jsx         # Layout quản trị với Top AppBar, Role Badge & Nút Logout
│   │
│   ├── pages/                          # Các màn hình giao diện
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx           # Trang đăng nhập Email/Password & Google SSO
│   │   │   ├── SsoCallbackPage.jsx     # Trang đón nhận và xử lý callback từ SSO
│   │   │   └── ForbiddenPage.jsx       # Trang báo lỗi 403 (Cấm truy cập)
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx       # Trang điều phối tổng quan
│   │   ├── users/
│   │   │   └── UsersPage.jsx           # Trang dành cho quyền USER
│   │   ├── admin/
│   │   │   └── AdminPage.jsx           # Trang dành cho quyền ADMIN
│   │   ├── master-admin/
│   │   │   └── MasterAdminPage.jsx     # Trang dành cho quyền MASTER_ADMIN
│   │   └── NotFoundPage.jsx            # Trang báo lỗi 404 (Không tìm thấy)
│   │
│   ├── components/                     # Các components tái sử dụng
│   │   ├── common/
│   │   │   ├── Loading.jsx             # Spinner tải trang toàn cục
│   │   │   └── ErrorMessage.jsx        # Hộp thông báo lỗi có nút thử lại
│   │   └── auth/
│   │       ├── ProtectedRoute.jsx      # Guard bảo vệ tuyến đường theo trạng thái & vai trò
│   │       └── RoleGuard.jsx           # Guard ẩn/hiện thành phần UI theo vai trò
│   │
│   ├── contexts/                       # Quản lý State toàn cục
│   │   └── AuthContext.jsx             # Quản lý trạng thái Token, User, Login & Logout
│   │
│   ├── hooks/                          # Custom Hooks
│   │   └── useAuth.js                  # Hook truy cập nhanh Auth Context
│   │
│   ├── services/                       # Tầng giao tiếp mạng (API Services)
│   │   ├── apiClient.js                # Fetch wrapper tập trung, đính kèm Bearer token & xử lý 401
│   │   ├── authService.js              # Gọi API /login, /sso/google, /logout, /me
│   │   └── userService.js              # Gọi API /profile, /admin/users, /master/users/:id/role
│   │
│   ├── utils/                          # Hàm tiện ích
│   │   └── auth.utils.js               # Quản lý localStorage, decode JWT, tính toán route
│   │
│   ├── constants/                      # Hằng số hệ thống
│   │   ├── roles.js                    # Hằng số vai trò: MASTER_ADMIN, ADMIN, USER
│   │   └── routes.js                   # Hằng số đường dẫn ứng dụng
│   │
│   └── styles/                         # Style toàn cục
│       └── global.css                  # CSS Reset & base styles
│
├── tests/                              # Bộ kiểm thử tự động
│   └── auth.utils.test.js              # Test parser JWT, roles & routes
├── .env.example                        # Mẫu cấu hình môi trường
├── .gitignore                          # Danh sách bỏ qua trong Git
├── package.json                        # Cấu hình dependency & kịch bản chạy
└── README.md                           # Tài liệu hướng dẫn sử dụng
```

---

## 🚀 Luồng Hoạt Động Chính

1. **Điều Hướng Tự Động Theo Vai Trò (Smart Role Redirect):**
   - Khi người dùng đăng nhập thành công:
     - `MASTER_ADMIN` ➔ Tự động chuyển hướng đến `/master-admin`
     - `ADMIN` ➔ Tự động chuyển hướng đến `/admin`
     - `USER` ➔ Tự động chuyển hướng đến `/users`
   - Khi truy cập route gốc `/`, hệ thống tự động kiểm tra phiên và đưa người dùng về đúng trang của vai trò mình.
2. **Cơ Chế Đăng Xuất An Toàn (Redis Token Blacklist):**
   - Khi người dùng bấm **Đăng Xuất**, client gửi yêu cầu đến `POST /api/auth/logout`.
   - Backend đưa token vào danh sách đen trên Redis với TTL.
   - Client xóa sạch token trong `localStorage` và chuyển về `/login`.
3. **Phân Quyền Tuyến Đường (Route Guarding):**
   - Nếu truy cập trang vượt quyền hạn (ví dụ `USER` vào `/master-admin`), `ProtectedRoute` sẽ tự động chuyển hướng đến `/forbidden` (403).

---

## 🛠 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Thiết lập file cấu hình môi trường
Tạo file `.env` dựa theo mẫu `.env.example`:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Khởi chạy
- **Chế độ phát triển:**
  ```bash
  npm run dev
  ```
- **Kiểm thử tự động:**
  ```bash
  npm test
  ```
- **Build cho sản xuất:**
  ```bash
  npm run build
  ```
