// wherever your Topbar lives (e.g., components/Topbar.tsx)
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      // Even if it fails, clear client state and bounce to login
      if (!res.ok) {
        console.warn("Logout API returned non-OK:", await res.text());
      }
      // If you cache user data client-side, clear it here
      // localStorage.removeItem("user"); etc.
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-14 items-center justify-between gap-3 border-b bg-background px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Pre Sprint Planning</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleLogout} disabled={loading}>
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
