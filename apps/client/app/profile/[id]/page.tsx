"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../src/components/Navbar";
import LeftSidebar from "../../../src/components/LeftSidebar";
import RightSidebar from "../../../src/components/RightSidebar";
import PostCard from "../../../src/components/PostCard";
import { useProfile } from "../../../src/hooks/useProfile";
import { useFollow } from "../../../src/hooks/useFollow";
import { useAuth } from "../../../src/context/AuthContext";
import { getAvatarUrl } from "../../../src/lib/utils";
import toast from "react-hot-toast";


export default function UserProfilePage() {
  const { id } = useParams() as { id: string };
  const { user: authUser } = useAuth();
  const { user, posts, loading, error } = useProfile(id);
  const { toggleFollow, checkFollowStatus, loading: followLoading } = useFollow();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (user) {
      setFollowersCount(user.followersCount || 0);
    }
  }, [user]);

  useEffect(() => {
    if (id && authUser && id !== authUser._id) {
      checkFollowStatus(id).then(setIsFollowing);
    }
  }, [id, authUser, checkFollowStatus]);

  const handleFollow = async () => {
    try {
      const newStatus = await toggleFollow(id);
      setIsFollowing(newStatus);
      setFollowersCount((prev) => newStatus ? prev + 1 : prev - 1);
      toast.success(newStatus ? "Followed successfully" : "Unfollowed successfully");
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  const isOwnProfile = authUser?._id === id;

  if (loading) return <div className="text-center py-5">Loading profile...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  return (
    <main className="_layout_main_wrapper">
      <Navbar />
      <div className="_layout_main_content _padd_t32">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-12">
              <LeftSidebar />
            </div>
            
            <div className="col-xl-6 col-lg-6 col-md-12">
              {/* Profile Header */}
              <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 _mar_b16 text-center">
                <img 
                  src={getAvatarUrl(user?.avatar, user?.firstName)} 
                  alt="Avatar" 
                  className="rounded-circle border mb-3" 
                  style={{ width: "120px", height: "120px", objectFit: "cover" }} 
                />

                <h3 className="_title4">{user?.firstName} {user?.lastName}</h3>
                <p className="text-muted">{user?.email}</p>
                
                {/* Followers/Following Count */}
                <div className="d-flex justify-content-center gap-4 mb-3">
                  <div className="text-center">
                    <strong className="d-block">{followersCount}</strong>
                    <small className="text-muted">Followers</small>
                  </div>
                  <div className="text-center">
                    <strong className="d-block">{user?.followingCount || 0}</strong>
                    <small className="text-muted">Following</small>
                  </div>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <p className="text-muted mb-2" style={{ maxWidth: "400px", margin: "0 auto" }}>
                    {user.bio}
                  </p>
                )}

                {/* Follow Button */}
                {!isOwnProfile && (
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    <button 
                      className={`btn btn-sm px-4 ${isFollowing ? 'btn-outline-primary' : 'btn-primary'}`}
                      onClick={handleFollow}
                      disabled={followLoading[id]}
                    >
                      {followLoading[id] ? "Loading..." : isFollowing ? "Following" : "Follow"}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm px-4">Message</button>
                  </div>
                )}
              </div>

              <div className="_feed_inner_timeline">
                <h4 className="_title5 mb-3 px-3">Recent Posts</h4>
                {posts.length === 0 ? (
                  <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 text-center">
                    <p className="text-muted">No posts available.</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post._id} post={post} onPostUpdated={() => window.location.reload()} />
                  ))
                )}
              </div>
            </div>

            <div className="col-xl-3 col-lg-3 col-md-12">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
