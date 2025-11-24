
"use client"
import * as React from "react";
import { useState } from "react";
import Sidebar from "@/components/user/Sidebar";
import Topbar from "@/components/user/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((v) => !v);

  return (

       <div className="flex min-h-screen w-full flex-row">
          {/* STICKY SIDEBAR */}
          <div className="sticky top-0 h-screen">
            <Sidebar collapsed={collapsed} onToggle={toggle} />
          </div>
    
          {/* MAIN COLUMN */}
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
    // <div className="flex min-h-screen w-full flex-row">
    //   <Sidebar collapsed={collapsed} onToggle={toggle} />
    //   <div className="flex min-w-0 flex-1 flex-col">
    //     <Topbar />
    //     <main className="flex-1 p-4 md:p-6">
    //       {children}
    //     </main>
    //   </div>
    // </div>
  );
}
