"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/src/components/Navbar";
import LeftSidebar from "@/src/components/LeftSidebar";
import RightSidebar from "@/src/components/RightSidebar";
import CreatePost from "@/src/components/CreatePost";
import PostCard from "@/src/components/PostCard";
import { useAuth } from "@/src/context/AuthContext";
import { usePosts } from "@/src/hooks/usePosts";

export default function FeedPage() {
  const { loading: authLoading, user } = useAuth();
  const { posts, loading, fetchPosts } = usePosts();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";


  useEffect(() => {
    if (!authLoading && user) {
      fetchPosts(1, search);
    }
  }, [authLoading, user, fetchPosts, search]);


  if (authLoading)
    return <div className="p-5 text-center">Loading session...</div>;
  if (!user) return null;

  return (
    <div className="_layout _layout_main_wrapper">
      <Navbar />

      <div className="_main_layout">
        <div className="container _custom_container">
          <div className="_layout_inner_wrap" style={{ paddingTop: "100px" }}>
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>

              {/* Middle Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <CreatePost onPostCreated={fetchPosts} />

                  {loading ? (
                    <div className="p-4 text-center">Getting posts...</div>
                  ) : posts.length === 0 ? (
                    <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _mar_b16 text-center">
                      No posts to show yet.
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onPostUpdated={fetchPosts}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
