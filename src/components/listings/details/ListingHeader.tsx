import { Heart, Share2 } from "lucide-react";

export default function ListingHeader() {
  return (
    <div className="space-y-4">
      {/* TITLE + ACTIONS */}
      <div className="flex items-start justify-between gap-4">
        {/* LEFT: TITLE + DATE */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight hover:text-[#f6339a]">
            Wave Tee – Black
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listed on 21 September, 2025
          </p>
        </div>

        {/* RIGHT: ICON ACTIONS */}
        <div className="flex items-center gap-2">
          {/* HEART */}
          <button
            aria-label="Save item"
            className="group flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-all hover:border-transparent hover:bg-[#f6339a]"
          >
            <Heart className="h-5 w-5 text-[#f6339a] transition group-hover:text-white" />
          </button>

          {/* SHARE */}
          <button
            aria-label="Share item"
            className="group flex h-10 w-10 items-center justify-center rounded-lg border bg-white transition-all hover:border-transparent hover:bg-[#f6339a]"
          >
            <Share2 className="h-5 w-5 text-[#f6339a] transition group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* PRICE */}
      <p className="text-2xl font-semibold text-pink-500">$59.00</p>

      {/* STOCK INFO */}
      <p className="text-sm text-muted-foreground">
        Only <span className="font-medium text-foreground">1 item</span> available
      </p>
    </div>
  );
}
