"use client";

import { useState } from "react";
import { IComment, IReply } from "@appify/shared";
import { formatDistanceToNow } from "date-fns";
import { getAvatarUrl } from "../lib/utils";
import apiClient from "../lib/axios";
import toast from "react-hot-toast";
import ReplyItem from "./ReplyItem";

interface CommentItemProps {
  comment: IComment;
  onDelete?: (commentId: string) => void;
  onReplyAdded?: () => void;
  currentUserId?: string;
}

export default function CommentItem({ comment, onDelete, onReplyAdded, currentUserId }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<IReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);

  const isOwner = currentUserId === comment.author._id;
  const hasReplies = comment.repliesCount && comment.repliesCount > 0;

  const handleLike = async () => {
    try {
      const { data } = await apiClient.post(`/likes/Comment/${comment._id}`);
      setIsLiked(data.data.isLiked);
      setLikesCount((prev) => (data.data.isLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/posts/${comment.post}/comments/${comment._id}`);
      onDelete?.(comment._id);
      toast.success("Comment deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchReplies = async (page = 1, append = false) => {
    if (!hasReplies && page === 1) return;
    
    setRepliesLoading(true);
    try {
      const { data } = await apiClient.get(
        `/comments/${comment._id}/replies?page=${page}&limit=5`
      );
      
      if (append) {
        setReplies((prev) => [...prev, ...data.data]);
      } else {
        setReplies(data.data);
      }
      
      setHasMoreReplies(data.hasMore);
      setRepliesPage(data.page);
    } catch (err) {
      console.error("Failed to fetch replies", err);
    } finally {
      setRepliesLoading(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      fetchReplies(1, false);
    }
    setShowReplies(!showReplies);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const { data } = await apiClient.post(`/comments/${comment._id}/replies`, {
        content: replyContent.trim(),
      });
      
      const newReply = data.data.reply;
      setReplies((prev) => [newReply, ...prev]);
      setReplyContent("");
      setShowReplyInput(false);
      setShowReplies(true);
      onReplyAdded?.();
      toast.success("Reply posted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyDelete = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r._id !== replyId));
  };

  const loadMoreReplies = () => {
    fetchReplies(repliesPage + 1, true);
  };

  return (
    <div className="d-flex mb-3">
      <img
        src={getAvatarUrl(comment.author.avatar, comment.author.firstName)}
        alt="Author"
        className="rounded-circle"
        style={{ width: "35px", height: "35px", objectFit: "cover" }}
      />
      <div className="ms-3 flex-grow-1">
        <div className="p-2 rounded bg-light position-relative">
          <div className="d-flex justify-content-between align-items-start">
            <h6 className="mb-1 small fw-bold">
              {comment.author.firstName} {comment.author.lastName}
            </h6>
            {isOwner && (
              <button
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete comment"
              >
                {isDeleting ? (
                  <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <p className="mb-0 small text-dark" style={{ lineHeight: "1.4" }}>
            {comment.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-1 d-flex align-items-center" style={{ fontSize: "13px" }}>
          <button
            className={`btn btn-link btn-sm p-0 text-decoration-none me-3 ${isLiked ? "text-primary fw-bold" : "text-muted"}`}
            onClick={handleLike}
          >
            {isLiked ? "Liked" : "Like"}
            {likesCount > 0 && <span className="ms-1">({likesCount})</span>}
          </button>
          <button
            className="btn btn-link btn-sm p-0 text-decoration-none me-3 text-muted"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            Reply
          </button>
          {hasReplies && (
            <button
              className="btn btn-link btn-sm p-0 text-decoration-none me-3 text-muted"
              onClick={toggleReplies}
            >
              {showReplies ? "Hide Replies" : `View Replies (${comment.repliesCount})`}
            </button>
          )}
          <span className="text-muted">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <form onSubmit={handleSubmitReply} className="mt-2 d-flex align-items-start">
            <div className="flex-grow-1 position-relative">
              <textarea
                className="form-control form-control-sm"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                style={{ resize: "none", fontSize: "13px" }}
                autoFocus
              />
              <div className="d-flex justify-content-end mt-1 gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted text-decoration-none"
                  onClick={() => setShowReplyInput(false)}
                  style={{ fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  disabled={!replyContent.trim() || isSubmittingReply}
                  style={{ fontSize: "12px" }}
                >
                  {isSubmittingReply ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-2">
            {repliesLoading && replies.length === 0 ? (
              <div className="text-center py-2">
                <span className="spinner-border spinner-border-sm" style={{ width: "16px", height: "16px" }} />
              </div>
            ) : (
              <>
                {replies.map((reply) => (
                  <ReplyItem
                    key={reply._id}
                    reply={reply}
                    onDelete={handleReplyDelete}
                    currentUserId={currentUserId}
                  />
                ))}
                {hasMoreReplies && (
                  <button
                    className="btn btn-link btn-sm p-0 ms-4 text-muted text-decoration-none"
                    onClick={loadMoreReplies}
                    disabled={repliesLoading}
                    style={{ fontSize: "12px" }}
                  >
                    {repliesLoading ? "Loading..." : "Load more replies"}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
