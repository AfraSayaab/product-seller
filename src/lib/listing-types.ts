export type PublicListingDTO = {
  id: number;
  title: string;
  slug: string;
  price: string; // Decimal -> string
  currency: string;
  isFeatured: boolean;
  isSpotlight: boolean;
  featuredUntil: string | null;
  bumpedAt: string | null;
  createdAt: string;

  category: { id: number; name: string; slug: string } | null;
  location: { country: string; state: string | null; city: string; area: string | null } | null;

  primaryImageUrl: string | null;
};

export type PublicListingsResponse = {
  data: PublicListingDTO[];
  meta: {
    limit: number;
    nextCursor: string | null;
    totalReturned: number;
  };
};
