//src\app\listings\page.tsx
"use client";

import React from "react";
import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";
import ListingsGridPaginated from "@/components/card/listings-grid-paginated";
import ListingsFilter, {
  SortOption,
} from "@/components/listings/ListingsFilter";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Search } from "lucide-react";

const ListingsPage: React.FC = () => {
  /* ================= FILTER STATE ================= */
const [filterTrigger, setFilterTrigger] = React.useState(0);
  const [sortBy, setSortBy] =
    React.useState<SortOption>("newest");

  const [priceRange, setPriceRange] =
    React.useState<[number, number] | null>(null);

  const [searchQuery, setSearchQuery] =
    React.useState("");

  const [filterOpen, setFilterOpen] =
    React.useState(false);
const handleClear = () => {
  setSortBy("newest");
  setPriceRange(null);
  setSearchQuery("");
  setFilterTrigger((prev) => prev + 1);
};
  return (
    <div>
      <HeaderLayout />

      <main className="container mx-auto px-6 py-12 font-serif">
        {/* ================= SEARCH + FILTER BUTTON ================= */}
        <div className="mb-8 flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() =>
              setFilterOpen(!filterOpen)
            }
            className="rounded-xl flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* ================= LAYOUT ================= */}
        <div className="flex gap-8">
          {/* Sidebar Filter */}
          {filterOpen && (
            <div className="w-1/4">
              <div className="sticky top-6">
                <ListingsFilter
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  onApply={() => setFilterTrigger((prev) => prev + 1)}
                  onClear={handleClear}
                />
              </div>
            </div>
          )}

          {/* Grid */}
          <div
            className={
              filterOpen ? "w-3/4" : "w-full"
            }
          >
            <ListingsGridPaginated
  title="All Listings"
  sortBy={sortBy}
  priceRange={priceRange}
  searchQuery={searchQuery}
  refreshKey={filterTrigger}
/>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingsPage;