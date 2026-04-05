"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../src/components/Navbar";
import LeftSidebar from "../../src/components/LeftSidebar";
import RightSidebar from "../../src/components/RightSidebar";
import PostCard from "../../src/components/PostCard";
import apiClient from "../../src/lib/axios";
import { IPost } from "@appify/shared";
import toast from "react-hot-toast";

// Eye Icon Component
const EyeIcon = ({ size = 24, fill = "#1890FF" }: { size?: number; fill?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={fill} viewBox="0 0 24 24">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

export default function HiddenPostsPage() {
  const [hiddenPosts, setHiddenPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHiddenPosts();
  }, []);

  const fetchHiddenPosts = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/posts/hidden");
      setHiddenPosts(data.data);
    } catch (err) {
      toast.error("Failed to load hidden posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="_layout_main_wrapper">
      <Navbar />
      <div className="_layout_main_content" style={{ paddingTop: "80px" }}>
        <div className="container">
          <div className="row">
            {/* Left Sidebar */}
            <div className="col-xl-3 col-lg-3 col-md-12 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px" }}>
                <LeftSidebar />
              </div>
            </div>

            {/* Main Content */}
            <div className="col-xl-6 col-lg-6 col-md-12">
              {/* Header Card */}
              <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 _padd_b24 _mar_b16 _feed_inner_area">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{ 
                        width: "48px", 
                        height: "48px", 
                        background: "linear-gradient(135deg, #E6F7FF 0%, #BAE7FF 100%)",
                        border: "2px solid #1890FF",
                        boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)"
                      }}
                    >
                      <EyeIcon size={24} fill="#1890FF" />
                    </div>
                    <div>
                      <h4 className="_title5 mb-1">Hidden Posts</h4>
                      <p className="text-muted small mb-0">
                        {hiddenPosts.length} {hiddenPosts.length === 1 ? "post" : "posts"} hidden
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/feed" 
                    className="_info_link _friends_btn_link"
                    style={{ textDecoration: "none" }}
                  >
                    Back to Feed
                  </Link>
                </div>
              </div>

              {/* Posts List */}
              {loading ? (
                <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 _padd_b24 text-center _feed_inner_area">
                  <div className="py-5">
                    <div 
                      className="spinner-border text-primary mb-3" 
                      role="status" 
                      style={{ width: "3rem", height: "3rem" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading your hidden posts...</p>
                  </div>
                </div>
              ) : hiddenPosts.length === 0 ? (
                <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 _padd_b24 text-center _feed_inner_area">
                  <div className="py-5">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        background: "linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)",
                        border: "2px dashed #D9D9D9"
                      }}
                    >
                      <EyeIcon size={40} fill="#BFBFBF" />
                    </div>
                    <h5 className="_title4 mb-2">No hidden posts</h5>
                    <p className="text-muted mb-4">Posts you hide will appear here</p>
                    <Link 
                      href="/feed" 
                      className="_info_link _friends_btn_link"
                      style={{ textDecoration: "none", display: "inline-block" }}
                    >
                      Explore Feed
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {hiddenPosts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onPostUpdated={fetchHiddenPosts}
                      onPostDeleted={fetchHiddenPosts}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="col-xl-3 col-lg-3 col-md-12 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px" }}>
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
