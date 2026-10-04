"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
      className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-center text-xs font-semibold text-[#A45F4D] transition-colors hover:bg-[#FDF0EC] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      <span>{loading ? "در حال خروج..." : "خروج از پرتال"}</span>
    </button>
  );
}
