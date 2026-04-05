"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import apiClient from "../lib/axios";
import { IUser, LoginPayload, RegisterPayload } from "@appify/shared";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data.data.user);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Route protection
  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/register", "/"];
      const isPublic = publicRoutes.includes(pathname);
      
      if (!user && !isPublic) {
        router.push("/login");
      } else if (user && isPublic) {
        // router.push("/feed"); // Optional auto-redirect
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (credentials: LoginPayload) => {
    try {
      const { data } = await apiClient.post("/auth/login", credentials);
      localStorage.setItem("token", data.data.token);
      setUser(data.data.user);
      toast.success("Welcome back!");
      router.push("/feed");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      throw err;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const { data } = await apiClient.post("/auth/register", payload);
      
      if (data?.data?.token) {
        localStorage.setItem("token", data.data.token);
        setUser(data.data.user);
        toast.success("Welcome to Buddy Script!");
        router.push("/feed");
      }
    } catch (err: any) {
      console.error("Registration full error:", err);
      const msg = err.response?.data?.message || err.message || "Registration failed";
      toast.error(msg);
      throw err;
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
