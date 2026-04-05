import { Request, Response } from "express";
import { CreatePostPayload, IPost, PaginatedResponse } from "@appify/shared";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { content, visibility = "public" } = req.body as CreatePostPayload;

  if (!content?.trim()) throw new ApiError("Post content is required", 400);

  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  const post = await Post.create({
    author: req.user!._id,
    content: content.trim(),
    image,
    visibility,
  });

  await post.populate("author", "firstName lastName avatar");

  res.status(201).json({
    success: true,
    message: "Post created",
    data: { post: { ...post.toObject(), isLiked: false } },
  });
});

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
  const limit = Math.min(20, parseInt(req.query["limit"] as string) || 10);
  const skip = (page - 1) * limit;

  const userId = req.user!._id;
  const authorId = req.query["author"] as string;
  const searchQuery = req.query["search"] as string;

  const filter: any = {
    $or: [{ visibility: "public" }, { author: userId, visibility: "private" }],
  };

  if (authorId) {
    filter.author = authorId;
  }

  if (searchQuery) {
    filter.content = { $regex: searchQuery, $options: "i" };
  }



  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "firstName lastName avatar")
      .lean(),
    Post.countDocuments(filter),
  ]);

  const postIds = posts.map((p) => p._id);
  const likedDocs = await Like.find({
    user: userId,
    targetId: { $in: postIds },
    targetType: "Post",
  })
    .select("targetId")
    .lean();

  const likedSet = new Set(likedDocs.map((l) => l.targetId.toString()));

  res.json({
    success: true,
    data: (posts as any).map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      author: {
        ...p.author,
        _id: p.author._id.toString(),
      },
      isLiked: likedSet.has(p._id.toString()),
    })) as IPost[],
    total,
    page,
    limit,
    hasMore: skip + posts.length < total,
  } as PaginatedResponse<IPost>);
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params["id"])
    .populate("author", "firstName lastName avatar")
    .lean();

  if (!post) throw new ApiError("Post not found", 404);

  const isOwner = post.author._id.toString() === req.user!._id.toString();
  if (post.visibility === "private" && !isOwner) {
    throw new ApiError("This post is private", 403);
  }

  const liked = await Like.exists({
    user: req.user!._id,
    targetId: post._id,
    targetType: "Post",
  });

  res.json({ success: true, data: { ...post, isLiked: !!liked } });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params["id"]);
  if (!post) throw new ApiError("Post not found", 404);

  if (post.author.toString() !== req.user!._id.toString()) {
    throw new ApiError("Not authorized to edit this post", 403);
  }

  if (req.body.content !== undefined) post.content = req.body.content;
  if (req.body.visibility !== undefined) post.visibility = req.body.visibility;
  if (req.file) post.image = `/uploads/${req.file.filename}`;

  await post.save();
  await post.populate("author", "firstName lastName avatar");

  res.json({ success: true, message: "Post updated", data: { post } });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params["id"]);
  if (!post) throw new ApiError("Post not found", 404);

  if (post.author.toString() !== req.user!._id.toString()) {
    throw new ApiError("Not authorized to delete this post", 403);
  }

  await post.deleteOne();
  res.json({ success: true, message: "Post deleted" });
});

export const sharePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findByIdAndUpdate(req.params["id"], { $inc: { sharesCount: 1 } }, { new: true });
  if (!post) throw new ApiError("Post not found", 404);

  res.json({
    success: true,
    message: "Post shared successfully",
    data: { sharesCount: post.sharesCount },
  });
});

