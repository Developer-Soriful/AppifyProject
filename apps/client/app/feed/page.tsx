"use client";

import React, { useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/src/components/Navbar";
import LeftSidebar from "@/src/components/LeftSidebar";
import RightSidebar from "@/src/components/RightSidebar";
import CreatePost from "@/src/components/CreatePost";
import PostCard from "@/src/components/PostCard";
import { useAuth } from "@/src/context/AuthContext";
import { usePosts } from "@/src/hooks/usePosts";

function FeedContent() {
  const { loading: authLoading, user } = useAuth();
  const { posts, loading, hasMore, fetchPosts, refreshPosts, loadMore } = usePosts();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    if (!authLoading && user) {
      fetchPosts(1, search);
    }
  }, [authLoading, user, fetchPosts, search]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      loadMore(search);
    }
  }, [hasMore, loading, loadMore, search]);

  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      });
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (authLoading)
    return <div className="p-5 text-center">Loading session...</div>;
  if (!user) return null;

  return (
    <div className="_layout_inner_wrap" style={{ paddingTop: "100px" }}>
      <div className="row">
        {/* Left Sidebar */}
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
          <LeftSidebar />
        </div>

        {/* Middle Feed */}
        <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
          <div className="_layout_middle_wrap">
            <CreatePost onPostCreated={refreshPosts} />

            {posts.length === 0 && !loading ? (
              <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _mar_b16 text-center">
                No posts to show yet.
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostUpdated={refreshPosts}
                  />
                ))}
                
                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="py-4 text-center">
                  {loading && (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading more...</span>
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <p className="text-muted">No more posts</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="_layout _layout_main_wrapper">
      <Navbar />

      <div className="_main_layout">
        <div className="container _custom_container">
          <Suspense fallback={<div className="p-5 text-center mt-5">Loading Feed...</div>}>
            <FeedContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

