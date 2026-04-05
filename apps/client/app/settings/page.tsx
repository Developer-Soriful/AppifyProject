"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../src/components/Navbar";
import LeftSidebar from "../../src/components/LeftSidebar";
import RightSidebar from "../../src/components/RightSidebar";
import { useAuth } from "../../src/context/AuthContext";
import apiClient from "../../src/lib/axios";
import toast from "react-hot-toast";
import { getAvatarUrl } from "../../src/lib/utils";

export default function SettingsPage() {
  const { user, checkAuth } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      // Append avatar if selected
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      await apiClient.put("/users/me", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully!");
      await checkAuth(); // Refresh user data
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-5">Loading...</div>;
  }

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
              <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_r24 _padd_l24 _padd_b24 _mar_b16">
                <h3 className="_title4 _mar_b24">Edit Profile</h3>

                {/* Avatar Section */}
                <div className="text-center _mar_b24">
                  <div
                    className="position-relative d-inline-block cursor-pointer"
                    onClick={handleAvatarClick}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={avatarPreview || getAvatarUrl(user.avatar, user.firstName)}
                      alt="Avatar"
                      className="rounded-circle border"
                      style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                    <div
                      className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "35px",
                        height: "35px",
                        background: "var(--color5)",
                        bottom: "5px",
                        right: "5px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="#fff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          stroke="#fff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: "14px" }}>
                    Click to change avatar (max 5MB)
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 _mar_b14">
                      <label className="_social_registration_label _mar_b8">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        maxLength={50}
                        className="form-control _social_registration_input"
                      />
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 _mar_b14">
                      <label className="_social_registration_label _mar_b8">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        maxLength={50}
                        className="form-control _social_registration_input"
                      />
                    </div>
                  </div>

                  <div className="_mar_b14">
                    <label className="_social_registration_label _mar_b8">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      maxLength={500}
                      rows={4}
                      className="form-control _social_registration_input"
                      placeholder="Tell us about yourself..."
                    />
                    <small className="text-muted">
                      {formData.bio.length}/500 characters
                    </small>
                  </div>

                  <div className="_mar_b14">
                    <label className="_social_registration_label _mar_b8">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      maxLength={100}
                      className="form-control _social_registration_input"
                      placeholder="e.g. Dhaka, Bangladesh"
                    />
                  </div>

                  <div className="_mar_b24">
                    <label className="_social_registration_label _mar_b8">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      maxLength={200}
                      className="form-control _social_registration_input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="_social_registration_form_btn_link _btn1 flex-fill"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/profile")}
                      className="btn btn-outline-secondary px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
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
