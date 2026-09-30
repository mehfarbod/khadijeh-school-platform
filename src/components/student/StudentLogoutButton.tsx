"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/student-auth/logout", { method: "POST" });
      router.replace("/portal/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-lg border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted disabled:opacity-50"
    >
      {loading ? "در حال خروج..." : "خروج از پرتال"}
    </button>
  );
}
