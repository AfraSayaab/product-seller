"use client";

import { useEffect, useState } from "react";
import { Heart, Share2 } from "lucide-react";

export default function ListingHeader({ listing }: { listing: any }) {
  const price = listing.currency
    ? `${listing.currency} ${listing.price}`
    : listing.price;

  const [liked, setLiked] = useState<boolean>(!!listing.favorited);
  const [loading, setLoading] = useState(false);
  const [favCount, setFavCount] = useState(listing._count?.favorites ?? 0);

  // 🔥 Sync if listing changes (navigation, refresh, etc.)
  useEffect(() => {
    setLiked(!!listing.favorited);
    setFavCount(listing._count?.favorites ?? 0);
  }, [listing.favorited, listing._count?.favorites]);

  const toggleFavourite = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let res;

      if (!liked) {
        res = await fetch("/api/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: listing.id }),
        });
      } else {
        res = await fetch(`/api/favourites/${listing.id}`, {
          method: "DELETE",
        });
      }

      const data = await res.json();
      if (!res.ok) {
        console.error("Favourite error:", data);
        return;
      }

      // ✅ optimistic UI update
      setLiked(!liked);
      setFavCount((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
    } catch (err) {
      console.error("toggleFavourite failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight hover:text-[#f6339a]">
            {listing.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listed on{" "}
            {listing.createdAt
              ? new Date(listing.createdAt).toLocaleDateString()
              : "—"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* ❤️ Favourite */}
          <button
            onClick={toggleFavourite}
            disabled={loading}
            className="group flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-all hover:border-transparent hover:bg-[#f6339a]"
            aria-label={liked ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart
              className={`h-5 w-5 transition ${
                liked
                  ? "fill-[#f6339a] text-[#f6339a]"
                  : "text-[#f6339a] group-hover:text-white"
              }`}
            />
          </button>

          {/* Share */}
          <button className="group flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-all hover:border-transparent hover:bg-[#f6339a]">
            <Share2 className="h-5 w-5 text-[#f6339a] transition group-hover:text-white" />
          </button>
        </div>
      </div>

      <p className="text-2xl font-semibold text-pink-500">{price}</p>

      <p className="text-sm text-muted-foreground">
        Favorites:{" "}
        <span className="font-medium text-foreground">{favCount}</span>
      </p>
    </div>
  );
}
