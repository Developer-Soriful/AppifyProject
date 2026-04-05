import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "@appify/shared";
import { ApiError } from "../utils/ApiError.js";

export const getSuggestedUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.user!._id;

    // Fetch users that are not the current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("firstName lastName avatar")
      .limit(5)
      .lean();

    res.json({
      success: true,
      message: "Suggested users fetched",
      data: users,
    } as ApiResponse);
  },
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params["id"] || req.user!._id;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    throw new ApiError("Invalid User ID", 400);
  }

  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({
    success: true,
    message: "Profile fetched",
    data: user,
  } as ApiResponse);
});
