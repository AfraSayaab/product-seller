import Link from "next/link";

export default function SellerInfo() {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">Seller</p>

      <div className="mt-1 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">Moby78695</p>
          <p className="text-sm text-muted-foreground">
            Member since Sep 08, 2024
          </p>
        </div>

        <Link
          href="/seller/moby78695"
          className="text-sm font-medium text-pink-500 hover:underline"
        >
          View all ads
        </Link>
      </div>
    </div>
  );
}
