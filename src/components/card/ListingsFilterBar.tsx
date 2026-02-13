"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  totalResults: number;
  onSortChange: (sort: string) => void;
}

export default function ListingsFilterBar({ totalResults, onSortChange }: Props) {
  const [sort, setSort] = React.useState("newest");

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value); // Notify parent to refetch
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow mb-6">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Result Found: <span className="font-semibold">{totalResults}</span>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Sort By:</span>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
