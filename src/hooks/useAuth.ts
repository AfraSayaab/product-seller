"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type User = {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await api<User>("/api/auth/me");
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { user, isAuthenticated: !!user, loading };
}

