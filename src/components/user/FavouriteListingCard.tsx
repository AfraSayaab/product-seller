"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

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

type FavouriteListingCardProps = {
  listing: Listing;
  onRemove: (listingId: number) => void;
};

const CONDITION_COLORS: Record<string, string> = {
  NEW: "bg-green-500/10 text-green-700 dark:text-green-400",
  LIKE_NEW: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  USED: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  FOR_PARTS: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 dark:text-green-400",
  PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  DRAFT: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  SOLD: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  EXPIRED: "bg-red-500/10 text-red-700 dark:text-red-400",
  PAUSED: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export default function FavouriteListingCard({ listing, onRemove }: FavouriteListingCardProps) {
  const router = useRouter();
  const [removing, setRemoving] = React.useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (removing) return;

    try {
      setRemoving(true);
      await api(`/api/favourites/${listing.id}`, { method: "DELETE" });
      toast.success("Removed from favourites", {
        description: `${listing.title} has been removed from your favourites.`,
      });
      onRemove(listing.id);
    } catch (error: any) {
      toast.error("Failed to remove favourite", {
        description: error.message || "Please try again.",
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/listings/${listing.slug}`);
  };

  const primaryImage = listing.images?.find((img) => img.isPrimary) || listing.images?.[0];
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: listing.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(listing.price);

  const locationText = listing.location
    ? [listing.location.city, listing.location.state, listing.location.country].filter(Boolean).join(", ")
    : null;

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Image */}
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage.url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Tag className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* Remove button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-lg"
          onClick={handleRemove}
          disabled={removing}
        >
          <Heart className={`h-4 w-4 ${removing ? "animate-pulse" : ""}`} fill="currentColor" />
        </Button>

        {/* Status badge */}
        {listing.status && (
          <div className="absolute left-2 top-2">
            <Badge className={STATUS_COLORS[listing.status] || STATUS_COLORS.DRAFT}>{listing.status}</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">{listing.title}</h3>

        {/* Price */}
        <div className="mb-3 text-xl font-bold text-primary">{formattedPrice}</div>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {/* Condition */}
          {listing.condition && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={CONDITION_COLORS[listing.condition] || CONDITION_COLORS.USED}>
                {listing.condition.replace("_", " ")}
              </Badge>
            </div>
          )}

          {/* Category */}
          {listing.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              <span className="truncate">{listing.category.name}</span>
            </div>
          )}

          {/* Location */}
          {locationText && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{listing.viewsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              <span>{listing.favoritesCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

