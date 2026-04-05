import { Request, Response } from "express";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "@appify/shared";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notificationController.js";

// Send connection request (creates pending follow)
export const sendConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
  const followerId = req.user!._id.toString();
  const userId = req.params.userId as string;

  if (followerId === userId) {
    throw new ApiError("Cannot send connection request to yourself", 400);
  }

  // Check if user exists
  const targetUser = await User.findById(userId).select("firstName lastName").lean();
  if (!targetUser) {
    throw new ApiError("User not found", 404);
  }

  const existing = await Follow.findOne({ follower: followerId, following: userId });

  if (existing) {
    if (existing.status === "pending") {
      throw new ApiError("Connection request already sent", 400);
    }
    throw new ApiError("Already connected with this user", 400);
  }

  // Create pending follow request
  await Follow.create({ 
    follower: followerId, 
    following: userId, 
    status: "pending" 
  });

  // Create notification for recipient
  const currentUser = await User.findById(followerId).select("firstName lastName avatar").lean();
  await createNotification({
    recipient: userId,
    sender: followerId,
    type: "follow",
    title: "Connection Request",
    message: `${currentUser?.firstName} ${currentUser?.lastName} sent you a connection request`,
  });

  res.json({
    success: true,
    message: "Connection request sent",
    data: { status: "pending" },
  } as ApiResponse);
});

// Accept connection request
export const acceptConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();
  const requesterId = req.params.userId as string;

  const followRequest = await Follow.findOne({
    follower: requesterId,
    following: currentUserId,
    status: "pending",
  });

  if (!followRequest) {
    throw new ApiError("Connection request not found", 404);
  }

  // Update status to accepted
  followRequest.status = "accepted";
  await followRequest.save();

  // Update follower/following counts for both users
  await Promise.all([
    User.findByIdAndUpdate(requesterId, { $inc: { followingCount: 1 } }),
    User.findByIdAndUpdate(currentUserId, { $inc: { followersCount: 1 } }),
  ]);

  // Create notification for requester
  const currentUser = await User.findById(currentUserId).select("firstName lastName").lean();
  await createNotification({
    recipient: requesterId,
    sender: currentUserId,
    type: "follow",
    title: "Request Accepted",
    message: `${currentUser?.firstName} ${currentUser?.lastName} accepted your connection request`,
  });

  res.json({
    success: true,
    message: "Connection request accepted",
    data: { status: "accepted" },
  } as ApiResponse);
});

// Reject/Cancel connection request
export const rejectConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();
  const userId = req.params.userId as string;
  const action = req.query.action as string; // "reject" (incoming) or "cancel" (sent)

  let followRequest;
  
  if (action === "cancel") {
    // Current user is canceling their sent request
    followRequest = await Follow.findOne({
      follower: currentUserId,
      following: userId,
      status: "pending",
    });
  } else {
    // Current user is rejecting an incoming request
    followRequest = await Follow.findOne({
      follower: userId,
      following: currentUserId,
      status: "pending",
    });
  }

  if (!followRequest) {
    throw new ApiError("Connection request not found", 404);
  }

  await followRequest.deleteOne();

  res.json({
    success: true,
    message: action === "cancel" ? "Connection request canceled" : "Connection request rejected",
    data: { status: "none" },
  } as ApiResponse);
});

// Get pending connection requests sent TO current user (incoming)
export const getPendingRequests = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();
  const limit = Math.min(20, parseInt(req.query["limit"] as string) || 5);

  const pendingRequests = await Follow.find({
    following: currentUserId,
    status: "pending",
  })
    .populate("follower", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    message: "Pending requests fetched",
    data: pendingRequests.map((f) => ({
      _id: f._id,
      user: f.follower,
      createdAt: f.createdAt,
    })),
    count: pendingRequests.length,
  } as ApiResponse);
});

// Get connection requests sent BY current user (sent)
export const getSentRequests = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();

  const sentRequests = await Follow.find({
    follower: currentUserId,
    status: "pending",
  })
    .populate("following", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    message: "Sent requests fetched",
    data: sentRequests.map((f) => ({
      _id: f._id,
      user: f.following,
      createdAt: f.createdAt,
    })),
  } as ApiResponse);
});

// Check follow/connection status between current user and another user
export const checkFollowStatus = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();
  const userId = req.params.userId as string;

  // Check if current user follows target
  const sentFollow = await Follow.findOne({ 
    follower: currentUserId, 
    following: userId 
  });

  // Check if target follows current user
  const receivedFollow = await Follow.findOne({ 
    follower: userId, 
    following: currentUserId 
  });

  let status: "none" | "pending_sent" | "pending_received" | "connected" = "none";

  if (sentFollow?.status === "accepted" || receivedFollow?.status === "accepted") {
    status = "connected";
  } else if (sentFollow?.status === "pending") {
    status = "pending_sent";
  } else if (receivedFollow?.status === "pending") {
    status = "pending_received";
  }

  res.json({
    success: true,
    data: { status },
  } as ApiResponse);
});

// Unfollow/Remove connection
export const unfollow = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user!._id.toString();
  const userId = req.params.userId as string;

  // Find follow where current user is the follower (they sent the request)
  let follow = await Follow.findOne({
    follower: currentUserId,
    following: userId,
    status: "accepted",
  });

  let isFollower = true;

  // If not found, check if current user is the following (they received the request)
  if (!follow) {
    follow = await Follow.findOne({
      follower: userId,
      following: currentUserId,
      status: "accepted",
    });
    isFollower = false;
  }

  if (!follow) {
    throw new ApiError("Connection not found", 404);
  }

  // Update counts based on direction
  if (isFollower) {
    // Current user was following someone
    await Promise.all([
      follow.deleteOne(),
      User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } }),
    ]);
  } else {
    // Current user was being followed by someone (they accepted request)
    await Promise.all([
      follow.deleteOne(),
      User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(currentUserId, { $inc: { followersCount: -1 } }),
    ]);
  }

  res.json({
    success: true,
    message: "Unfollowed successfully",
    data: { status: "none" },
  } as ApiResponse);
});

// Get followers list (only accepted)
export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };
  const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
  const limit = Math.min(50, parseInt(req.query["limit"] as string) || 20);
  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    Follow.find({ following: userId, status: "accepted" })
      .populate("follower", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Follow.countDocuments({ following: userId, status: "accepted" }),
  ]);

  res.json({
    success: true,
    message: "Followers fetched",
    data: followers.map((f) => f.follower),
    total,
    page,
    limit,
    hasMore: skip + followers.length < total,
  } as ApiResponse);
});

// Get following list (only accepted)
export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };
  const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
  const limit = Math.min(50, parseInt(req.query["limit"] as string) || 20);
  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    Follow.find({ follower: userId, status: "accepted" })
      .populate("following", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Follow.countDocuments({ follower: userId, status: "accepted" }),
  ]);

  res.json({
    success: true,
    message: "Following fetched",
    data: following.map((f) => f.following),
    total,
    page,
    limit,
    hasMore: skip + following.length < total,
  } as ApiResponse);
});
