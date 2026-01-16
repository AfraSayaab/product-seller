import Link from "next/link";

interface SellerInfoProps {
  sellerName: string; // dynamic seller name
  memberSince: string;
}

export default function SellerInfo({ sellerName, memberSince }: SellerInfoProps) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">Seller</p>

      <div className="mt-1 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">{sellerName}</p>
          <p className="text-sm text-muted-foreground">
            Member since {memberSince}
          </p>
        </div>

        <Link
      href={`/author/Shanice?profile=true`}
        
          className="text-sm font-medium text-pink-500 hover:underline"
        >
          View all ads
        </Link>
      </div>
    </div>
  );
}
