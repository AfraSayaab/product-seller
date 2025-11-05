"use client";

import * as React from "react";
import { CreditCard, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/use-debounce";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderOverlay from "@/components/ui/LoaderOverlay";

import PlansTable from "@/components/admin/plans/PlansTable";
import AddPlanModal from "@/components/admin/plans/AddPlanModal";

type Plan = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  durationDays: number;
  maxActiveListings: number;
  quotaListings: number;
  quotaPhotosPerListing: number;
  quotaVideosPerListing: number;
  quotaBumps: number;
  quotaFeaturedDays: number;
  maxCategories: number;
  isSticky: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  _count?: { subscriptions: number };
};

type ListResponse = {
  items: Plan[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  q: string;
};

export default function PlansPage() {
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

  const fetchPlans = React.useCallback(
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
          `/api/admin/plans?page=${page}&pageSize=${currentPageSize}&sort=${encodeURIComponent(
            currentSort
          )}&q=${encodeURIComponent(currentQ)}`
        );
        setData(res);
      } catch (e: any) {
        toast.error(e.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    },
    [debounced]
  );

  React.useEffect(() => {
    fetchPlans(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, refreshKey]);

  const handlePageChange = React.useCallback((p: number) => {
    fetchPlans(p);
  }, [fetchPlans]);

  const handlePageSizeChange = React.useCallback((ps: number) => {
    fetchPlans(1, ps);
  }, [fetchPlans]);

  const handleSortChange = React.useCallback((s: string) => {
    fetchPlans(1, undefined, s);
  }, [fetchPlans]);

  const handleRefresh = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCreated = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="relative">
        {loading && <LoaderOverlay label="Fetching plans..." />}
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Plans</CardTitle>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search plans…"
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
                  <span className="hidden sm:inline">Add Plan</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-6">
            <PlansTable
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

      <AddPlanModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onCreated={handleCreated}
      />
    </div>
  );
}

