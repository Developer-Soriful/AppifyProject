import { useState, useCallback } from "react";
import { IReply } from "@appify/shared";
import apiClient from "../lib/axios";

interface UseRepliesReturn {
  replies: IReply[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  total: number;
  fetchReplies: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  addReply: (content: string) => Promise<IReply | null>;
  deleteReply: (replyId: string) => Promise<void>;
  toggleReplyLike: (replyId: string, isLiked: boolean) => Promise<void>;
}

export const useReplies = (commentId: string): UseRepliesReturn => {
  const [replies, setReplies] = useState<IReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchReplies = useCallback(async (reset = false) => {
    if (!commentId) return;
    
    const currentPage = reset ? 1 : page;
    
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/comments/${commentId}/replies?page=${currentPage}&limit=${limit}`
      );
      
      if (reset) {
        setReplies(data.data);
        setPage(1);
      } else {
        setReplies((prev) => [...prev, ...data.data]);
      }
      
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to fetch replies", err);
    } finally {
      setLoading(false);
    }
  }, [commentId, page]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setPage((prev) => prev + 1);
    await fetchReplies();
  }, [loading, hasMore, fetchReplies]);

  const addReply = useCallback(async (content: string): Promise<IReply | null> => {
    if (!commentId || !content.trim()) return null;
    
    try {
      const { data } = await apiClient.post(`/comments/${commentId}/replies`, {
        content: content.trim(),
      });
      
      const newReply = data.data.reply;
      setReplies((prev) => [newReply, ...prev]);
      setTotal((prev) => prev + 1);
      return newReply;
    } catch (err) {
      console.error("Failed to add reply", err);
      return null;
    }
  }, [commentId]);

  const deleteReply = useCallback(async (replyId: string) => {
    try {
      await apiClient.delete(`/comments/${commentId}/replies/${replyId}`);
      setReplies((prev) => prev.filter((r) => r._id !== replyId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to delete reply", err);
      throw err;
    }
  }, [commentId]);

  const toggleReplyLike = useCallback(async (replyId: string, isLiked: boolean) => {
    try {
      const { data } = await apiClient.post(`/likes/Reply/${replyId}`);
      
      setReplies((prev) =>
        prev.map((reply) =>
          reply._id === replyId
            ? {
                ...reply,
                isLiked: data.data.isLiked,
                likesCount: data.data.isLiked 
                  ? (reply.likesCount || 0) + 1 
                  : Math.max(0, (reply.likesCount || 0) - 1),
              }
            : reply
        )
      );
    } catch (err) {
      console.error("Failed to toggle reply like", err);
    }
  }, []);

  return {
    replies,
    loading,
    hasMore,
    page,
    total,
    fetchReplies,
    loadMore,
    addReply,
    deleteReply,
    toggleReplyLike,
  };
};

export default useReplies;
