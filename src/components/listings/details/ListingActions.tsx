"use client";

import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Tag } from "lucide-react";

type ListingActionsProps = {
  listing: any; // replace with your type later
};

export default function ListingActions({ listing }: ListingActionsProps) {
  const sellerEmail = listing?.user?.email;
  const sellerId = listing?.user?.id;
  const listingId = listing?.id;

  const handleSendMessage = () => {
    // Example: route to your chat thread create page
    // you can change this to whatever your messaging flow is
    window.location.href = `/messages/new?listingId=${listingId}&sellerId=${sellerId}`;
  };

  const handleSendOffer = () => {
    // Example: route to your offer page/modal
    window.location.href = `/offers/new?listingId=${listingId}`;
  };

  return (
    <div className="space-y-3">
      <Button
        className="w-full bg-pink-500 hover:bg-pink-600"
        asChild
        disabled={!sellerEmail}
      >
        <a href={sellerEmail ? `mailto:${sellerEmail}?subject=${encodeURIComponent(`Inquiry about: ${listing?.title || "Listing"}`)}` : "#"}>
          <Mail className="mr-2 h-4 w-4" />
          Email Seller
        </a>
      </Button>

      {/* <Button
        variant="outline"
        className="w-full"
        onClick={handleSendMessage}
        disabled={!sellerId || !listingId}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Send Message
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleSendOffer}
        disabled={!listingId}
      >
        <Tag className="mr-2 h-4 w-4" />
        Send Offer
      </Button> */}
    </div>
  );
}
