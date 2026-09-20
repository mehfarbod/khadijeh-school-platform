"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user ?? null,
    signIn,
    signOut,
  };
}