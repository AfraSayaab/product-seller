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
import AddCategoryDialog from "@/components/admin/categories/AddCategoryDialog";

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

  const fetchCategories = React.useCallback(
    async (
      page = 1,
      pageSize = data.pagination.pageSize,
      sort = data.sort,
      q = debounced
    ) => {
      setLoading(true);
      try {
        const res = await api<ListResponse>(
          `/api/admin/categories?page=${page}&pageSize=${pageSize}&sort=${encodeURIComponent(
            sort
          )}&q=${encodeURIComponent(q)}`
        );
        setData(res);
      } catch (e: any) {
        toast.error(e.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    },
    [debounced, data.pagination.pageSize, data.sort]
  );

  React.useEffect(() => {
    fetchCategories(1);
  }, [debounced, refreshKey]);

  return (
    <div className="flex flex-col gap-4">
      {loading && <LoaderOverlay label="Fetching categories..." />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            <CardTitle>Categories</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search categories (name/slug)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64"
            />
            <Button
              variant="outline"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <CategoriesTable
            rows={data.items}
            pagination={data.pagination}
            sort={data.sort}
            loading={loading}
            onPageChange={(p: number) => fetchCategories(p)}
            onPageSizeChange={(ps: number) =>
              fetchCategories(1, ps, data.sort, debounced)
            }
            onSortChange={(s: string) => fetchCategories(1, data.pagination.pageSize, s)}
            onChanged={() => setRefreshKey((k) => k + 1)}
          />
        </CardContent>
      </Card>

      <AddCategoryDialog
        open={openAdd}
        onOpenChange={setOpenAdd}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
