"use client";

import React, { useState } from "react";
import { IPost } from "@appify/shared";
import apiClient from "../lib/axios";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface PostCardProps {
  post: IPost;
  onPostUpdated: () => void;
}

export default function PostCard({ post, onPostUpdated }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(post.author._id)); // This is a fallback, real isLiked should come from backend or state
  // For production, the backend should return isLiked: boolean for the requesting user.
  // My backend logic returns isLiked in the response of toggleLike.
  
  const handleLike = async () => {
    try {
      const { data } = await apiClient.post(`/likes/Post/${post._id}`);
      setIsLiked(data.data.isLiked);
      onPostUpdated();
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path}`;
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src={post.author.avatar || "/assets/images/post_img.png"} alt="Author" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.author.firstName} {post.author.lastName}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDistanceToNow(new Date(post.createdAt))} ago . 
                <a href="#0" className="ms-1">{post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
             {/* Dropdown simplified */}
             <button className="_feed_timeline_post_dropdown_link border-0 bg-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
             </button>
          </div>
        </div>
        
        <p className="_feed_inner_timeline_post_title mt-3">{post.content}</p>
        
        {post.image && (
          <div className="_feed_inner_timeline_image mt-3">
            <img src={getImageUrl(post.image)} alt="Post" className="_time_img rounded" style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }} />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26 mt-3">
        <div className="_feed_inner_timeline_total_reacts_image">
          <img src="/assets/images/react_img1.png" alt="Like" className="_react_img1" />
          <p className="_feed_inner_timeline_total_reacts_para">{post.likesCount}</p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <a href="#0"><span>{post.commentsCount}</span> Comments</a>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2"><span>0</span> Share</p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button 
          className={`_feed_reaction border-0 bg-transparent ${isLiked ? "_feed_reaction_active" : ""}`}
          onClick={handleLike}
        >
          <span className="_feed_inner_timeline_reaction_link"> 
            <span className="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill={isLiked ? "#1890FF" : "none"} viewBox="0 0 24 24" stroke={isLiked ? "#1890FF" : "#666"} strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span className="ms-1" style={{ color: isLiked ? "#1890FF" : "inherit" }}>Like</span>
            </span>
          </span>
        </button>
        <button className="_feed_reaction border-0 bg-transparent">
          <span className="_feed_inner_timeline_reaction_link">
            <span className="d-flex align-items-center">
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#666" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"/>
                <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563"/>
              </svg>
              <span className="ms-1">Comment</span>
            </span>
          </span>
        </button>
        <button className="_feed_reaction border-0 bg-transparent">
          <span className="_feed_inner_timeline_reaction_link">
            <span className="d-flex align-items-center">
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#666" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"/>
              </svg>
              <span className="ms-1">Share</span>
            </span>
          </span>
        </button>
      </div>
      
      {/* Comment areas can be added here */}
    </div>
  );
}
