import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
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

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { firstName, lastName, bio, location, website } = req.body;

  // Build update object
  const updateData: Record<string, string | undefined> = {};
  if (firstName !== undefined) updateData.firstName = firstName.trim();
  if (lastName !== undefined) updateData.lastName = lastName.trim();
  if (bio !== undefined) updateData.bio = bio.trim();
  if (location !== undefined) updateData.location = location.trim();
  if (website !== undefined) updateData.website = website.trim();

  // Handle avatar upload
  if (req.file) {
    updateData.avatar = `/uploads/${req.file.filename}`;
  }

  // Validate required fields
  if (updateData.firstName && updateData.firstName.length > 50) {
    throw new ApiError("First name must be less than 50 characters", 400);
  }
  if (updateData.lastName && updateData.lastName.length > 50) {
    throw new ApiError("Last name must be less than 50 characters", 400);
  }
  if (updateData.bio && updateData.bio.length > 500) {
    throw new ApiError("Bio must be less than 500 characters", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  } as ApiResponse);
});

// Get all users with connection status for Find Friends page
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();
  const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
  const limit = Math.min(50, parseInt(req.query["limit"] as string) || 20);
  const skip = (page - 1) * limit;
  const search = (req.query["search"] as string) || "";

  // Build filter - exclude current user
  const filter: any = { _id: { $ne: currentUserId } };
  
  // Add search if provided
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }

  // Get users
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("firstName lastName avatar followersCount followingCount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Get all follows where current user is involved
  const follows = await Follow.find({
    $or: [
      { follower: currentUserId },
      { following: currentUserId },
    ],
  }).lean();

  // Map users with connection status
  const usersWithStatus = users.map((user) => {
    const userId = user._id.toString();
    
    // Check if connected (follow accepted in either direction)
    const isConnected = follows.some(
      (f) =>
        f.status === "accepted" &&
        ((f.follower.toString() === currentUserId && f.following.toString() === userId) ||
         (f.follower.toString() === userId && f.following.toString() === currentUserId))
    );

    // Check if pending sent
    const isPendingSent = follows.some(
      (f) =>
        f.status === "pending" &&
        f.follower.toString() === currentUserId &&
        f.following.toString() === userId
    );

    // Check if pending received
    const isPendingReceived = follows.some(
      (f) =>
        f.status === "pending" &&
        f.follower.toString() === userId &&
        f.following.toString() === currentUserId
    );

    let connectionStatus: "none" | "connected" | "pending_sent" | "pending_received" = "none";
    if (isConnected) connectionStatus = "connected";
    else if (isPendingSent) connectionStatus = "pending_sent";
    else if (isPendingReceived) connectionStatus = "pending_received";

    return {
      ...user,
      _id: userId,
      connectionStatus,
    };
  });

  res.json({
    success: true,
    message: "Users fetched",
    data: usersWithStatus,
    total,
    page,
    limit,
    hasMore: skip + users.length < total,
  } as ApiResponse);
});
