"use client";

import * as React from "react";
import { Package, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/use-debounce";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
import ListingsTable from "@/components/listings/ListingsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ListingForm from "@/components/listings/ListingForm";

type Listing = {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  condition: string;
  status: string;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string; slug: string };
  location?: {
    id: number;
    country: string;
    state: string | null;
    city: string;
    area: string | null;
  };
  images?: Array<{ url: string; isPrimary: boolean }>;
  user?: { id: number; username: string; email: string };
};

type ListResponse = {
  items: Listing[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  q: string;
};

export default function AdminListingsPage() {
  const router = useRouter();
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

  const fetchListings = React.useCallback(
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
          `/api/listings?page=${page}&pageSize=${currentPageSize}&sort=${encodeURIComponent(
            currentSort
          )}&q=${encodeURIComponent(currentQ)}`
        );
        setData(res);
      } catch (e: any) {
        toast.error(e.message || "Failed to load listings");
      } finally {
        setLoading(false);
      }
    },
    [debounced]
  );

  React.useEffect(() => {
    fetchListings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, refreshKey]);

  const handlePageChange = React.useCallback((p: number) => {
    fetchListings(p);
  }, [fetchListings]);

  const handlePageSizeChange = React.useCallback((ps: number) => {
    fetchListings(1, ps);
  }, [fetchListings]);

  const handleSortChange = React.useCallback((s: string) => {
    fetchListings(1, undefined, s);
  }, [fetchListings]);

  const handleRefresh = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCreated = React.useCallback(() => {
    setOpenAdd(false);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="relative">
        {loading && <LoaderOverlay label="Fetching listings..." />}
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Listings</CardTitle>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search listings…"
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
                  <span className="hidden sm:inline">Add Listing</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-6">
            <ListingsTable
              rows={data.items}
              pagination={data.pagination}
              sort={data.sort}
              loading={loading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onChanged={handleRefresh}
              isAdmin={true}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
          </DialogHeader>
          <ListingForm
            onSuccess={handleCreated}
            onCancel={() => setOpenAdd(false)}
            isAdmin={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
