import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const required = (fields: string[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const missing = fields.filter((f) => !String(req.body[f] ?? "").trim());
    if (missing.length > 0) {
      next(new ApiError(`Missing required fields: ${missing.join(", ")}`, 400));
      return;
    }
    next();
  };

export const isEmail: RequestHandler = (req, _res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email as string)) {
    return next(new ApiError("Invalid email address", 400));
  }
  next();
};

export const isStrongPassword: RequestHandler = (req, _res, next) => {
  const pwd = req.body.password as string | undefined;
  if (!pwd || pwd.length < 6) {
    return next(new ApiError("Password must be at least 6 characters", 400));
  }
  next();
};

