import MetaRow from "./MetaRow";
import ListingTags from "./ListingTags";

export default function ContactInfo() {
  return (
    <section className="rounded-xl border bg-background p-5 mt-4">
      <h3 className="mb-4 text-lg font-semibold">
        Contact Information
      </h3>

      <div className="space-y-3">
        <MetaRow label="Phone" value="07525052533" />
        <MetaRow label="Email" value="sarahakbar@hotmail.co.uk" />
        <MetaRow label="Category" value="Women" />
        <MetaRow label="Address" value="12, Greater Manchester" />

        <div className="pt-3">
          <span className="mb-2 block text-sm font-medium text-muted-foreground">
            Listing Tags:
          </span>

          <ListingTags
            tags={[
              "pakistani",
              "red-bridal-dress",
              "red-dupatta",
              "red-and-gold",
              "suffuse",
              "suffusebysanayasir",
              "dupatta",
              "asianbridal",
              "heavy-embroidery-gown",
              "bridaldress",
              "can-can",
            ]}
          />
        </div>
      </div>
    </section>
  );
}
