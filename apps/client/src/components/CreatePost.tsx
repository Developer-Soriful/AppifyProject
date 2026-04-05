"use client";

import React, { useState, useRef } from "react";
import apiClient from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { getAvatarUrl } from "../lib/utils";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);
    formData.append("visibility", "public");

    try {
      await apiClient.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setContent("");
      setImage(null);
      setPreview(null);
      toast.success("Post created!");
      onPostCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 _mar_b16">
      <div className="_feed_inner_area_content _padd_r24 _padd_l24">
        <form onSubmit={handleSubmit}>
          <div className="_feed_inner_area_info _mar_b24">
            <div className="_feed_inner_area_image">
              <img src={getAvatarUrl(user?.avatar, user?.firstName)} alt="User" className="_info_img" />
            </div>

            <div className="_feed_inner_area_txt">
              <textarea 
                className="form-control _feed_area_textarea" 
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          
          {preview && (
            <div className="_mar_b16 px-4">
              <img src={preview} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "300px", objectFit: "cover" }} />
              <button 
                type="button" 
                className="btn btn-sm btn-danger mt-2"
                onClick={() => { setImage(null); setPreview(null); }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="_feed_inner_area_bottom">
            <div className="_feed_inner_area_bottom_icon">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="d-none" 
                accept="image/*" 
              />
              <button 
                type="button" 
                className="_feed_inner_area_bottom_icon_link border-0 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#45bd62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="ms-1">Photo/Video</span>
              </button>

              {/* Other icons simplified as static for now */}
              <button type="button" className="_feed_inner_area_bottom_icon_link border-0 bg-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1877f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span className="ms-1">Tag Friends</span>
              </button>

            </div>
            <div className="_feed_inner_area_bottom_btn">
              <button type="submit" disabled={loading} className="_feed_inner_area_bottom_btn_link _btn1 px-4 py-2">
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
