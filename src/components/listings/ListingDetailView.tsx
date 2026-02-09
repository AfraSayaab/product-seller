import ImageGallery from "./media/ImageGallery";
import ListingHeader from "./details/ListingHeader";
import ListingActions from "./details/ListingActions";
import SafetyTips from "./details/SafetyTips";
import ListingDescription from "./details/ListingDescription";
import ContactInfo from "./details/ContactInfo";
import RelatedItems from "./related/RelatedItems";
import SellerInfo from "./seller/SellerInfo";

export default function ListingDetailView({ listing }: { listing: any }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ImageGallery images={listing.images} title={listing.title} />
          <ContactInfo listing={listing} />
        </div>

        <div className="space-y-8">
          <ListingHeader listing={listing} />
          <ListingActions listing={listing} />
          <SellerInfo user={listing.user} />
          <ListingDescription description={listing.description} />
          <SafetyTips />
        </div>
      </div>

      <RelatedItems
        excludeId={listing.id}
        categorySlug={listing?.category?.slug}   // ✅ correct
      />
    </section>
  );
}
