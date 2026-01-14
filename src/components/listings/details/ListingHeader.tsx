import { Heart } from "lucide-react";

export default function ListingHeader() {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Wave Tee – Black
        </h1>

        <button className="rounded-full border p-2 hover:bg-muted">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <p className="text-2xl font-semibold text-pink-500">$59.00</p>

      <p className="text-sm text-muted-foreground">
        Only <span className="font-medium text-foreground">1 item</span> available
      </p>
    </div>
  );
}
