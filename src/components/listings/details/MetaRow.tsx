import React from "react";

type MetaRowProps = {
  label: string;
  value: React.ReactNode;
};

export default function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <span className="text-sm font-medium text-muted-foreground">
        {label}:
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
