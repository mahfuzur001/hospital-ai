"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../src/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get("/api/accounts/profile/");
      const userData = res.data;
      setUser(userData);
      // Cache role in localStorage for fast access
      localStorage.setItem("user_role", userData.role?.toLowerCase());
      localStorage.setItem("user_profile", JSON.stringify(userData));
    } catch (err) {
      console.error("Auth: Failed to fetch profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = {
    user,
    loading,
    role: user?.role?.toLowerCase() || null,
    isAuthenticated: !!user,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
