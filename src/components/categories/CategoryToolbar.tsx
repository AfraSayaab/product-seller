"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  parentSlug: string;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onToggleFilter: () => void;
}

export default function CategoryToolbar({
  parentSlug,
  categories,
  searchQuery,
  onSearchChange,
  onToggleFilter,
}: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">

        {/* LEFT 2/3 — Categories */}
        <div className="flex-1 flex items-center gap-3 relative">

          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded-full border bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/listings/personal-category/${cat.slug}`}
                className="whitespace-nowrap px-4 py-2 border rounded-full text-sm hover:bg-pink-50 hover:border-pink-400 transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded-full border bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* RIGHT 1/3 — Search + Filter */}
        <div className="w-1/3 flex items-center gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <Button
            variant="outline"
            onClick={onToggleFilter}
            className="rounded-xl flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
}