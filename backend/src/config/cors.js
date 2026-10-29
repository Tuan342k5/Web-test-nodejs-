const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép gọi không có origin (ví dụ: curl, mobile apps, Postman) hoặc origin nằm trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} không được phép bởi CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

