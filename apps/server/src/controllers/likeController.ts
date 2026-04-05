import { Request, Response } from "express";
import Like, { LikeTarget } from "../models/Like.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "./notificationController.js";

const VALID_TARGETS: LikeTarget[] = ["Post", "Comment", "Reply"];

// Map to avoid if-else chains
const targetModelMap = { Post, Comment, Reply } as const;

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { targetType, targetId } = req.params as { targetType: LikeTarget; targetId: string };
  const userId = req.user!._id.toString();

  if (!VALID_TARGETS.includes(targetType)) {
    throw new ApiError("Invalid target type", 400);
  }

  const Model = targetModelMap[targetType];
  const target = await Model.findById(targetId).lean();
  if (!target) throw new ApiError(`${targetType} not found`, 404);

  const existing = await Like.findOne({ user: req.user!._id, targetId, targetType });

  if (existing) {
    await Promise.all([
      existing.deleteOne(),
      Model.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } }),
    ]);
    return res.json({ success: true, message: "Like removed", data: { isLiked: false } });
  }

  await Promise.all([
    Like.create({ user: req.user!._id, targetId, targetType }),
    Model.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } }),
  ]);

  // Create notification
  const recipientId = (target as { author?: string; author?: { _id?: string } }).author?.toString?.() || (target as { author?: string }).author;
  if (recipientId && recipientId !== userId) {
    const user = await User.findById(userId).select("firstName lastName").lean();
    await createNotification({
      recipient: recipientId,
      sender: userId,
      type: "like",
      title: "New Like",
      message: `${user?.firstName} ${user?.lastName} liked your ${targetType.toLowerCase()}`,
      relatedPost: targetType === "Post" ? targetId : undefined,
      relatedComment: targetType === "Comment" ? targetId : undefined,
    });
  }

  res.json({ success: true, message: "Liked", data: { isLiked: true } });
});

export const getLikes = asyncHandler(async (req: Request, res: Response) => {
  const { targetType, targetId } = req.params as { targetType: LikeTarget; targetId: string };

  if (!VALID_TARGETS.includes(targetType)) {
    throw new ApiError("Invalid target type", 400);
  }

  const likes = await Like.find({ targetId, targetType })
    .populate("user", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({
    success: true,
    data: likes.map((l) => l.user),
  });
});
