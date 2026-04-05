import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT ?? "5000", 10);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});