"use client";

import React, { useState, useEffect, use } from "react";
import Footer from "@/components/Footer";
import { HeaderLayout } from "@/components/Header/header";
import ListingsGridPaginated from "@/components/card/listings-grid-paginated";
import ChildCategories from "@/components/categories/ChildCategories";
import ListingsFilter, { SortOption } from "@/components/listings/ListingsFilter";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Search } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  children: Category[];
}

// Recursive helper to find category by slug
function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

interface Props {
  params: Promise<{ category: string }>;
}

const PersonalCategoryPage: React.FC<Props> = ({ params }) => {
  const { category } = use(params);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true); // ✅ loading state

  /* ================= FILTER STATE ================= */
  const [filterTrigger, setFilterTrigger] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const handleClear = () => {
    setSortBy("newest");
    setPriceRange(null);
    setSearchQuery("");
    setFilterTrigger((prev) => prev + 1);
  };

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategory(true); // start loading
      try {
        const res = await fetch("http://localhost:3000/api/admin/categories/tree", {
          cache: "no-store",
        });
        const json = await res.json();
        setCategories(json.data);

        const cat = findCategoryBySlug(json.data, category);
        setSelectedCategory(cat || null);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
        setSelectedCategory(null);
      } finally {
        setLoadingCategory(false); // done loading
      }
    };

    fetchCategories();
  }, [category]);

  // Show loader while fetching category
  if (loadingCategory) {
    return (
      <div className="p-6 text-center text-gray-500">Loading category...</div>
    );
  }

  // Show error if category not found after fetch
  if (!selectedCategory) {
    return (
      <div className="p-6 text-red-500">
        Category - {category} not found
      </div>
    );
  }

  return (
    <div>
      <HeaderLayout />

      <main className="container mx-auto px-6 py-12 font-serif">

        {/* ================= SEARCH + FILTER BUTTON ================= */}
        <div className="mb-8 flex items-center gap-4  border-b border-pink-500 pb-1">
          <ChildCategories parentCategory={selectedCategory} />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setFilterOpen(!filterOpen)}
            className="rounded-xl flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
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

          <div className={filterOpen ? "w-3/4" : "w-full"}>
            
            <ListingsGridPaginated
              categorySlug={selectedCategory.slug}
              title={`${selectedCategory.name} Listings`}
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

export default PersonalCategoryPage;