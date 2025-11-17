"use client";

import * as React from "react";
import { Package, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/use-debounce";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

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
import type { ListResponse } from "@/types/listings";

export default function UserListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const paginationRef = React.useRef(data.pagination);
  const sortRef = React.useRef(data.sort);

  React.useEffect(() => {
    paginationRef.current = data.pagination;
    sortRef.current = data.sort;
  }, [data.pagination, data.sort]);

  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await api<{ id: number }>("/api/auth/me");
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        toast.error("Could not load your profile. Please refresh.");
      }
    };
    fetchCurrentUser();
  }, []);

  React.useEffect(() => {
    if (searchParams?.get("create") === "1") {
      setOpenAdd(true);
      router.replace("/user/listings", { scroll: false });
    }
  }, [router, searchParams]);

  const fetchListings = React.useCallback(
    async (page = 1, pageSize?: number, sort?: string, q?: string) => {
      if (!currentUserId) return;

      setLoading(true);
      try {
        const currentPageSize = pageSize ?? paginationRef.current.pageSize;
        const currentSort = sort ?? sortRef.current;
        const currentQ = q ?? debounced;

        const res = await api<ListResponse>(
          `/api/listings?page=${page}&pageSize=${currentPageSize}&sort=${encodeURIComponent(
            currentSort
          )}&q=${encodeURIComponent(currentQ)}&userId=${currentUserId}`
        );
        setData(res);
      } catch (e: any) {
        toast.error(e.message || "Failed to load listings");
      } finally {
        setLoading(false);
      }
    },
    [debounced, currentUserId]
  );

  React.useEffect(() => {
    if (currentUserId) {
      fetchListings(1);
    }
  }, [currentUserId, refreshKey, fetchListings]);

  const handlePageChange = React.useCallback(
    (p: number) => {
      fetchListings(p);
    },
    [fetchListings]
  );

  const handlePageSizeChange = React.useCallback(
    (ps: number) => {
      fetchListings(1, ps);
    },
    [fetchListings]
  );

  const handleSortChange = React.useCallback(
    (s: string) => {
      fetchListings(1, undefined, s);
    },
    [fetchListings]
  );

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
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>My listings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage and optimize every listing from one place
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Search my listings…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-72"
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button onClick={() => setOpenAdd(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create listing
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
              isAdmin={false}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
          </DialogHeader>
          <ListingForm
            onSuccess={handleCreated}
            onCancel={() => setOpenAdd(false)}
            isAdmin={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

