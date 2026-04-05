"use client";

import { useState } from "react";
import { IReply } from "@appify/shared";
import { formatDistanceToNow } from "date-fns";
import { getAvatarUrl } from "../lib/utils";
import apiClient from "../lib/axios";
import toast from "react-hot-toast";

interface ReplyItemProps {
  reply: IReply;
  onDelete?: (replyId: string) => void;
  currentUserId?: string;
}

export default function ReplyItem({ reply, onDelete, currentUserId }: ReplyItemProps) {
  const [isLiked, setIsLiked] = useState(reply.isLiked || false);
  const [likesCount, setLikesCount] = useState(reply.likesCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = currentUserId === reply.author._id;

  const handleLike = async () => {
    try {
      const { data } = await apiClient.post(`/likes/Reply/${reply._id}`);
      setIsLiked(data.data.isLiked);
      setLikesCount((prev) => (data.data.isLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error("Failed to like reply", err);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/comments/${reply.comment}/replies/${reply._id}`);
      onDelete?.(reply._id);
      toast.success("Reply deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete reply");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="d-flex ms-4 mt-2 ps-3 border-start" style={{ borderColor: "#e0e0e0" }}>
      <img
        src={getAvatarUrl(reply.author.avatar, reply.author.firstName)}
        alt="Author"
        className="rounded-circle"
        style={{ width: "28px", height: "28px", objectFit: "cover" }}
      />
      <div className="ms-2 flex-grow-1">
        <div className="p-2 rounded bg-light" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="d-flex justify-content-between align-items-start">
            <h6 className="mb-1 small fw-bold" style={{ fontSize: "13px" }}>
              {reply.author.firstName} {reply.author.lastName}
            </h6>
            {isOwner && (
              <div className="dropdown">
                <button
                  className="btn btn-link btn-sm p-0 text-muted"
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  style={{ fontSize: "12px" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                {showDeleteConfirm && (
                  <div className="position-absolute bg-white rounded shadow-sm p-2" style={{ zIndex: 100, right: 0 }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{ fontSize: "12px" }}
                    >
                      {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mb-0 small text-dark" style={{ lineHeight: "1.4", fontSize: "13px" }}>
            {reply.content}
          </p>
        </div>
        <div className="mt-1 d-flex align-items-center" style={{ fontSize: "12px" }}>
          <button
            className={`btn btn-link btn-sm p-0 text-decoration-none me-3 ${isLiked ? "text-primary fw-bold" : "text-muted"}`}
            onClick={handleLike}
            style={{ fontSize: "12px" }}
          >
            {isLiked ? "Liked" : "Like"}
            {likesCount > 0 && <span className="ms-1">({likesCount})</span>}
          </button>
          <span className="text-muted">{formatDistanceToNow(new Date(reply.createdAt))} ago</span>
        </div>
      </div>
    </div>
  );
}
