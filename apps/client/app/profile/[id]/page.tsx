"use client";

import React from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../src/components/Navbar";
import LeftSidebar from "../../../src/components/LeftSidebar";
import RightSidebar from "../../../src/components/RightSidebar";
import PostCard from "../../../src/components/PostCard";
import { useProfile } from "../../../src/hooks/useProfile";

export default function UserProfilePage() {
  const { id } = useParams() as { id: string };
  const { user, posts, loading, error } = useProfile(id);

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
                  src={user?.avatar || "/assets/images/profile.png"} 
                  alt="Avatar" 
                  className="rounded-circle border mb-3" 
                  style={{ width: "120px", height: "120px", objectFit: "cover" }} 
                />
                <h3 className="_title4">{user?.firstName} {user?.lastName}</h3>
                <p className="text-muted">{user?.email}</p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <button className="btn btn-primary btn-sm px-4">Connect</button>
                  <button className="btn btn-outline-secondary btn-sm px-4">Message</button>
                </div>
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
