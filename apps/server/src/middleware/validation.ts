import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const required = (fields: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const missing = fields.filter((f) => !req.body[f]?.toString().trim());
  if (missing.length > 0) {
    return next(new ApiError(`Missing required fields: ${missing.join(", ")}`, 400));
  }
  next();
};

export const isEmail = (req: Request, res: Response, next: NextFunction) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return next(new ApiError("Invalid email address", 400));
  }
  next();
};

export const isStrongPassword = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.password || req.body.password.length < 6) {
    return next(new ApiError("Password must be at least 6 characters", 400));
  }
  next();
};
