import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = parseInt(process.env.PORT ?? "5000", 10);

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