"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
import ListingForm from "@/components/listings/ListingForm";

export default function AdminEditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = Number(params.id);
  const [loading, setLoading] = React.useState(true);
  const [listing, setListing] = React.useState<any>(null);

  React.useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      toast.error("Invalid listing ID");
      router.push("/admin/listings");
      return;
    }

    const fetchListing = async () => {
      try {
        const data = await api(`/api/listings/${listingId}`);
        setListing(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load listing");
        router.push("/admin/listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, router]);

  const handleSuccess = () => {
    router.push("/admin/listings");
  };

  const handleCancel = () => {
    router.push("/admin/listings");
  };

  if (loading) {
    return <LoaderOverlay label="Loading listing..." />;
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm
            initialData={{
              categoryId: listing.categoryId,
              location: listing.location ? {
                ...listing.location,
                lat: listing.location.lat ? Number(listing.location.lat) : null,
                lng: listing.location.lng ? Number(listing.location.lng) : null,
              } : null,
              title: listing.title,
              description: listing.description,
              price: Number(listing.price),
              currency: listing.currency,
              condition: listing.condition,
              negotiable: listing.negotiable,
              status: listing.status,
              isPhoneVisible: listing.isPhoneVisible,
              images: listing.images || [],
            }}
            listingId={listingId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isAdmin={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

