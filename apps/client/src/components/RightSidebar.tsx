"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import apiClient from "../lib/axios";
import { useFollow } from "../hooks/useFollow";
import { getAvatarUrl } from "../lib/utils";
import { IUser } from "@appify/shared";
import toast from "react-hot-toast";

// Connection status type
type ConnectionStatus = "none" | "pending" | "connected";

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendConnectionRequest, loading: followLoading } = useFollow();
  const [connectionStates, setConnectionStates] = useState<Record<string, ConnectionStatus>>({});

  // Fetch suggested users
  const fetchSuggested = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/users/suggested");
      setSuggestedUsers(data.data);
    } catch (err) {
      console.error("Failed to fetch suggested users", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggested();
  }, [fetchSuggested]);

  const handleFollow = async (userId: string) => {
    const currentStatus = connectionStates[userId] || "none";
    
    if (currentStatus === "pending" || currentStatus === "connected") {
      toast.success("Connection request already sent");
      return;
    }

    try {
      await sendConnectionRequest(userId);
      
      // Update local state to pending
      setConnectionStates((prev) => ({ ...prev, [userId]: "pending" }));
      toast.success("Connection request sent!");
      
      // Remove user from list after short delay (better UX)
      setTimeout(() => {
        setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));
      }, 1000);
      
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to send request";
      
      // Handle specific error cases
      if (message.includes("already sent")) {
        setConnectionStates((prev) => ({ ...prev, [userId]: "pending" }));
        toast.success("Request already sent");
      } else if (message.includes("Already connected")) {
        setConnectionStates((prev) => ({ ...prev, [userId]: "connected" }));
        toast.success("Already connected with this user");
        setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        toast.error(message);
      }
    }
  };

  const getButtonState = (userId: string) => {
    const status = connectionStates[userId] || "none";
    const isLoading = followLoading[userId];
    
    if (isLoading) return { text: "...", disabled: true, style: "loading" };
    
    switch (status) {
      case "pending":
        return { 
          text: "Pending", 
          disabled: true, 
          style: "pending" 
        };
      case "connected":
        return { 
          text: "Connected", 
          disabled: true, 
          style: "connected" 
        };
      default:
        return { 
          text: "Follow", 
          disabled: false, 
          style: "follow" 
        };
    }
  };

  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_event_content">
            <h4 className="_left_inner_event_title _title5">Events</h4>
            <Link href="/events" className="_left_inner_event_link">See all</Link>
          </div>
          
          <Link className="_left_inner_event_card_link" href="/events/1">
            <div className="_left_inner_event_card _mar_b16">
              <div className="_left_inner_event_card_iamge">
                <img src="/assets/images/feed_event1.png" alt="Image" className="_card_img" />
              </div>
              <div className="_left_inner_event_card_content">
                <div className="_left_inner_card_date">
                  <p className="_left_inner_card_date_para">10</p>
                  <p className="_left_inner_card_date_para1">Jul</p>
                </div>
                <div className="_left_inner_card_txt">
                  <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                </div>
              </div>
              <hr className="_underline" />
              <div className="_left_inner_event_bottom">
                <p className="_left_iner_event_bottom">17 People Going</p>
                <span className="_left_iner_event_bottom_link">Going</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <Link className="_left_inner_area_suggest_content_txt_link" href="/explore">See All</Link>
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-3 text-muted">
              <small>Loading suggestions...</small>
            </div>
          ) : suggestedUsers.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <small>No suggestions available</small>
            </div>
          ) : (
            suggestedUsers.map((user) => (
              <div key={user._id} className="_left_inner_area_suggest_info">
                <div className="_left_inner_area_suggest_info_box">
                  <div className="_left_inner_area_suggest_info_image">
                    <Link href={`/profile/${user._id}`}>
                      <img 
                        src={getAvatarUrl(user.avatar, user.firstName)} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="_info_img rounded-circle" 
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                    </Link>
                  </div>
                  <div className="_left_inner_area_suggest_info_txt">
                    <Link href={`/profile/${user._id}`}>
                      <h4 className="_left_inner_area_suggest_info_title">{user.firstName} {user.lastName}</h4>
                    </Link>
                    <p className="_left_inner_area_suggest_info_para">{user.followersCount || 0} followers</p>
                  </div>
                </div>
                <div className="_left_inner_area_suggest_info_link">
                  {(() => {
                    const buttonState = getButtonState(user._id);
                    const getButtonStyles = () => {
                      switch (buttonState.style) {
                        case "pending":
                          return { 
                            background: "#F5F5F5", 
                            color: "#666", 
                            border: "1px solid #D9D9D9",
                            cursor: "not-allowed"
                          };
                        case "connected":
                          return { 
                            background: "#E6F7FF", 
                            color: "#1890FF", 
                            border: "1px solid #1890FF",
                            cursor: "not-allowed"
                          };
                        case "loading":
                          return { 
                            background: "var(--color5)", 
                            color: "white", 
                            border: "1px solid var(--color5)",
                            opacity: 0.7
                          };
                        default:
                          return { 
                            background: "var(--color5)", 
                            color: "white", 
                            border: "1px solid var(--color5)"
                          };
                      }
                    };
                    
                    return (
                      <button 
                        className="_info_link btn btn-sm"
                        style={{ 
                          ...getButtonStyles(),
                          minWidth: "80px",
                          fontSize: "13px",
                          fontWeight: 500,
                          transition: "all 0.2s"
                        }}
                        onClick={() => handleFollow(user._id)}
                        disabled={buttonState.disabled}
                      >
                        {buttonState.text}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
