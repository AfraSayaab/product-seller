import Link from "next/link";

export default function SellerInfo({ user }: { user: any }) {
  const name =
    user?.displayPublicAs ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Seller";

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "";

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">Seller</p>

      <div className="mt-1 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </div>

        <Link
          href={`/user/${user?.id}?profile=true`}
          className="text-sm font-medium text-pink-500 hover:underline"
        >
          View all ads
        </Link>
      </div>
    </div>
  );
}
