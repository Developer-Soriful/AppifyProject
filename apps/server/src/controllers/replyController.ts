import { Request, Response } from "express";
import Reply from "../models/Reply.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addReply = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params["commentId"]);
  if (!comment) throw new ApiError("Comment not found", 404);

  if (!req.body.content?.trim()) throw new ApiError("Reply content is required", 400);

  const reply = await Reply.create({
    comment: comment._id,
    author: req.user!._id,
    content: req.body.content.trim(),
  });

  await Promise.all([
    Comment.findByIdAndUpdate(comment._id, { $inc: { repliesCount: 1 } }),
    reply.populate("author", "firstName lastName avatar"),
  ]);

  res.status(201).json({
    success: true,
    message: "Reply added",
    data: { reply: { ...reply.toObject(), isLiked: false } },
  });
});

export const getReplies = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query["page"]  as string) || 1);
  const limit = Math.min(50, parseInt(req.query["limit"] as string) || 20);
  const skip  = (page - 1) * limit;

  const [replies, total] = await Promise.all([
    Reply.find({ comment: req.params["commentId"] })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "firstName lastName avatar")
      .lean(),
    Reply.countDocuments({ comment: req.params["commentId"] }),
  ]);

  const replyIds  = replies.map((r) => r._id);
  const likedDocs = await Like.find({
    user: req.user!._id,
    targetId: { $in: replyIds },
    targetType: "Reply",
  })
    .select("targetId")
    .lean();

  const likedSet = new Set(likedDocs.map((l) => l.targetId.toString()));

  res.json({
    success: true,
    data: replies.map((r) => ({ ...r, isLiked: likedSet.has(r._id.toString()) })),
    total,
    page,
    limit,
    hasMore: skip + replies.length < total,
  });
});

export const deleteReply = asyncHandler(async (req: Request, res: Response) => {
  const reply = await Reply.findById(req.params["replyId"]);
  if (!reply) throw new ApiError("Reply not found", 404);

  if (reply.author.toString() !== req.user!._id.toString()) {
    throw new ApiError("Not authorized", 403);
  }

  await Promise.all([
    reply.deleteOne(),
    Comment.findByIdAndUpdate(reply.comment, { $inc: { repliesCount: -1 } }),
  ]);

  res.json({ success: true, message: "Reply deleted" });
});
