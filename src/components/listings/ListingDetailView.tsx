import ImageGallery from "./media/ImageGallery";
import ListingHeader from "./details/ListingHeader";
import ListingSize from "./details/ListingSize";
import ListingActions from "./details/ListingActions";
import SafetyTips from "./details/SafetyTips";
import ListingDescription from "./details/ListingDescription";
import ContactInfo from "./details/ContactInfo";
import RelatedItems from "./related/RelatedItems";
import SellerInfo from "./seller/SellerInfo";


export default function ListingDetailView() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
        {/* IMAGE SIDE (BIGGER) */}
        <ImageGallery />

        {/* DETAILS SIDE */}
        <div className="space-y-8">
          <ListingHeader />
          <ListingSize />
          <ListingActions />
          <SellerInfo />
          <ListingDescription />
          <ContactInfo />
          <SafetyTips />
        </div>
      </div>
      <RelatedItems />
    </section>
  );
}
