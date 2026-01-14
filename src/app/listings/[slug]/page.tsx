import { HeaderLayout } from "@/components/Header/header";
import Footer from "@/components/Footer";
import ListingDetailView from "@/components/listings/ListingDetailView";

export default function ListingDetail() {
  return (
    <>
      <HeaderLayout />

      <main className="min-h-screen bg-background">
        <ListingDetailView />
      </main>

      <Footer />
    </>
  );
}
