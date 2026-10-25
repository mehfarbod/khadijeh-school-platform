"use client";

import { useCallback, useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type PasswordSessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  user: AdminUser | null;
};

const initialState: PasswordSessionState = {
  isLoading: true,
  isAuthenticated: false,
  mustChangePassword: false,
  user: null,
};

export function useAuth() {
  const [state, setState] = useState<PasswordSessionState>(initialState);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-auth/session", { cache: "no-store" });
      if (!response.ok) {
        setState({ ...initialState, isLoading: false });
        return;
      }

      const data = (await response.json()) as {
        authenticated?: boolean;
        mustChangePassword?: boolean;
        user?: AdminUser;
      };
      const mustChangePassword = Boolean(data.mustChangePassword);
      setState({
        isLoading: false,
        isAuthenticated: Boolean(data.authenticated) && !mustChangePassword,
        mustChangePassword,
        user: data.user ?? null,
      });
    } catch {
      setState({ ...initialState, isLoading: false });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/admin-auth/logout", { method: "POST" });
    } finally {
      setState({ ...initialState, isLoading: false });
      window.location.assign("/auth");
    }
  }, []);

  return { ...state, refresh, signOut };
}
