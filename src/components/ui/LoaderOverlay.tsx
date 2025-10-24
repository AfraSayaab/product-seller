"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoaderOverlay({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // take parent's full width and height
        "absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-black" strokeWidth={2.5} />
        <p className="text-sm font-medium text-black">{label}</p>
      </div>
    </div>
  );
}
