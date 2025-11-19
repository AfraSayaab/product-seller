"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import FavouriteListingCard from "@/components/user/FavouriteListingCard";

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
  favoritedAt: string;
  category?: { id: number; name: string; slug: string };
  location?: {
    id: number;
    country: string;
    state: string | null;
    city: string;
    area: string | null;
  };
  images?: Array<{ url: string; isPrimary: boolean }>;
};

type FavouritesResponse = {
  items: Listing[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export default function UserFavouritePage() {
  const [favourites, setFavourites] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchFavourites = React.useCallback(async (page: number, pageSize: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await api<FavouritesResponse>(`/api/favourites?page=${page}&pageSize=${pageSize}`);
      setFavourites(res.items);
      setPagination(res.pagination);
    } catch (error: any) {
      setError(true);
      toast.error("Failed to load favourites", {
        description: error.message || "Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFavourites(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize, fetchFavourites]);

  const handleRemove = React.useCallback((listingId: number) => {
    setFavourites((prev) => prev.filter((item) => item.id !== listingId));
    setPagination((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
    }));
  }, []);

  const handlePageChange = React.useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Favourite Items</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total > 0
              ? `${pagination.total} ${pagination.total === 1 ? "item" : "items"} saved`
              : "No favourites yet"}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Loading your favourites...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Unable to load favourites.</p>
            <Button variant="outline" onClick={() => fetchFavourites(pagination.page, pagination.pageSize)}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : favourites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No favourites yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Start saving your favourite listings by clicking the heart icon on any listing.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favourites.map((listing) => (
              <FavouriteListingCard key={listing.id} listing={listing} onRemove={handleRemove} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} items
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}