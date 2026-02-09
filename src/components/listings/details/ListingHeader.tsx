import { Heart, Share2 } from "lucide-react";

export default function ListingHeader({ listing }: { listing: any }) {
  const price = listing.currency ? `${listing.currency} ${listing.price}` : listing.price;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight hover:text-[#f6339a]">
            {listing.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listed on {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="group flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-all hover:border-transparent hover:bg-[#f6339a]">
            <Heart className="h-5 w-5 text-[#f6339a] transition group-hover:text-white" />
          </button>

          <button className="group flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-all hover:border-transparent hover:bg-[#f6339a]">
            <Share2 className="h-5 w-5 text-[#f6339a] transition group-hover:text-white" />
          </button>
        </div>
      </div>

      <p className="text-2xl font-semibold text-pink-500">{price}</p>

      <p className="text-sm text-muted-foreground">
        Favorites: <span className="font-medium text-foreground">{listing._count?.favorites ?? 0}</span>
      </p>
    </div>
  );
}
