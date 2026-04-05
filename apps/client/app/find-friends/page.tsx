"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IUserWithConnection, ConnectionStatus } from "@appify/shared";
import apiClient from "../../src/lib/axios";
import { getAvatarUrl } from "../../src/lib/utils";
import Link from "next/link";
import { useFollow } from "../../src/hooks/useFollow";
import toast from "react-hot-toast";
import { Search, UserPlus, UserCheck, Clock } from "lucide-react";

export default function FindFriendsPage() {
  const [users, setUsers] = useState<IUserWithConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  const { 
    loading: followLoading, 
    sendConnectionRequest, 
    cancelConnectionRequest, 
    unfollow 
  } = useFollow();
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async (pageNum: number, search: string = "", append: boolean = false) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/users/all?page=${pageNum}&limit=20&search=${encodeURIComponent(search)}`);
      const newUsers = data.data as IUserWithConnection[];
      
      if (append) {
        setUsers((prev) => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [searchQuery, fetchUsers]);

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, 300);
  };

  // Load more users
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, searchQuery, true);
  };

  // Handle connect
  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "pending_sent" as ConnectionStatus } : u
        )
      );
      toast.success("Connection request sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  // Handle cancel request
  const handleCancel = async (userId: string) => {
    try {
      await cancelConnectionRequest(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "none" as ConnectionStatus } : u
        )
      );
      toast.success("Request canceled");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  };

  // Handle unfollow
  const handleUnfollow = async (userId: string) => {
    try {
      await unfollow(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "none" as ConnectionStatus } : u
        )
      );
      toast.success("Unfollowed successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unfollow");
    }
  };

  // Get button config based on connection status
  const getButtonConfig = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return {
          text: "Connected",
          icon: <UserCheck size={18} />,
          className: "btn btn-success btn-sm d-flex align-items-center gap-2",
          onClick: handleUnfollow,
        };
      case "pending_sent":
        return {
          text: "Pending",
          icon: <Clock size={18} />,
          className: "btn btn-outline-warning btn-sm d-flex align-items-center gap-2",
          onClick: handleCancel,
        };
      case "pending_received":
        return {
          text: "Respond",
          icon: <UserPlus size={18} />,
          className: "btn btn-outline-primary btn-sm d-flex align-items-center gap-2",
          onClick: () => {},
          disabled: true,
        };
      default:
        return {
          text: "Connect",
          icon: <UserPlus size={18} />,
          className: "btn btn-primary btn-sm d-flex align-items-center gap-2",
          onClick: handleConnect,
        };
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Find Friends</h3>
          <p className="text-muted mb-0">Discover and connect with people</p>
        </div>
        <div className="text-muted">
          <small>{users.length} users found</small>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={20} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="row g-3">
        {users.map((user) => {
          const buttonConfig = getButtonConfig(user.connectionStatus);
          return (
            <div key={user._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body d-flex align-items-center gap-3">
                  <Link href={`/profile/${user._id}`} className="text-decoration-none">
                    <img
                      src={getAvatarUrl(user.avatar, user.firstName)}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="rounded-circle"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                  </Link>
                  
                  <div className="flex-grow-1 min-width-0">
                    <Link href={`/profile/${user._id}`} className="text-decoration-none text-dark">
                      <h6 className="mb-1 fw-semibold text-truncate">
                        {user.firstName} {user.lastName}
                      </h6>
                    </Link>
                    <div className="d-flex gap-3 text-muted small">
                      <span>{user.followersCount || 0} followers</span>
                      <span>{user.followingCount || 0} following</span>
                    </div>
                  </div>

                  <button
                    onClick={() => buttonConfig.onClick(user._id)}
                    disabled={followLoading[user._id] || buttonConfig.disabled}
                    className={buttonConfig.className}
                    style={{ minWidth: "110px", justifyContent: "center" }}
                  >
                    {followLoading[user._id] ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <>
                        {buttonConfig.icon}
                        {buttonConfig.text}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <Search size={48} className="text-muted" />
          </div>
          <h5 className="text-muted">No users found</h5>
          <p className="text-muted">Try adjusting your search terms</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading users...</p>
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && (
        <div className="text-center mt-4">
          <button className="btn btn-outline-primary" onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
