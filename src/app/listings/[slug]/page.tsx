import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";
import ListingDetailView from "@/components/listings/ListingDetailView";
import { notFound } from "next/navigation";

type ApiResponse<T> = { success: boolean; data?: T; message?: string };

async function getListing(id: string): Promise<ApiResponse<any> | null> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const res = await fetch(`${base}/api/listings/${id}`, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load listing");

  return res.json();
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const payload = await getListing(slug);

  // ✅ correct guard for YOUR payload shape
  if (!payload?.success || !payload?.data) notFound();

  return (
    <>
      <HeaderLayout />
      <main className="min-h-screen bg-background">
        <ListingDetailView listing={payload.data} />
      </main>
      <Footer />
    </>
  );
}
