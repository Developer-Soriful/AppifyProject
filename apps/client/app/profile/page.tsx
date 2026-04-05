"use client";

import React from "react";
import Navbar from "../../src/components/Navbar";
import LeftSidebar from "../../src/components/LeftSidebar";
import RightSidebar from "../../src/components/RightSidebar";
import PostCard from "../../src/components/PostCard";
import CreatePost from "../../src/components/CreatePost";
import { useProfile } from "../../src/hooks/useProfile";
import { useAuth } from "../../src/context/AuthContext";
import { getAvatarUrl } from "../../src/lib/utils";


export default function MyProfilePage() {
  const { user: authUser } = useAuth();
  const { user: profileUser, posts, loading, error } = useProfile();

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
                  src={getAvatarUrl(profileUser?.avatar, profileUser?.firstName)} 
                  alt="Avatar" 
                  className="rounded-circle border mb-3" 
                  style={{ width: "120px", height: "120px", objectFit: "cover" }} 
                />

                <h3 className="_title4">{profileUser?.firstName} {profileUser?.lastName}</h3>
                <p className="text-muted">{profileUser?.email}</p>
                <button className="btn btn-outline-primary btn-sm px-4 mb-3">Edit Profile</button>
              </div>

              {/* Show CreatePost on my own profile */}
              <CreatePost onPostCreated={() => window.location.reload()} />

              <div className="_feed_inner_timeline">
                {posts.length === 0 ? (
                  <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 text-center">
                    <p className="text-muted">You haven't posted anything yet.</p>
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
