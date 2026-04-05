import { useState, useEffect } from "react";
import { IUser, IPost } from "@appify/shared";
import apiClient from "../lib/axios";

export const useProfile = (userId?: string) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const endpoint = userId ? `/users/${userId}` : "/users/me";
        const [userRes, postsRes] = await Promise.all([
          apiClient.get(endpoint),
          apiClient.get(`/posts?author=${userId || ""}`)
        ]);

        setUser(userRes.data.data);
        setPosts(postsRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  return { user, posts, loading, error, refreshPosts: () => {} };
};
