import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import replyRoutes from "./routes/replyRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { ApiError } from "./utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:4545",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:postId/comments", commentRoutes);
app.use("/api/comments/:commentId/replies", replyRoutes);
app.use("/api/likes", likeRoutes);

// 404
app.use((_req, _res, next) => {
  next(new ApiError("Route not found", 404));
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
