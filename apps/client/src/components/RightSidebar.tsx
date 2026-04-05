"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "../lib/axios";
import { useFollow } from "../hooks/useFollow";
import { getAvatarUrl } from "../lib/utils";
import { IUser } from "@appify/shared";
import toast from "react-hot-toast";

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFollow, loading: followLoading } = useFollow();
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const { data } = await apiClient.get("/users/suggested");
        setSuggestedUsers(data.data);
      } catch (err) {
        console.error("Failed to fetch suggested users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  const handleFollow = async (userId: string) => {
    const isCurrentlyFollowing = followStates[userId] || false;
    try {
      const newStatus = await toggleFollow(userId, isCurrentlyFollowing);
      setFollowStates((prev) => ({ ...prev, [userId]: newStatus }));
      toast.success(newStatus ? "Connection request sent" : "Unfollowed successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update follow status");
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
                  <button 
                    className="_info_link btn btn-sm"
                    style={{ 
                      background: followStates[user._id] ? "transparent" : "var(--color5)",
                      color: followStates[user._id] ? "var(--color5)" : "white",
                      border: "1px solid var(--color5)",
                      minWidth: "70px"
                    }}
                    onClick={() => handleFollow(user._id)}
                    disabled={followLoading[user._id]}
                  >
                    {followLoading[user._id] 
                      ? "..." 
                      : followStates[user._id] 
                        ? "Following" 
                        : "Follow"
                    }
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
