import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("Thiếu DATABASE_URL trong file .env");
}

const isSslEnabled = process.env.DB_SSL === "true";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
  max: 5,
  connectionTimeoutMillis: 15000,
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});
