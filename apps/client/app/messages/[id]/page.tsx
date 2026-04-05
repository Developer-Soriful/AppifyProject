"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../src/components/Navbar";
import apiClient from "../../../src/lib/axios";
import { getAvatarUrl } from "../../../src/lib/utils";
import { useAuth } from "../../../src/context/AuthContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export default function ChatPage() {
  const { id } = useParams() as { id?: string };
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState<Conversation["user"] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when user selected
  useEffect(() => {
    if (id) {
      fetchMessages(id);
      const conv = conversations.find((c) => c.user._id === id);
      if (conv) setRecipient(conv.user);
    }
  }, [id, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await apiClient.get("/messages/conversations");
      setConversations(data.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const { data } = await apiClient.get(`/messages/conversation/${userId}`);
      setMessages(data.data);
    } catch (err) {
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      const { data } = await apiClient.post("/messages/send", {
        recipientId: id,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, data.data]);
      setNewMessage("");
      fetchConversations(); // Update conversation list
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  return (
    <main className="_layout_main_wrapper">
      <Navbar />
      <div style={{ paddingTop: "80px", height: "calc(100vh - 80px)" }}>
        <div className="container h-100">
          <div className="row h-100">
            {/* Conversations Sidebar */}
            <div className="col-xl-4 col-lg-4 col-md-12 h-100">
              <div className="_feed_inner_area _b_radious6 h-100 overflow-hidden">
                <div className="p-3 border-bottom">
                  <h5 className="mb-0">Messages</h5>
                </div>
                <div style={{ overflowY: "auto", height: "calc(100% - 60px)" }}>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <small>No conversations yet</small>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <Link
                        key={conv.user._id}
                        href={`/messages/${conv.user._id}`}
                        className={`d-flex align-items-center p-3 text-decoration-none text-dark border-bottom ${
                          id === conv.user._id ? "bg-light" : ""
                        }`}
                      >
                        <img
                          src={getAvatarUrl(conv.user.avatar, conv.user.firstName)}
                          alt=""
                          className="rounded-circle"
                          style={{ width: "48px", height: "48px", objectFit: "cover" }}
                        />
                        <div className="ms-3 flex-fill" style={{ minWidth: 0 }}>
                          <h6 className="mb-0 text-truncate">
                            {conv.user.firstName} {conv.user.lastName}
                          </h6>
                          <p className="text-muted small mb-0 text-truncate">
                            {conv.lastMessage.content}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="badge bg-primary rounded-pill">
                            {conv.unreadCount}
                          </span>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-xl-8 col-lg-8 col-md-12 h-100 d-none d-lg-block">
              {id ? (
                <div className="_feed_inner_area _b_radious6 h-100 d-flex flex-column overflow-hidden">
                  {/* Chat Header */}
                  <div className="p-3 border-bottom d-flex align-items-center">
                    <Link href={`/profile/${id}`} className="d-flex align-items-center text-decoration-none text-dark">
                      <img
                        src={getAvatarUrl(recipient?.avatar, recipient?.firstName)}
                        alt=""
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <h6 className="mb-0 ms-2">
                        {recipient?.firstName} {recipient?.lastName}
                      </h6>
                    </Link>
                  </div>

                  {/* Messages */}
                  <div className="flex-fill p-3" style={{ overflowY: "auto" }}>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.sender._id === authUser?._id;
                        return (
                          <div
                            key={msg._id}
                            className={`d-flex mb-3 ${isMine ? "justify-content-end" : ""}`}
                          >
                            <div
                              className={`p-3 rounded-3 ${
                                isMine
                                  ? "bg-primary text-white"
                                  : "bg-light"
                              }`}
                              style={{ maxWidth: "70%" }}
                            >
                              <p className="mb-1">{msg.content}</p>
                              <small className={isMine ? "text-white-50" : "text-muted"}>
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </small>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-3 border-top">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="_feed_inner_area _b_radious6 h-100 d-flex align-items-center justify-content-center">
                  <div className="text-center text-muted">
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
