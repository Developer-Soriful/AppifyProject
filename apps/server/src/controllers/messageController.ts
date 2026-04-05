import { Request, Response } from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "@appify/shared";
import { ApiError } from "../utils/ApiError.js";

// Send message
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user!._id.toString();
  const { recipientId, content } = req.body;

  if (!content?.trim()) throw new ApiError("Message content is required", 400);
  if (!recipientId) throw new ApiError("Recipient is required", 400);
  if (recipientId === senderId) throw new ApiError("Cannot message yourself", 400);

  // Check if recipient exists
  const recipient = await User.findById(recipientId).select("firstName lastName avatar").lean();
  if (!recipient) throw new ApiError("Recipient not found", 404);

  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    content: content.trim(),
    read: false,
  });

  await message.populate("sender", "firstName lastName avatar");

  res.status(201).json({
    success: true,
    message: "Message sent",
    data: message,
  } as ApiResponse);
});

// Get conversation between two users
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { userId: otherUserId } = req.params;
  const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
  const limit = Math.min(50, parseInt(req.query["limit"] as string) || 20);
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "firstName lastName avatar")
    .populate("recipient", "firstName lastName avatar")
    .lean();

  const total = await Message.countDocuments({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  });

  // Mark messages as read
  await Message.updateMany(
    { sender: otherUserId, recipient: userId, read: false },
    { read: true }
  );

  res.json({
    success: true,
    message: "Messages fetched",
    data: messages.reverse(), // Oldest first
    total,
    page,
    limit,
    hasMore: skip + messages.length < total,
  } as ApiResponse);
});

// Get conversations list (recent chats)
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  // Get all unique users the current user has messaged or received messages from
  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .sort({ createdAt: -1 })
    .populate("sender", "firstName lastName avatar")
    .populate("recipient", "firstName lastName avatar")
    .lean();

  // Get unique conversation partners with latest message
  const conversations = new Map();
  
  messages.forEach((msg) => {
    const otherUser = msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
    const otherUserId = otherUser._id.toString();
    
    if (!conversations.has(otherUserId)) {
      conversations.set(otherUserId, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: msg.recipient._id.toString() === userId && !msg.read ? 1 : 0,
      });
    } else {
      const conv = conversations.get(otherUserId);
      if (msg.recipient._id.toString() === userId && !msg.read) {
        conv.unreadCount++;
      }
    }
  });

  res.json({
    success: true,
    message: "Conversations fetched",
    data: Array.from(conversations.values()),
  } as ApiResponse);
});

// Get unread message count
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  const count = await Message.countDocuments({
    recipient: userId,
    read: false,
  });

  res.json({
    success: true,
    data: { count },
  } as ApiResponse);
});
