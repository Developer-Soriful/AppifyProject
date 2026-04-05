import { Request, Response } from "express";
import {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  IUser,
} from "@appify/shared";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body as RegisterPayload;

  const exists = await User.findOne({ email }).lean();
  if (exists) throw new ApiError("Email already registered", 409);

  const user = await User.create({ firstName, lastName, email, password });
  if (!user) throw new ApiError("Failed to create user", 400);

  const token = generateToken(user._id.toString());

  // Return standard AuthResponse
  const responseData: AuthResponse = {
    token,
    user: {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: responseData,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginPayload;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError("Invalid email or password", 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError("Invalid email or password", 401);

  const token = generateToken(user._id.toString());

  // Explicit type safety using AuthResponse
  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    } as AuthResponse,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).lean();
  if (!user) throw new ApiError("User not found", 404);

  res.json({ success: true, data: { user } });
});
