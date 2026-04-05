import { useState, useCallback } from "react";
import { IPost, PaginatedResponse } from "@appify/shared";
import apiClient from "../lib/axios";

export const usePosts = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number = 1, search: string = "", author: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      if (search) params.append("search", search);
      if (author) params.append("author", author);

      const { data } = await apiClient.get<PaginatedResponse<IPost>>(`/posts?${params.toString()}`);
      if (pageNum === 1) {
        setPosts(data.data);
      } else {
        setPosts((prev) => [...prev, ...data.data]);
      }
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {

      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPosts = () => fetchPosts(1);

  const loadMore = useCallback(async (search: string = "", author: string = "") => {
    if (!hasMore || loading) return;
    await fetchPosts(page + 1, search, author);
  }, [hasMore, loading, page, fetchPosts]);

  return { posts, loading, total, page, hasMore, fetchPosts, refreshPosts, loadMore };
};
