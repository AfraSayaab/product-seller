"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Loader({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dimension =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-black/80 border-t-transparent",
          dimension
        )}
      />
    </div>
  );
}
