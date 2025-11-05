"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EditCategoryModal from "./EditCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import CategoryViewSheet from "./CategoryViewSheet";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  image: string | null;
  createdAt?: string;
  attributeSchema?: Record<string, any>;
};

// Memoized row component for lazy loading
const CategoryRow = React.memo(({ 
  category, 
  onEdit, 
  onDelete,
  onView
}: { 
  category: Category; 
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}) => {
  const formatDate = React.useMemo(() => {
    if (!category.createdAt) return "—";
    return new Date(category.createdAt).toLocaleString();
  }, [category.createdAt]);

  return (
    <TableRow key={category.id} className="hover:bg-muted/50">
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground hidden sm:table-cell">{category.slug}</TableCell>
      <TableCell className="hidden md:table-cell">
        {category.parentId ? (
          <button
            onClick={() => onView(category.parentId!)}
            className="text-black hover:text-gray-600 hover:underline font-medium transition-colors"
          >
            View Details
          </button>
        ) : (
          <span className="text-muted-foreground">No Details Available</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {category.image ? (
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs truncate max-w-[120px]">{category.image}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No image</span>
        )}
      </TableCell>
      <TableCell>
          <Badge variant={category.isActive ? "default" : "secondary"}>{category.isActive ?"Active":"Inactive"}</Badge>
      
      </TableCell>
      <TableCell className="hidden lg:table-cell">{formatDate}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(category.id)}
            className="h-8 w-8  hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Edit ${category.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(category.id)}
            className="h-8 w-8  hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
});

CategoryRow.displayName = "CategoryRow";

// Mobile card view component
const CategoryCard = React.memo(({ 
  category, 
  onEdit, 
  onDelete,
  onView
}: { 
  category: Category; 
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}) => {
  const formatDate = React.useMemo(() => {
    if (!category.createdAt) return "—";
    return new Date(category.createdAt).toLocaleString();
  }, [category.createdAt]);

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{category.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{category.slug}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {category.isActive ? (
            <span className="px-2 py-1 text-xs font-bold bg-black text-white">Active</span>
          ) : (
            <span className="px-2 py-1 text-xs font-bold border-2 border-black">Inactive</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {category.parentId && (
          <div>
            <span className="font-medium">Parent:</span>{" "}
            <button
              onClick={() => onView(category.parentId!)}
              className="text-black hover:text-gray-600 hover:underline font-medium transition-colors"
            >
              #{category.parentId}
            </button>
          </div>
        )}
        {category.image && (
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            <span className="truncate">Has image</span>
          </div>
        )}
        <div className="col-span-2">
          <span className="font-medium">Created:</span> {formatDate}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
        <button 
          onClick={() => onEdit(category.id)}
          className="px-3 py-1 text-sm border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button 
          onClick={() => onDelete(category.id)}
          className="px-3 py-1 text-sm border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
});

CategoryCard.displayName = "CategoryCard";

export default function CategoriesTable({
  rows,
  pagination,
  sort,
  loading,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onChanged,
}: {
  rows: Category[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  loading: boolean;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (ps: number) => void;
  onSortChange?: (s: string) => void;
  onChanged?: () => void;
}) {
  const [openEditId, setOpenEditId] = React.useState<number | null>(null);
  const [openDeleteId, setOpenDeleteId] = React.useState<number | null>(null);
  const [openViewId, setOpenViewId] = React.useState<number | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = React.useState<string>("");
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [localSort, setLocalSort] = React.useState<string>(sort || "createdAt:desc");
  React.useEffect(() => setLocalSort(sort), [sort]);

  const toggleSort = React.useCallback((field: string) => {
    const [f, dir] = localSort.split(":");
    const next = f === field ? `${field}:${dir === "asc" ? "desc" : "asc"}` : `${field}:asc`;
    setLocalSort(next);
    onSortChange?.(next);
  }, [localSort, onSortChange]);

  const handleEdit = React.useCallback((id: number) => {
    setOpenEditId(id);
  }, []);

  const handleDelete = React.useCallback((id: number) => {
    const category = rows.find((r) => r.id === id);
    setDeleteCategoryName(category?.name || "");
    setOpenDeleteId(id);
  }, [rows]);

  const handleView = React.useCallback((id: number) => {
    setOpenViewId(id);
  }, []);

  // Lazy load rows - only render visible items
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 20 });
  
  React.useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(rows.length, 20) });
  }, [rows.length]);

  // Render visible rows only
  const visibleRows = React.useMemo(() => {
    return rows.slice(visibleRange.start, visibleRange.end);
  }, [rows, visibleRange]);

  // Load more on scroll (for mobile card view)
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (!isMobile || loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleRange.end < rows.length) {
          setVisibleRange((prev) => ({
            start: prev.start,
            end: Math.min(prev.end + 10, rows.length),
          }));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile, loading, visibleRange.end, rows.length]);

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("slug")}>
                <div className="flex items-center gap-1">
                  Slug
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="hidden lg:table-cell">Image</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("isActive")}>
                <div className="flex items-center gap-1">
                  Active
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                <div className="flex items-center gap-1">
                  Created
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading categories...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !rows?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm text-muted-foreground">Loading categories...</span>
          </div>
        ) : !rows?.length ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No categories found
          </div>
        ) : (
          <>
            {visibleRows.map((c) => (
              <CategoryCard
                key={c.id}
                category={c}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
            {visibleRange.end < rows.length && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-0 py-2">
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          <span className="hidden sm:inline">Page {pagination.page} of {pagination.totalPages} • </span>
          {pagination.total} records
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <select
            className="h-9 rounded-md border bg-background px-2 text-xs sm:text-sm w-full sm:w-auto"
            value={String(pagination.pageSize)}
            onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
            disabled={loading}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="h-9 w-9"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs sm:text-sm px-2">
              {pagination.page} / {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="h-9 w-9"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <EditCategoryModal
        open={!!openEditId}
        onClose={() => setOpenEditId(null)}
        categoryId={openEditId}
        onUpdated={() => {
          onChanged?.();
          setOpenEditId(null);
        }}
      />

      <DeleteCategoryModal
        open={!!openDeleteId}
        onClose={() => setOpenDeleteId(null)}
        categoryId={openDeleteId}
        categoryName={deleteCategoryName}
        onDeleted={() => {
          onChanged?.();
          setOpenDeleteId(null);
        }}
      />

      <CategoryViewSheet
        open={!!openViewId}
        onClose={() => setOpenViewId(null)}
        categoryId={openViewId}
      />
    </div>
  );
}
