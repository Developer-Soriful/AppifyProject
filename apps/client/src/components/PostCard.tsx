"use client";

import { useState, useRef, useEffect } from "react";
import { IPost, PostVisibility, IUser } from "@appify/shared";
import apiClient from "../lib/axios";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import CommentSection from "./CommentSection";
import { getAvatarUrl, getPostImageUrl } from "../lib/utils";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";


interface PostCardProps {
  post: IPost;
  onPostUpdated: () => void;
  onPostDeleted?: () => void;
}

export default function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { user } = useAuth();
  // Fix: Handle both populated author object and string author ID
  const authorId = post.author?._id 
    ? post.author._id.toString() 
    : post.author?.toString();
  const isOwner = user?._id?.toString() === authorId;

  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  
  // Dropdown and edit states
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState<PostVisibility>(post.visibility);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Likers state
  const [likers, setLikers] = useState<IUser[]>([]);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [loadingLikers, setLoadingLikers] = useState(false);
  
  // Hide state - check if current user has hidden this post
  const [isHidden, setIsHidden] = useState(post.isHidden ?? false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch likers when component mounts
  useEffect(() => {
    const fetchLikers = async () => {
      if (likesCount === 0) return;
      try {
        const { data } = await apiClient.get(`/likes/Post/${post._id}`);
        setLikers(data.data); // Get all likers
      } catch (err) {
        // Silent fail - likers not critical
      }
    };
    fetchLikers();
  }, [post._id, likesCount]);

  // Handle open likers modal
  const openLikersModal = async () => {
    if (likesCount === 0) return;
    setShowLikersModal(true);
    setLoadingLikers(true);
    try {
      const { data } = await apiClient.get(`/likes/Post/${post._id}`);
      setLikers(data.data);
    } catch (err) {
      toast.error("Failed to load likers");
    } finally {
      setLoadingLikers(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await apiClient.post(`/likes/Post/${post._id}`);
      setIsLiked(data.data.isLiked);
      setLikesCount(data.data.likesCount);
      onPostUpdated();
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  const openShareModal = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    setShareUrl(url);
    setShowShareModal(true);
    // Also call the share API to increment count
    apiClient.post(`/posts/${post._id}/share`).then(({ data }) => {
      setSharesCount(data.data.sharesCount);
    }).catch(() => { });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleSave = async () => {
    try {
      const { data } = await apiClient.post(`/posts/${post._id}/save`);
      setIsSaved(data.data.isSaved);
      toast.success(data.data.isSaved ? "Post saved!" : "Post unsaved!");
    } catch (err) {
      toast.error("Failed to save post");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle delete post
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/posts/${post._id}`);
      toast.success("Post deleted successfully");
      onPostDeleted?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDropdown(false);
    }
  };

  // Handle edit post
  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      const { data } = await apiClient.put(`/posts/${post._id}`, {
        content: editContent,
        visibility: editVisibility,
      });
      toast.success("Post updated successfully");
      setShowEditModal(false);
      onPostUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle toggle hide/unhide (user-specific)
  const handleToggleHide = async () => {
    try {
      const { data } = await apiClient.post(`/posts/${post._id}/hide`);
      setIsHidden(data.data.isHidden);
      if (data.data.isHidden) {
        toast.success("Post hidden");
      } else {
        toast.success("Post unhidden");
      }
      onPostUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to hide/unhide post");
    }
    setShowDropdown(false);
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);


  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_timeline_post_image">
              <Link href={`/profile/${post.author._id}`}>
                <img src={getAvatarUrl(post.author.avatar, post.author.firstName)} alt="Author" className="_info_img" />
              </Link>
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.author.firstName} {post.author.lastName}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDistanceToNow(new Date(post.createdAt))} ago .
                <a href="#0" className="ms-1">{post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown" ref={dropdownRef}>
            <button 
              className="_feed_timeline_post_dropdown_link border-0 bg-transparent position-relative"
              onClick={toggleDropdown}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className="position-absolute bg-white rounded shadow-lg py-2"
                style={{ 
                  right: 0, 
                  top: "100%", 
                  zIndex: 1000, 
                  minWidth: "160px",
                  border: "1px solid #eee"
                }}
              >
                {/* Edit - Only for owner */}
                {isOwner && (
                  <button
                    className="w-100 text-start px-3 py-2 border-0 bg-transparent hover-bg-light d-flex align-items-center gap-2"
                    onClick={() => {
                      setEditContent(post.content);
                      setEditVisibility(post.visibility);
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Post</span>
                  </button>
                )}
                
                {/* Delete - Only for owner */}
                {isOwner && (
                  <button
                    className="w-100 text-start px-3 py-2 border-0 bg-transparent hover-bg-light d-flex align-items-center gap-2 text-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{ cursor: "pointer" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#dc3545" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{isDeleting ? "Deleting..." : "Delete Post"}</span>
                  </button>
                )}
                
                {/* Hide/Unhide - Everyone */}
                <button
                  className="w-100 text-start px-3 py-2 border-0 bg-transparent hover-bg-light d-flex align-items-center gap-2"
                  onClick={handleToggleHide}
                  style={{ cursor: "pointer" }}
                >
                  {!isHidden ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Unhide</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {!isHidden && (
          <>
            <p className="_feed_inner_timeline_post_title mt-3">{post.content}</p>

            {post.image && (
              <div className="_timeline_post_main_image mt-3">
                <img src={getPostImageUrl(post.image) || ""} alt="Post" className="_main_img" style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26 mt-3">
        <div className="_feed_inner_timeline_total_reacts_image">
          {likers.length > 0 ? (
            <div className="d-flex align-items-center">
              <div className="d-flex" style={{ marginLeft: "0" }}>
                {likers.slice(0, 3).map((liker, index) => (
                  <img
                    key={liker._id}
                    src={getAvatarUrl(liker.avatar, liker.firstName)}
                    alt={`${liker.firstName} ${liker.lastName}`}
                    className="rounded-circle border border-white"
                    style={{
                      width: "24px",
                      height: "24px",
                      objectFit: "cover",
                      marginLeft: index === 0 ? "0" : "-8px",
                      zIndex: 3 - index,
                    }}
                  />
                ))}
              </div>
              {likesCount > 3 && (
                <span className="ms-2 text-muted small">+{likesCount - 3}</span>
              )}
            </div>
          ) : (
            <img src="/assets/images/react_img1.png" alt="Like" className="_react_img1" />
          )}
          <p 
            className="_feed_inner_timeline_total_reacts_para ms-2" 
            style={{ cursor: likesCount > 0 ? "pointer" : "default" }}
            onClick={openLikersModal}
          >
            {likesCount}
          </p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <div className="d-flex gap-3">
            <button onClick={() => setShowComments(!showComments)} className="btn btn-link p-0 text-decoration-none _feed_inner_timeline_total_reacts_para1">
              <span>{post.commentsCount || 0}</span> Comments
            </button>
            <p className="_feed_inner_timeline_total_reacts_para2"><span>{sharesCount}</span> Share</p>
          </div>
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
        <button className="_feed_reaction border-0 bg-transparent" onClick={() => setShowComments(!showComments)}>
          <span className="_feed_inner_timeline_reaction_link">
            <span className="d-flex align-items-center">
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#666" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              <span className="ms-1">Comment</span>
            </span>
          </span>
        </button>
        <button className="_feed_reaction border-0 bg-transparent" onClick={openShareModal}>
          <span className="_feed_inner_timeline_reaction_link">
            <span className="d-flex align-items-center">
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#666" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
              </svg>
              <span className="ms-1">Share</span>
            </span>
          </span>
        </button>
        <button
          className={`_feed_reaction border-0 bg-transparent ${isSaved ? "text-primary" : ""}`}
          onClick={handleSave}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span className="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill={isSaved ? "#1890FF" : "none"} viewBox="0 0 24 24" stroke={isSaved ? "#1890FF" : "#666"} strokeWidth="2">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="ms-1" style={{ color: isSaved ? "#1890FF" : "inherit" }}>
                {isSaved ? "Saved" : "Save"}
              </span>
            </span>
          </span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          onCommentAdded={onPostUpdated}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ maxWidth: "500px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Share Post</h5>
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => setShowShareModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-muted mb-3">Copy this link to share the post:</p>

            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={shareUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                className="btn btn-primary"
                onClick={copyToClipboard}
              >
                Copy
              </button>
            </div>

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ maxWidth: "500px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Edit Post</h5>
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => setShowEditModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Content</label>
              <textarea
                className="form-control"
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Visibility</label>
              <select
                className="form-select"
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value as PostVisibility)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEdit}
                disabled={isUpdating || !editContent.trim()}
              >
                {isUpdating ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Likers Modal */}
      {showLikersModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
          onClick={() => setShowLikersModal(false)}
        >
          <div
            className="bg-white rounded shadow-lg"
            style={{ maxWidth: "400px", width: "90%", maxHeight: "500px", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">{likesCount} Likes</h5>
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => setShowLikersModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Liker List */}
            <div className="overflow-auto" style={{ maxHeight: "400px" }}>
              {loadingLikers ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading...</p>
                </div>
              ) : likers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No likes yet</p>
                </div>
              ) : (
                likers.map((liker) => (
                  <Link
                    key={liker._id}
                    href={`/profile/${liker._id}`}
                    className="d-flex align-items-center gap-3 p-3 text-decoration-none text-dark hover-bg-light"
                    style={{ transition: "background 0.2s" }}
                    onClick={() => setShowLikersModal(false)}
                  >
                    <img
                      src={getAvatarUrl(liker.avatar, liker.firstName)}
                      alt={`${liker.firstName} ${liker.lastName}`}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0 fw-semibold">
                        {liker.firstName} {liker.lastName}
                      </h6>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Hidden Post UI - Shows when post is hidden */}
      {isHidden && (
        <div className="_feed_inner_timeline _feed_inner_timeline_content _padd_t24 _padd_b24 _b_radious6 _feed_inner_area mt-3" style={{ background: "#F6FFED", border: "1px solid #B7EB8F" }}>
          <div className="d-flex align-items-center justify-content-between px-4">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "40px", height: "40px", background: "#52C41A" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
              <div>
                <p className="mb-0 fw-semibold" style={{ color: "#389E0D", fontSize: "14px" }}>Post hidden</p>
                <p className="mb-0 small text-muted" style={{ fontSize: "12px" }}>You won&apos;t see this post in your feed</p>
              </div>
            </div>
            <button
              onClick={handleToggleHide}
              className="btn btn-sm fw-semibold"
              style={{ background: "#52C41A", color: "white", border: "none", fontSize: "13px" }}
            >
              Unhide
            </button>
          </div>
        </div>
      )}
    </div>

  );
}
