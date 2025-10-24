
"use client"
import * as React from "react";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  return (
    // FLEX LAYOUT: topbar is a row with justified content
    <div className="flex h-14 items-center justify-between gap-3 border-b bg-background px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Pre Sprint Planning</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline">Share</Button>
        <Button size="sm">New</Button>
      </div>
    </div>
  );
}