"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export type SortOption = "newest" | "price_asc" | "price_desc";

interface Props {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;

  priceRange: [number, number] | null;
  onPriceChange: (range: [number, number] | null) => void;

  onApply: () => void;
  onClear: () => void; // ✅ added
}

export default function ListingsFilter({
  sortBy,
  onSortChange,
  priceRange,
  onPriceChange,
  onApply,
  onClear, // ✅ added
}: Props) {
  const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
  ];

  return (
    <div className="border rounded-2xl p-5 shadow-sm bg-muted/30 space-y-5">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </h3>

      {/* Sort */}
      <div>
        <label className="text-sm font-medium mb-1 block">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full rounded-xl border px-3 py-2 text-sm bg-background"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">Price Range</label>

        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Minimum Price"
            value={priceRange?.[0] ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onPriceChange([
                value === "" ? 0 : Number(value),
                priceRange?.[1] ?? 0,
              ]);
            }}
            className="rounded-xl border px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Maximum Price"
            value={priceRange?.[1] ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onPriceChange([
                priceRange?.[0] ?? 0,
                value === "" ? 0 : Number(value),
              ]);
            }}
            className="rounded-xl border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          className="w-full rounded-xl"
          onClick={onApply}
        >
          Apply Filters
        </Button>

        
      </div>
      <div className="flex gap-2 pt-2">
       <Button
          size="sm"
          className="w-full rounded-xl"
          onClick={onClear}
        >
          
          Clear All Filters
        </Button>

        
      </div>
    </div>
  );
}