# ==========================================
# Dockerfile cho Auth RBAC Backend Service
# ==========================================

FROM node:20-alpine AS base

# Cài đặt thư viện phụ trợ nếu cần
WORKDIR /app

# Sao chép file cấu hình dependency
COPY package*.json ./

# Cài đặt toàn bộ dependencies
RUN npm ci --omit=dev

# Sao chép mã nguồn
COPY . .

# Mở cổng dịch vụ
EXPOSE 3000

# Thiết lập biến môi trường mặc định
ENV NODE_ENV=production
ENV PORT=3000

# Khởi chạy server
CMD ["node", "src/server.js"]

