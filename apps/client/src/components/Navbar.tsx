"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { getAvatarUrl } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";


export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notifyOpen) {
      fetchNotifications();
    }
  }, [notifyOpen, fetchNotifications]);

  const handleNotificationClick = (notification: { _id: string; relatedPost?: { _id: string } }) => {
    markAsRead(notification._id);
    if (notification.relatedPost?._id) {
      router.push(`/feed?post=${notification.relatedPost._id}`);
    }
    setNotifyOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("._header_notify_wrap") && !target.closest("._header_nav_profile")) {
        setNotifyOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);



  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
      <div className="container _custom_container">
        <div className="_logo_wrap">
          <Link className="navbar-brand" href="/feed">
            <img
              src="/assets/images/logo.svg"
              alt="Image"
              className="_nav_logo"
            />
          </Link>
        </div>
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="_header_form ms-auto">
            <form
              className="_header_form_grp"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/feed?search=${searchQuery.trim()}`);
                }
              }}
            >

              <svg

                className="_header_form_svg"
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                fill="none"
                viewBox="0 0 17 17"
              >
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
              </svg>

              <input
                className="form-control me-2 _inpt1"
                type="search"
                placeholder="search users or posts"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>


          <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
            <li className="nav-item _header_nav_item">
              <Link
                className="nav-link _header_nav_link_active _header_nav_link"
                aria-current="page"
                href="/feed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="21"
                  fill="none"
                  viewBox="0 0 18 21"
                >
                  <path
                    className="_home_active"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeOpacity=".6"
                    d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z"
                  />
                  <path
                    className="_home_active"
                    stroke="#000"
                    strokeOpacity=".6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857"
                  />
                </svg>
              </Link>
            </li>
            {/* Other items simplified for now */}
          </ul>

          <div className="_header_nav_profile" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="_header_nav_profile_image">
              <img
                src={getAvatarUrl(user?.avatar, user?.firstName)}
                alt="Image"
                className="_header_nav_profile_image"
              />
            </div>
            <div className="_header_nav_dropdown">
              <p className="_header_nav_para">
                {user?.firstName} {user?.lastName}
              </p>
              <button
                className="_header_nav_dropdown_btn _dropdown_toggle"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="6"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    fill="#112032"
                    d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z"
                  />
                </svg>
              </button>
            </div>

            {profileOpen && (
              <div
                id="_prfoile_drop"
                className="_nav_profile_dropdown _profile_dropdown show"
                style={{
                  display: "block",
                  opacity: 1,
                  visibility: "visible",
                  transform: "translateY(0)",
                }}
              >
                <div className="_nav_profile_dropdown_info">
                  <div className="_nav_dropdown_image">
                    <img
                      src={getAvatarUrl(user?.avatar, user?.firstName)}
                      alt="Profile"
                      className="_nav_dropdown_image"
                    />
                  </div>

                  <div className="_nav_profile_dropdown_info_txt">
                    <h4 className="_nav_dropdown_title">
                      {user?.firstName} {user?.lastName}
                    </h4>
                    <Link href="/profile" className="_nav_drop_profile">
                      View Profile
                    </Link>
                  </div>

                </div>
                <hr />
                <ul className="_nav_dropdown_list">
                  <li className="_nav_dropdown_list_item">
                    <button
                      onClick={logout}
                      className="_nav_dropdown_link w-100 border-0 bg-transparent text-start"
                    >
                      <div className="_nav_drop_info">
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="19"
                            height="19"
                            fill="none"
                            viewBox="0 0 19 19"
                          >
                            <path
                              stroke="#377DFF"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667"
                            />
                          </svg>
                        </span>
                        Log Out
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Notification Icon - Absolute Right */}
          <div className="_header_notify_wrap ms-3">
            <span
              className="_header_notify_btn cursor-pointer"
              style={{ cursor: "pointer" }}
              onClick={() => setNotifyOpen(!notifyOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="22"
                fill="none"
                viewBox="0 0 20 22"
              >
                <path
                  fill="#000"
                  fillOpacity=".6"
                  fillRule="evenodd"
                  d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z"
                  clipRule="evenodd"
                />

              </svg>
              {unreadCount > 0 && (
                <span className="_counting absolute top-0">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </span>

            {/* Notification Dropdown */}
            {notifyOpen && (
              <div
                className="position-absolute bg-white rounded shadow-lg"
                style={{
                  top: "100%",
                  right: "0",
                  width: "350px",
                  maxHeight: "400px",
                  overflow: "hidden",
                  zIndex: 1000,
                  marginTop: "10px"
                }}
              >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Notifications</h6>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-sm btn-link text-decoration-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-muted">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted">
                      <small>No notifications yet</small>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 border-bottom cursor-pointer hover-bg-light ${!notification.read ? 'bg-light' : ''}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="d-flex gap-2">
                          <img
                            src={getAvatarUrl(notification.sender.avatar, notification.sender.firstName)}
                            alt=""
                            className="rounded-circle"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                          <div className="flex-fill" style={{ minWidth: 0 }}>
                            <p className="mb-1" style={{ fontSize: "14px" }}>
                              <strong>{notification.sender.firstName} {notification.sender.lastName}</strong>{" "}
                              {notification.message}
                            </p>
                            <small className="text-muted">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </small>
                          </div>
                          {!notification.read && (
                            <span className="rounded-circle bg-primary" style={{ width: "8px", height: "8px", minWidth: "8px" }} />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
