import { useState, useCallback } from "react";
import apiClient from "../lib/axios";
import { IUser } from "@appify/shared";

export type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "connected";

interface PendingRequest {
  _id: string;
  user: IUser;
  createdAt: string;
}

export const useFollow = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Send connection request
  const sendConnectionRequest = useCallback(async (userId: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await apiClient.post(`/follows/request/${userId}`);
      return data.data.status as "pending";
    } catch (err) {
      console.error("Failed to send connection request", err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  }, []);

  // Accept connection request
  const acceptConnectionRequest = useCallback(async (userId: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await apiClient.post(`/follows/accept/${userId}`);
      return data.data.status as "accepted";
    } catch (err) {
      console.error("Failed to accept connection request", err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  }, []);

  // Reject connection request
  const rejectConnectionRequest = useCallback(async (userId: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await apiClient.post(`/follows/reject/${userId}`);
      return data.data.status as "none";
    } catch (err) {
      console.error("Failed to reject connection request", err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  }, []);

  // Cancel sent connection request
  const cancelConnectionRequest = useCallback(async (userId: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await apiClient.post(`/follows/reject/${userId}?action=cancel`);
      return data.data.status as "none";
    } catch (err) {
      console.error("Failed to cancel connection request", err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  }, []);

  // Unfollow / Remove connection
  const unfollow = useCallback(async (userId: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await apiClient.delete(`/follows/unfollow/${userId}`);
      return data.data.status as "none";
    } catch (err) {
      console.error("Failed to unfollow", err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  }, []);

  // Get pending connection requests (incoming)
  const getPendingRequests = useCallback(async (limit = 5) => {
    try {
      const { data } = await apiClient.get(`/follows/pending?limit=${limit}`);
      return {
        requests: data.data as PendingRequest[],
        count: data.count as number,
      };
    } catch (err) {
      console.error("Failed to fetch pending requests", err);
      return { requests: [], count: 0 };
    }
  }, []);

  // Get sent connection requests
  const getSentRequests = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/follows/sent`);
      return {
        requests: data.data as PendingRequest[],
      };
    } catch (err) {
      console.error("Failed to fetch sent requests", err);
      return { requests: [] };
    }
  }, []);

  // Check connection status
  const checkFollowStatus = useCallback(async (userId: string) => {
    try {
      const { data } = await apiClient.get(`/follows/status/${userId}`);
      return data.data.status as ConnectionStatus;
    } catch (err) {
      console.error("Failed to check follow status", err);
      return "none" as ConnectionStatus;
    }
  }, []);

  // Get followers list
  const getFollowers = useCallback(async (userId: string, page = 1, limit = 20) => {
    try {
      const { data } = await apiClient.get(`/follows/followers/${userId}?page=${page}&limit=${limit}`);
      return {
        users: data.data as IUser[],
        total: data.total as number,
        hasMore: data.hasMore as boolean,
      };
    } catch (err) {
      console.error("Failed to fetch followers", err);
      return { users: [], total: 0, hasMore: false };
    }
  }, []);

  // Get following list
  const getFollowing = useCallback(async (userId: string, page = 1, limit = 20) => {
    try {
      const { data } = await apiClient.get(`/follows/following/${userId}?page=${page}&limit=${limit}`);
      return {
        users: data.data as IUser[],
        total: data.total as number,
        hasMore: data.hasMore as boolean,
      };
    } catch (err) {
      console.error("Failed to fetch following", err);
      return { users: [], total: 0, hasMore: false };
    }
  }, []);

  return {
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    unfollow,
    getPendingRequests,
    getSentRequests,
    checkFollowStatus,
    getFollowers,
    getFollowing,
  };
};
