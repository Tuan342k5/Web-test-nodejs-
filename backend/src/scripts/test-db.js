
import { pool } from "../config/database.js";

try {
  const result = await pool.query(
    "SELECT NOW() AS server_time"
  );

  console.log("Kết nối Supabase thành công!");
  console.log("Server time:", result.rows[0].server_time);
} catch (error) {
  console.error("Kết nối Supabase thất bại.");
  console.error("Message:", error.message);
  console.error("Code:", error.code);
  console.error("Detail:", error.detail);
  process.exitCode = 1;
} finally {
  await pool.end();
}
