// components/admin/Statcard.tsx
"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Stat({
  title,
  value,
  hint,
  loading = false,
  className,
}: {
  title: string;
  value?: string | number;
  hint?: string;
  loading?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-24 animate-pulse rounded bg-muted" />
            {hint !== undefined && <div className="h-3 w-32 animate-pulse rounded bg-muted" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold">{value ?? "—"}</div>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
