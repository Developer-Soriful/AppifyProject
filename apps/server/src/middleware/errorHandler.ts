import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if ((err as unknown as Record<string, unknown>)["code"] === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  } else if (err.message === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File size must be less than 5MB";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${req.method}] ${req.path} →`, err.message);
  }

  res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
