"use client";

import React, { useState, useEffect } from "react";
import { IComment } from "@appify/shared";
import apiClient from "../lib/axios";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { getAvatarUrl } from "../lib/utils";

interface CommentSectionProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<IComment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data } = await apiClient.get(`/posts/${postId}/comments`);
      setComments(data.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data } = await apiClient.post(`/posts/${postId}/comments`, { content: content.trim() });
      setComments((prev) => [data.data.comment, ...prev]);
      setContent("");
      onCommentAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="_feed_inner_timeline_comment_area _padd_t24 border-top">
      <div className="_feed_inner_timeline_comment_box _mar_b24 mt-3">
        <form onSubmit={handleSubmit} className="d-flex w-100 px-3">
          <div className="_feed_inner_timeline_comment_image">
            <img 
              src={getAvatarUrl(user?.avatar, user?.firstName)} 
              alt="User" 
              className="rounded-circle" 
              style={{ width: "35px", height: "35px", objectFit: "cover" }} 
            />
          </div>
          <div className="grow ms-3 position-relative">

            <textarea 
              className="form-control _comment_input py-2 pe-5" 
              placeholder="Write a comment..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={1}
              style={{ resize: "none" }}
            />
            <button 
              type="submit" 
              disabled={loading || !content.trim()} 
              className="btn btn-sm btn-link position-absolute end-0 bottom-0 text-primary mb-1 me-1 text-decoration-none"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      <div className="_feed_inner_timeline_comment_list px-3">
        {fetching ? (
          <div className="text-center py-3 text-muted">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-3 text-muted">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="d-flex mb-4">
              <img 
                src={getAvatarUrl(comment.author.avatar, comment.author.firstName)} 
                alt="Author" 
                className="rounded-circle" 
                style={{ width: "35px", height: "35px", objectFit: "cover" }} 
              />
              <div className="ms-3 grow">

                <div className="p-2 rounded bg-light">
                  <h6 className="mb-1 small fw-bold">{comment.author.firstName} {comment.author.lastName}</h6>
                  <p className="mb-0 small text-dark" style={{ lineHeight: "1.4" }}>{comment.content}</p>
                </div>
                <div className="mt-1 x-small d-flex align-items-center opacity-75">
                  <span className="cursor-pointer me-3 text-primary-hover">Like</span>
                  <span className="cursor-pointer me-3 text-primary-hover">Reply</span>
                  <span className="text-muted">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
