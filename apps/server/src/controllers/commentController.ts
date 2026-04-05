import { Request, Response } from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "./notificationController.js";

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const post = await Post.findById(req.params["postId"]);
  if (!post) throw new ApiError("Post not found", 404);

  const isOwner = post.author.toString() === userId;
  if (post.visibility === "private" && !isOwner) {
    throw new ApiError("Cannot comment on a private post", 403);
  }

  if (!req.body.content?.trim()) throw new ApiError("Comment content is required", 400);

  const comment = await Comment.create({
    post: post._id,
    author: req.user!._id,
    content: req.body.content.trim(),
  });

  await Promise.all([
    Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } }),
    comment.populate("author", "firstName lastName avatar"),
  ]);

  // Create notification for post author
  const postAuthorId = post.author.toString();
  if (postAuthorId !== userId) {
    const user = await User.findById(userId).select("firstName lastName").lean();
    await createNotification({
      recipient: postAuthorId,
      sender: userId,
      type: "comment",
      title: "New Comment",
      message: `${user?.firstName} ${user?.lastName} commented on your post`,
      relatedPost: post._id.toString(),
      relatedComment: comment._id.toString(),
    });
  }

  res.status(201).json({
    success: true,
    message: "Comment added",
    data: { comment: { ...comment.toObject(), isLiked: false } },
  });
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query["page"]  as string) || 1);
  const limit = Math.min(50, parseInt(req.query["limit"] as string) || 20);
  const skip  = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ post: req.params["postId"] })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "firstName lastName avatar")
      .lean(),
    Comment.countDocuments({ post: req.params["postId"] }),
  ]);

  const commentIds = comments.map((c) => c._id);
  const likedDocs  = await Like.find({
    user: req.user!._id,
    targetId: { $in: commentIds },
    targetType: "Comment",
  })
    .select("targetId")
    .lean();

  const likedSet = new Set(likedDocs.map((l) => l.targetId.toString()));

  res.json({
    success: true,
    data: comments.map((c) => ({ ...c, isLiked: likedSet.has(c._id.toString()) })),
    total,
    page,
    limit,
    hasMore: skip + comments.length < total,
  });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params["commentId"]);
  if (!comment) throw new ApiError("Comment not found", 404);

  if (comment.author.toString() !== req.user!._id.toString()) {
    throw new ApiError("Not authorized", 403);
  }

  await Promise.all([
    comment.deleteOne(),
    Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } }),
  ]);

  res.json({ success: true, message: "Comment deleted" });
});
