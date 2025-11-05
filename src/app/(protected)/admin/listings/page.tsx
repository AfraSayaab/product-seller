"use client";

import * as React from "react";
import { Tags, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/use-debounce";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderOverlay from "@/components/ui/LoaderOverlay";

import CategoriesTable from "@/components/admin/categories/CategoriesTable";
import AddCategoryModal from "@/components/admin/categories/AddCategoryModal";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  image: string | null;
  createdById?: number;
  createdAt?: string;
  attributeSchema?: Record<string, any>;
  createdBy?: { id: number; username: string; email: string };
};

type ListResponse = {
  items: Category[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  q: string;
};

export default function CategoryPage() {
  const [query, setQuery] = React.useState("");
  const debounced = useDebounce(query, 400);

  const [loading, setLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [openAdd, setOpenAdd] = React.useState(false);

  const [data, setData] = React.useState<ListResponse>({
    items: [],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    sort: "createdAt:desc",
    q: "",
  });

  // Use refs to track pagination state to prevent infinite loops
  const paginationRef = React.useRef(data.pagination);
  const sortRef = React.useRef(data.sort);
  
  React.useEffect(() => {
    paginationRef.current = data.pagination;
    sortRef.current = data.sort;
  }, [data.pagination, data.sort]);

  const fetchCategories = React.useCallback(
    async (
      page = 1,
      pageSize?: number,
      sort?: string,
      q?: string
    ) => {
      setLoading(true);
      try {
        const currentPageSize = pageSize ?? paginationRef.current.pageSize;
        const currentSort = sort ?? sortRef.current;
        const currentQ = q ?? debounced;

        const res = await api<ListResponse>(
          `/api/admin/categories?page=${page}&pageSize=${currentPageSize}&sort=${encodeURIComponent(
            currentSort
          )}&q=${encodeURIComponent(currentQ)}`
        );
        setData(res);
      } catch (e: any) {
        toast.error(e.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    },
    [debounced]
  );

  React.useEffect(() => {
    fetchCategories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, refreshKey]);

  const handlePageChange = React.useCallback((p: number) => {
    fetchCategories(p);
  }, [fetchCategories]);

  const handlePageSizeChange = React.useCallback((ps: number) => {
    fetchCategories(1, ps);
  }, [fetchCategories]);

  const handleSortChange = React.useCallback((s: string) => {
    fetchCategories(1, undefined, s);
  }, [fetchCategories]);

  const handleRefresh = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCreated = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="relative">
        {loading && <LoaderOverlay label="Fetching categories..." />}
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              <CardTitle>Categories</CardTitle>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search categories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex-1 sm:flex-initial"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> 
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button 
                  onClick={() => setOpenAdd(true)}
                  className="flex-1 sm:flex-initial"
                >
                  <Plus className="h-4 w-4 mr-2" /> 
                  <span className="hidden sm:inline">Add Category</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-6">
            <CategoriesTable
              rows={data.items}
              pagination={data.pagination}
              sort={data.sort}
              loading={loading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onChanged={handleRefresh}
            />
          </CardContent>
        </Card>
      </div>

      <AddCategoryModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onCreated={handleCreated}
      />
    </div>
  );
}
