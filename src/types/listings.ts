export type ListingLocation = {
  id: number;
  country: string;
  state: string | null;
  city: string;
  area: string | null;
};

export type ListingImage = {
  url: string;
  isPrimary: boolean;
};

export type Listing = {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  condition: string;
  status: string;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string; slug: string };
  location?: ListingLocation;
  images?: ListingImage[];
};

export type ListResponse = {
  items: Listing[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sort: string;
  q: string;
};

export type DashboardUser = {
  id: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type UserListingMetrics = {
  totals: {
    totalListings: number;
    active: number;
    draft: number;
    pending: number;
    sold: number;
    totalViews: number;
    totalFavorites: number;
    avgViewsPerListing: number;
    engagementRate: number;
    statusBreakdown: Record<string, number>;
  };
  monthlyTrend: Array<{
    month: string;
    listings: number;
    views: number;
    favorites: number;
  }>;
  topFavorites: Array<{
    id: number;
    title: string;
    status: string;
    price: number;
    currency: string;
    favoritesCount: number;
    viewsCount: number;
    createdAt: string;
    primaryImage: string | null;
  }>;
  recentListings: Array<{
    id: number;
    title: string;
    status: string;
    price: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    viewsCount: number;
    favoritesCount: number;
  }>;
};

