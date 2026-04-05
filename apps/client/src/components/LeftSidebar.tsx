"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "../lib/axios";
import { IUser } from "@appify/shared";
import { getAvatarUrl } from "../lib/utils";
import { useFollow, ConnectionStatus } from "../hooks/useFollow";
import toast from "react-hot-toast";



interface PendingRequest {
  _id: string;
  user: IUser;
  createdAt: string;
}

interface SuggestedUser extends IUser {
  connectionStatus?: ConnectionStatus;
}

export default function LeftSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const {
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    unfollow,
    checkFollowStatus,
    getPendingRequests,
  } = useFollow();

  // Fetch suggested users and check their connection status
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const { data } = await apiClient.get("/users/suggested");
        const users = data.data as IUser[];

        // Check connection status for each user
        const usersWithStatus = await Promise.all(
          users.map(async (user) => {
            const status = await checkFollowStatus(user._id);
            return { ...user, connectionStatus: status };
          })
        );

        setSuggestedUsers(usersWithStatus);
      } catch (err) {
        console.error("Failed to fetch suggested users", err);
      } finally {
        setLoadingSuggested(false);
      }
    };
    fetchSuggested();
  }, [checkFollowStatus]);

  // Fetch pending connection requests
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { requests } = await getPendingRequests(5);
        setPendingRequests(requests);
      } catch (err) {
        console.error("Failed to fetch pending requests", err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchPending();
  }, [getPendingRequests]);

  // Handle sending connection request
  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "pending_sent" as ConnectionStatus } : u
        )
      );
      toast.success("Connection request sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  // Handle canceling sent request
  const handleCancel = async (userId: string) => {
    try {
      await cancelConnectionRequest(userId);
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "none" as ConnectionStatus } : u
        )
      );
      toast.success("Request canceled");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  };

  // Handle accepting incoming request
  const handleAccept = async (userId: string) => {
    try {
      await acceptConnectionRequest(userId);
      // Remove from pending requests
      setPendingRequests((prev) => prev.filter((r) => r.user._id !== userId));
      // Update suggested users if present
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "connected" as ConnectionStatus } : u
        )
      );
      toast.success("Connection request accepted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  // Handle rejecting incoming request
  const handleReject = async (userId: string) => {
    try {
      await rejectConnectionRequest(userId);
      // Remove from pending requests
      setPendingRequests((prev) => prev.filter((r) => r.user._id !== userId));
      // Update suggested users if present
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, connectionStatus: "none" as ConnectionStatus } : u
        )
      );
      toast.success("Connection request rejected");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  // Handle unfollowing a user
  const handleUnfollow = async (userId: string) => {
    try {
      await unfollow(userId);
      setSuggestedUsers((prev) =>
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
  const getButtonConfig = (status: ConnectionStatus | undefined) => {
    switch (status) {
      case "connected":
        return { text: "Followed", className: "_info_link _friends_btn_link", onClick: handleUnfollow };
      case "pending_sent":
        return { text: "Pending", className: "_info_link", onClick: handleCancel };
      case "pending_received":
        return { text: "Respond", className: "_info_link _friends_btn_link1", disabled: true };
      default:
        return { text: "Connect", className: "_info_link", onClick: handleConnect };
    }
  };

  return (
    <div className="_layout_left_sidebar_wrap">
      {/* Connection Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="_layout_left_sidebar_inner _mar_b16">
          <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
            <div className="_left_inner_area_suggest_content _mar_b24">
              <h4 className="_left_inner_area_suggest_content_title _title5">
                Connection Requests ({pendingRequests.length})
              </h4>
              <span className="_left_inner_area_suggest_content_txt">
                <Link className="_left_inner_area_suggest_content_txt_link" href="/requests">
                  See All
                </Link>
              </span>
            </div>

            {loadingRequests ? (
              <p className="text-muted small px-3">Loading...</p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request._id} className="_left_inner_area_frinds_info _mar_b16">
                  <div className="_left_inner_area_frinds_info_box">
                    <div className="_left_inner_area_frinds_info_box_image">
                      <Link href={`/profile/${request.user._id}`}>
                        <img
                          src={getAvatarUrl(request.user.avatar, request.user.firstName)}
                          alt="User"
                          className="_friends_info_img"
                        />
                      </Link>
                    </div>

                    <div className="_left_inner_area_frinds_info_box_txt">
                      <Link href={`/profile/${request.user._id}`}>
                        <h4 className="_left_inner_area_frinds_info_box_title">
                          {request.user.firstName} {request.user.lastName}
                        </h4>
                      </Link>
                      <p className="_left_inner_area_frinds_info_box_para">Wants to connect</p>
                    </div>
                  </div>

                  <div className="_left_inner_area_frinds_info_link _d_flex _gap_8 _mt_8">
                    <button
                      onClick={() => handleAccept(request.user._id)}
                      disabled={loading[request.user._id]}
                      className="_friends_info_link _friends_btn_link _flex_1"
                    >
                      {loading[request.user._id] ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleReject(request.user._id)}
                      disabled={loading[request.user._id]}
                      className="_friends_info_link _friends_btn_link1 _flex_1"
                    >
                      {loading[request.user._id] ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
          <ul className="_left_inner_area_explore_list">
            <li className="_left_inner_area_explore_item _explore_item">
              <Link href="/feed" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z" />
                </svg> Learning
              </Link> 
              <span className="_left_inner_area_explore_link_txt">New</span>
            </li>
            <li className="_left_inner_area_explore_item">
              <Link href="/insights" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M14.96 2c3.101 0 5.159 2.417 5.159 5.893v8.214c0 3.476-2.058 5.893-5.16 5.893H6.989c-3.101 0-5.159-2.417-5.159-5.893V7.893C1.83 4.42 3.892 2 6.988 2h7.972zm0 1.395H6.988c-2.37 0-3.883 1.774-3.883 4.498v8.214c0 2.727 1.507 4.498 3.883 4.498h7.972c2.375 0 3.883-1.77 3.883-4.498V7.893c0-2.727-1.508-4.498-3.883-4.498zM7.036 9.63c.323 0 .59.263.633.604l.005.094v6.382c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-6.382c0-.385.286-.697.638-.697zm3.97-3.053c.323 0 .59.262.632.603l.006.095v9.435c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094V7.274c0-.386.286-.698.638-.698zm3.905 6.426c.323 0 .59.262.632.603l.006.094v3.01c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-3.01c0-.385.286-.697.638-.697z" />
                </svg> Insights
              </Link>
            </li>
            <li className="_left_inner_area_explore_item">
              <Link href="/find-friends" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zm0 1.5l-.308.002c-3.645.038-5.523.764-5.523 2.157 0 1.44 1.99 2.18 5.831 2.18 3.847 0 5.832-.728 5.832-2.159 0-1.44-1.99-2.18-5.832-2.18zm8.53-8.037c.347 0 .634.282.679.648l.006.102v1.255h1.185c.38 0 .686.336.686.75 0 .38-.258.694-.593.743l-.093.007h-1.185v1.255c0 .414-.307.75-.686.75-.347 0-.634-.282-.68-.648l-.005-.102-.001-1.255h-1.183c-.379 0-.686-.336-.686-.75 0 .38.258.694.593-.743l.093-.007h1.183V8.669c0-.414.308-.75.686-.75zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2zm0 1.5c-1.94 0-3.491 1.697-3.491 3.819 0 2.12 1.552 3.818 3.491 3.818 1.94 0 3.492-1.697 3.492-3.818 0-2.122-1.551-3.818-3.492-3.818z" />
                </svg> Find friends
              </Link>
            </li>
            <li className="_left_inner_area_explore_item">
              <Link href="/bookmarks" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46zm0 1.448h-5.46c-2.191 0-3.295.948-3.295 2.986V20.32c0 .044.01.088 0 .07l.034.063c.059.09.17.12.247.074l5.11-3.138c.38-.23.84-.23 1.222.001l5.124 3.128a.252.252 0 00.114.035.188.188 0 00.14-.064.236.236 0 00.058-.157V6.258c0-1.9-1.132-2.81-3.294-2.81zm.386 4.869c.357 0 .646.324.646.723 0 .367-.243.67-.559.718l-.087.006H7.81c-.357 0-.646-.324-.646-.723 0-.367.243-.67.558-.718l.088-.006h6.28z" />
                </svg> Bookmarks
              </Link>
            </li>
            <li className="_left_inner_area_explore_item">
              <Link href="/hidden" className="_left_inner_area_explore_link">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                </svg> Hidden Posts
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <Link className="_left_inner_area_suggest_content_txt_link" href="/find-friends">See All</Link>
            </span>
          </div>
          
          {loadingSuggested ? (
            <p className="text-muted small px-3">Loading...</p>
          ) : suggestedUsers.length === 0 ? (
            <p className="text-muted small px-3">No suggestions available</p>
          ) : (
            suggestedUsers.map((sUser) => {
              const buttonConfig = getButtonConfig(sUser.connectionStatus);
              return (
                <div key={sUser._id} className="_left_inner_area_suggest_info">
                  <div className="_left_inner_area_suggest_info_box">
                    <div className="_left_inner_area_suggest_info_image">
                      <Link href={`/profile/${sUser._id}`}>
                        <img
                          src={getAvatarUrl(sUser.avatar, sUser.firstName)}
                          alt="User"
                          className="_info_img"
                        />
                      </Link>
                    </div>

                    <div className="_left_inner_area_suggest_info_txt">
                      <Link href={`/profile/${sUser._id}`}>
                        <h4 className="_left_inner_area_suggest_info_title">
                          {sUser.firstName} {sUser.lastName}
                        </h4>
                      </Link>
                      <p className="_left_inner_area_suggest_info_para">New User</p>
                    </div>
                  </div>
                  <div className="_left_inner_area_suggest_info_link">
                    <button
                      onClick={() => buttonConfig.onClick?.(sUser._id)}
                      disabled={loading[sUser._id] || buttonConfig.disabled}
                      className={buttonConfig.className}
                    >
                      {loading[sUser._id] ? "..." : buttonConfig.text}
                    </button>
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
}
