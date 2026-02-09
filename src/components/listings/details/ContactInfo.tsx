import MetaRow from "./MetaRow";
import ListingTags from "./ListingTags";

type ContactInfoProps = {
  listing: any;
};

function buildAddress(location: any) {
  if (!location) return "";
  const parts = [location.area, location.city, location.state, location.country].filter(Boolean);
  return parts.join(", ");
}

function buildCategory(category: any) {
  if (!category) return "";
  // Example: "Women / Dresses"
  const parts = [category.parent?.name, category.name].filter(Boolean);
  return parts.join(" / ");
}

export default function ContactInfo({ listing }: ContactInfoProps) {
  const phone =
    listing?.isPhoneVisible ? listing?.user?.phone : "Hidden by seller";
  const email = listing?.user?.email || "";
  const category = buildCategory(listing?.category);
  const address = buildAddress(listing?.location);

  // pick tags from a few possible places
  const tags: string[] =
    listing?.attributes?.tags ||
    listing?.tags ||
    [];

  return (
    <section className="rounded-xl border bg-background p-5 mt-4">
      <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>

      <div className="space-y-3">
        <MetaRow label="Phone" value={phone || "—"} />
        <MetaRow label="Email" value={email || "—"} />
        <MetaRow label="Category" value={category || "—"} />
        <MetaRow label="Address" value={address || "—"} />

        {tags?.length > 0 && (
          <div className="pt-3">
            <span className="mb-2 block text-sm font-medium text-muted-foreground">
              Listing Tags:
            </span>

            <ListingTags tags={tags} />
          </div>
        )}
      </div>
    </section>
  );
}
