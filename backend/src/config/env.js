import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Nạp file .env từ thư mục backend/ bất kể ứng dụng được chạy từ đâu
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

