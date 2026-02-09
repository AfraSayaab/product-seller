"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MapPin, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SellerListingCard = {
  id: number;
  slug: string;
  title: string;
  price: string;
  currency: string;
  createdAt: string;
  primaryImageUrl: string | null;
  category?: { name: string; slug: string } | null;
  location?: { city?: string | null; state?: string | null; country?: string | null; area?: string | null } | null;
};

type ApiResp = {
  success: boolean;
  data: SellerListingCard[];
  meta: { total: number; page: number; limit: number; hasMore: boolean };
  message?: string;
};

function money(price: string, currency: string) {
  return `£ ${price}`;
}

function formatLoc(l?: SellerListingCard["location"]) {
  if (!l) return "";
  return [l.area, l.city, l.state, l.country].filter(Boolean).join(", ");
}

export default function SellerOtherItems({
  userId,
  username,
}: {
  userId: number;
  username?: string;
}) {
  const LIMIT = 12;

  const [items, setItems] = React.useState<SellerListingCard[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load(p: number, mode: "replace" | "append") {
    try {
      mode === "replace" ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const res = await fetch(`/api/listings/public-listing/${userId}?page=${p}&limit=${LIMIT}`, {
        cache: "no-store",
      });
      const json: ApiResp = await res.json();

      if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to load");

      setHasMore(json.meta.hasMore);
      setPage(json.meta.page);

      setItems((prev) => (mode === "append" ? [...prev, ...(json.data || [])] : (json.data || [])));
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  React.useEffect(() => {
    load(1, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-gray-100 rounded-2xl shadow-lg">
      <h3 className="mb-6 text-xl font-serif font-bold text-black">
        More from {username || "this seller"}
      </h3>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => (
              <Card key={i} className="h-[320px] rounded-2xl" />
            ))
          : items.map((item) => (
              <Card
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background shadow-sm transition hover:shadow-lg"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={item.primaryImageUrl ?? "/hero-image1.webp"}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw"
                  />

                  <Badge className="absolute left-3 top-3 bg-pink-500 text-white">
                    {money(item.price, item.currency)}
                  </Badge>

                  <button
                    type="button"
                    className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white transition hover:bg-pink-500"
                    aria-label="Bookmark"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  <span className="inline-block rounded-md border-black px-2 text-xs text-black">
                    {item.category?.name || "—"}
                  </span>

                  <h4 className="line-clamp-1 text-sm font-semibold text-black">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-pink-500" />
                      {formatLoc(item.location) || "—"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-pink-500" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                    </div>
                  </div>

                  <Link
                    href={`/listings/${item.id}`}
                    className="block w-full rounded-lg bg-pink-500 py-2 text-center text-sm font-medium text-white transition hover:bg-pink-600"
                  >
                    View Details
                  </Link>
                </div>
              </Card>
            ))}
      </div>

      {!loading && (
        <div className="mt-8 flex justify-center">
          {hasMore ? (
            <Button
              onClick={() => load(page + 1, "append")}
              disabled={loadingMore}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          ) : (
            <p className="text-sm text-gray-500">No more items.</p>
          )}
        </div>
      )}
    </div>
  );
}
