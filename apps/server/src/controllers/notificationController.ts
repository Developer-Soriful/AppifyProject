import { Request, Response } from "express";
import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "@appify/shared";
import { ApiError } from "../utils/ApiError.js";

// Get user's notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { page = "1", limit = "20", unreadOnly = "false" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query: Record<string, unknown> = { recipient: userId };
  if (unreadOnly === "true") {
    query.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate("sender", "firstName lastName avatar")
      .populate("relatedPost", "content")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  res.json({
    success: true,
    message: "Notifications fetched",
    data: notifications,
    total,
    unreadCount,
    page: pageNum,
    limit: limitNum,
    hasMore: skip + notifications.length < total,
  } as ApiResponse);
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  res.json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  } as ApiResponse);
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
  } as ApiResponse);
});

// Delete notification
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  res.json({
    success: true,
    message: "Notification deleted",
  } as ApiResponse);
});

// Helper function to create notification (used by other controllers)
export const createNotification = async (data: {
  recipient: string;
  sender: string;
  type: "like" | "comment" | "reply" | "follow" | "mention" | "share";
  title: string;
  message: string;
  relatedPost?: string;
  relatedComment?: string;
}) => {
  // Don't create notification if sender is recipient
  if (data.recipient === data.sender) return;

  await Notification.create({
    ...data,
    read: false,
  });
};

// Get unread count
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const count = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });

  res.json({
    success: true,
    data: { count },
  } as ApiResponse);
});
