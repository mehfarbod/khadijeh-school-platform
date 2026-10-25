"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, mustChangePassword } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (isLoading) return;

    if (mustChangePassword) {
      router.replace("/auth/change-password");
    } else if (!isAuthenticated) {
      router.replace(`/auth?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, mustChangePassword, router, pathname]);

  if (isLoading || !isAuthenticated || mustChangePassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return <>{children}</>;
}
