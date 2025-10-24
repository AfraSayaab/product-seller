
"use client"
import * as React from "react";
import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((v) => !v);

  return (
    // FLEX LAYOUT: wrapper is a row with sidebar + content
    <div className="flex min-h-screen w-full flex-row">
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      {/* MAIN COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
