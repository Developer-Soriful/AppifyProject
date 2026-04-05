"use client";

import React from "react";

export function PostSkeleton() {
  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        {/* Header Skeleton */}
        <div className="d-flex align-items-center mb-3">
          <div 
            className="rounded-circle bg-light shimmer"
            style={{ width: "40px", height: "40px" }}
          />
          <div className="ms-3 flex-fill">
            <div 
              className="bg-light shimmer mb-1 rounded"
              style={{ width: "120px", height: "14px" }}
            />
            <div 
              className="bg-light shimmer rounded"
              style={{ width: "80px", height: "12px" }}
            />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="mb-2">
          <div 
            className="bg-light shimmer mb-2 rounded"
            style={{ width: "100%", height: "14px" }}
          />
          <div 
            className="bg-light shimmer mb-2 rounded"
            style={{ width: "90%", height: "14px" }}
          />
          <div 
            className="bg-light shimmer rounded"
            style={{ width: "60%", height: "14px" }}
          />
        </div>

        {/* Image Skeleton */}
        <div 
          className="bg-light shimmer rounded mt-3"
          style={{ width: "100%", height: "300px" }}
        />
      </div>

      {/* Actions Skeleton */}
      <div className="d-flex justify-content-around mt-3 pt-3 border-top mx-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="bg-light shimmer rounded"
            style={{ width: "60px", height: "20px" }}
          />
        ))}
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <div>
      {/* Cover Skeleton */}
      <div 
        className="bg-light shimmer w-100"
        style={{ height: "200px" }}
      />
      
      {/* Avatar Skeleton */}
      <div className="px-4">
        <div 
          className="bg-light shimmer rounded-circle border border-4 border-white"
          style={{ 
            width: "120px", 
            height: "120px", 
            marginTop: "-60px",
            background: "white"
          }}
        />
      </div>

      {/* Info Skeleton */}
      <div className="px-4 mt-3">
        <div 
          className="bg-light shimmer mb-2 rounded"
          style={{ width: "200px", height: "24px" }}
        />
        <div 
          className="bg-light shimmer mb-3 rounded"
          style={{ width: "150px", height: "16px" }}
        />
        <div 
          className="bg-light shimmer rounded"
          style={{ width: "100%", height: "60px" }}
        />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _mar_b16">
        <div 
          className="bg-light shimmer mb-3 rounded"
          style={{ width: "100px", height: "20px" }}
        />
        {[1, 2, 3].map((i) => (
          <div key={i} className="d-flex align-items-center mb-3">
            <div 
              className="bg-light shimmer rounded-circle"
              style={{ width: "40px", height: "40px" }}
            />
            <div className="ms-3 flex-fill">
              <div 
                className="bg-light shimmer mb-1 rounded"
                style={{ width: "100px", height: "14px" }}
              />
              <div 
                className="bg-light shimmer rounded"
                style={{ width: "60px", height: "12px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
