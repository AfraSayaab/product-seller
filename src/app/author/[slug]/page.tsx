import Footer from "@/components/Footer";
import { HeaderLayout } from "@/components/Header/header";
import SellerDetailInfo from "@/components/Seller/SellerDetailInfo";
import SellerOtherItems from "@/components/Seller/SellerOtherItems";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

async function getAbsoluteUrl(path: string) {
  const h = await headers(); // ✅ IMPORTANT: headers() is async in your Next version

  const protocol = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");

  // fallback for dev edge cases
  const safeHost = host || "localhost:3000";

  return `${protocol}://${safeHost}${path}`;
}

async function fetchJson(path: string) {
  const url = await getAbsoluteUrl(path); // ✅ absolute URL
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load: ${path}`);

  return res.json();
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // slug = "1"

  // ✅ Your user detail API (make sure this path exists)
  const profile = await fetchJson(`/api/user/${slug}`);

  // if (!profile?.success || !profile?.data) notFound();

  const user = profile.data;

  return (
    <>
      <HeaderLayout />
      <main className="min-h-screen bg-background">
        <SellerDetailInfo user={user} />

        {/* ✅ this stays client-side and paginated */}
        <SellerOtherItems userId={user.id} username={user.username} />
      </main>
      <Footer />
    </>
  );
}
