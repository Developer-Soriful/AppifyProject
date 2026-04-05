"use client";

import { useState, useEffect, useCallback } from "react";
import { IComment } from "@appify/shared";
import apiClient from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { getAvatarUrl } from "../lib/utils";
import CommentItem from "./CommentItem";

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
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch comments with pagination
  const fetchComments = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    
    setFetching(true);
    try {
      const { data } = await apiClient.get(
        `/posts/${postId}/comments?page=${currentPage}&limit=${limit}`
      );
      
      if (reset) {
        setComments(data.data);
        setPage(1);
      } else {
        setComments((prev) => [...prev, ...data.data]);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setFetching(false);
    }
  }, [postId, page]);

  // Initial fetch
  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  // Submit new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data } = await apiClient.post(`/posts/${postId}/comments`, { 
        content: content.trim() 
      });
      
      setComments((prev) => [data.data.comment, ...prev]);
      setContent("");
      onCommentAdded();
      toast.success("Comment posted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  // Handle comment deletion
  const handleCommentDelete = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  }, []);

  // Handle reply added (refresh post comment count)
  const handleReplyAdded = useCallback(() => {
    onCommentAdded();
  }, [onCommentAdded]);

  // Load more comments
  const loadMore = async () => {
    if (fetching || !hasMore) return;
    setPage((prev) => prev + 1);
    await fetchComments();
  };

  return (
    <div className="_feed_inner_timeline_comment_area _padd_t24 border-top">
      {/* Comment Input */}
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
          <div className="flex-grow-1 ms-3 position-relative">
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
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="_feed_inner_timeline_comment_list px-3">
        {fetching && comments.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <span className="spinner-border spinner-border-sm me-2" />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-3 text-muted">No comments yet. Be the first to comment!</div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onDelete={handleCommentDelete}
                onReplyAdded={handleReplyAdded}
                currentUserId={user?._id}
              />
            ))}
            
            {/* Load More Comments */}
            {hasMore && (
              <div className="text-center mt-3">
                <button
                  className="btn btn-link text-muted text-decoration-none"
                  onClick={loadMore}
                  disabled={fetching}
                >
                  {fetching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Loading...
                    </>
                  ) : (
                    "Load more comments"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
