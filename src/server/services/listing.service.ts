import { prisma } from "@/lib/db";
import { ensureUniqueListingSlug, slugify } from "@/lib/slug";
import type { Prisma } from "@prisma/client";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

type ListParams = {
  q?: string;
  userId?: number;
  categoryId?: number;
  categoryIds?: number[];
  status?: string;
  condition?: string;
  conditions?: string[];
  currency?: string;
  currencies?: string[];
  minPrice?: number;
  maxPrice?: number;
  negotiable?: boolean;
  isPhoneVisible?: boolean;
  locationId?: number;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sortByDistance?: boolean;
  page: number;
  pageSize: number;
  orderBy?: any;
};

export const ListingService = {
  async list(params: ListParams) {
    const {
      q,
      userId,
      categoryId,
      categoryIds,
      status,
      condition,
      conditions,
      currency,
      currencies,
      minPrice,
      maxPrice,
      negotiable,
      isPhoneVisible,
      locationId,
      country,
      state,
      city,
      area,
      lat,
      lng,
      radius = 50,
      sortByDistance = false,
      page,
      pageSize,
      orderBy = [{ createdAt: "desc" }] as any,
    } = params;

    const where: any = {
      deletedAt: null, // Only show non-deleted listings
    };

    // Default to ACTIVE status for public listings if not specified
    if (status) {
      where.status = status;
    } 

    // Search query - Enhanced search in title, description, and attributes
    if (q && q.length > 0) {
      const qSlug = slugify(q);
      const searchMode = "insensitive" as const;
      where.OR = [
        { title: { contains: q, mode: searchMode } },
        { description: { contains: q, mode: searchMode } },
        { slug: { contains: qSlug } },
        // Search in category name
        { category: { name: { contains: q, mode: searchMode } } },
        // Search in location
        { location: { city: { contains: q, mode: searchMode } } },
        { location: { area: { contains: q, mode: searchMode } } },
      ];
    }

    // User filter
    if (typeof userId === "number") where.userId = userId;

    // Category filters - support single or multiple categories
    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    } else if (typeof categoryId === "number") {
      where.categoryId = categoryId;
    }

    // Condition filters - support single or multiple conditions
    if (conditions && conditions.length > 0) {
      where.condition = { in: conditions };
    } else if (condition) {
      where.condition = condition;
    }

    // Currency filters - support single or multiple currencies
    if (currencies && currencies.length > 0) {
      where.currency = { in: currencies };
    } else if (currency) {
      where.currency = currency;
    }

    // Negotiable filter
    if (typeof negotiable === "boolean") where.negotiable = negotiable;

    // Phone visibility filter
    if (typeof isPhoneVisible === "boolean") where.isPhoneVisible = isPhoneVisible;

    // Location filters - by ID
    if (typeof locationId === "number") {
      where.locationId = locationId;
    }

    // Location filters - by location details (country, state, city, area)
    const locationWhere: any = {};
    const searchMode = "insensitive" as const;
    if (country) locationWhere.country = country;
    if (state) locationWhere.state = { contains: state, mode: searchMode };
    if (city) locationWhere.city = { contains: city, mode: searchMode };
    if (area) locationWhere.area = { contains: area, mode: searchMode };

    // If location filters are provided, add location relation filter
    if (Object.keys(locationWhere).length > 0) {
      where.location = locationWhere;
    }

    // Price range filter
    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      where.price = {};
      if (typeof minPrice === "number") where.price.gte = minPrice;
      if (typeof maxPrice === "number") where.price.lte = maxPrice;
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Fetch listings with all filters
    const [total, items] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          location: {
            select: {
              id: true,
              country: true,
              state: true,
              city: true,
              area: true,
              lat: true,
              lng: true,
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              url: true,
              isPrimary: true,
              sortOrder: true,
            },
          },
          _count: {
            select: {
              favorites: true,
              threads: true,
            },
          },
        },
      }),
    ]);

    // Calculate distance and filter by radius if lat/lng provided
    let filteredItems: (typeof items[0] & { distance?: number | null })[] = items;
    if (typeof lat === "number" && typeof lng === "number") {
      filteredItems = items
        .map((item) => {
          if (item.location?.lat && item.location?.lng) {
            const itemLat = Number(item.location.lat);
            const itemLng = Number(item.location.lng);
            const distance = calculateDistance(lat, lng, itemLat, itemLng);
            return { ...item, distance };
          }
          return { ...item, distance: null };
        })
        .filter((item) => {
          // Filter by radius if distance is calculated
          if (item.distance !== null && item.distance !== undefined) {
            return item.distance <= radius;
          }
          // If no location data, include it (or exclude based on requirement)
          return true; // Change to false if you want to exclude listings without location
        });

      // Sort by distance if requested
      if (sortByDistance) {
        filteredItems.sort((a, b) => {
          const distA = a.distance ?? null;
          const distB = b.distance ?? null;
          if (distA === null) return 1;
          if (distB === null) return -1;
          return distA - distB;
        });
      }
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      pagination: { total, page, pageSize, totalPages },
      items: filteredItems,
      filters: {
        hasLocationFilter: typeof lat === "number" && typeof lng === "number",
        radius: typeof lat === "number" && typeof lng === "number" ? radius : undefined,
      },
    };
  },

  async getById(id: number) {
    return prisma.listing.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            website: true,
            whatsapp: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            country: true,
            state: true,
            city: true,
            area: true,
            lat: true,
            lng: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            favorites: true,
            threads: true,
            reports: true,
          },
        },
      },
    });
  },

  async create(data: {
    userId: number;
    categoryId: number;
    locationId?: number | null;
    location?: {
      country: string;
      state?: string | null;
      city: string;
      area?: string | null;
      lat?: number | null;
      lng?: number | null;
    } | null;
    title: string;
    description: string;
    price: number;
    currency: string;
    condition: string;
    negotiable?: boolean;
    attributes?: any;
    status?: string;
    isPhoneVisible?: boolean;
    isFeatured?: boolean;
    isSpotlight?: boolean;
    images?: Array<{
      url: string;
      sortOrder?: number;
      isPrimary?: boolean;
    }>;
  }) {
    // Check user role and apply plan validations for non-admin users
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Store subscription ID for quota decrement after successful creation (only for non-admin)
    let subscriptionIdForQuota: number | null = null;

    // Apply plan checks only for non-admin users
    if (user.role !== "ADMIN") {
      // Get user's active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: data.userId,
          status: "ACTIVE",
          endAt: {
            gte: new Date(),
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!subscription) {
        throw new Error("No active subscription found. Please subscribe to a plan to create listings.");
      }

      const plan = subscription.plan;

      // Check max active listings
      if (plan.maxActiveListings > 0) {
        const activeListingsCount = await prisma.listing.count({
          where: {
            userId: data.userId,
            status: "ACTIVE",
            deletedAt: null,
          },
        });

        if (activeListingsCount >= plan.maxActiveListings) {
          throw new Error(
            `You have reached the maximum limit of ${plan.maxActiveListings} active listings for your plan. Please upgrade your plan or pause/delete existing listings.`
          );
        }
      }

      // Check quota listings (remaining listings in subscription)
      if (subscription.remainingListings <= 0) {
        throw new Error(
          "You have no remaining listings in your subscription quota. Please upgrade your plan or wait for quota renewal."
        );
      }

      // Check max photos per listing
      const imageCount = data.images?.length || 0;
      if (imageCount > plan.quotaPhotosPerListing) {
        throw new Error(
          `Your plan allows a maximum of ${plan.quotaPhotosPerListing} photos per listing. You have provided ${imageCount} photos.`
        );
      }

      // Check max videos per listing (assuming videos are in images array or separate)
      // For now, we'll check if there's a video field in the future
      // This can be extended when video upload is implemented

      // Check max categories per listing
      // Note: Currently listings have single categoryId, but if multiple categories are supported in future
      // This check would validate against plan.maxCategories

      // Check if trying to use features not available in plan
      // If sticky/featured features are requested but not in plan, throw error
      // For now, we'll assume these are handled separately via boost purchases

      // Store subscription ID for quota decrement after successful creation
      subscriptionIdForQuota = subscription.id;
    }

    // Generate unique slug
    const slug = await ensureUniqueListingSlug(data.title);

    // Handle location - create if location details provided, otherwise use locationId
    let finalLocationId: number | null = null;
    if (data.location) {
      // Create new location
      const newLocation = await prisma.location.create({
        data: {
          country: data.location.country,
          state: data.location.state || null,
          city: data.location.city,
          area: data.location.area || null,
          lat: data.location.lat || null,
          lng: data.location.lng || null,
        },
      });
      finalLocationId = newLocation.id;
    } else {
      finalLocationId = data.locationId || null;
    }

    // Prepare images data - handle both S3 URLs and UploadItem format
    const imagesData = (data.images || []).map((img, index) => ({
      url: typeof img === 'string' ? img : img.url, // Support both string URLs and objects
      sortOrder: typeof img === 'object' ? (img.sortOrder ?? index) : index,
      isPrimary: typeof img === 'object' ? (img.isPrimary ?? (index === 0)) : (index === 0), // First image is primary by default
    }));

    // Ensure only one primary image
    const hasPrimary = imagesData.some(img => img.isPrimary);
    if (!hasPrimary && imagesData.length > 0) {
      imagesData[0].isPrimary = true;
    }
    if (hasPrimary) {
      imagesData.forEach((img, index) => {
        if (!img.isPrimary && index > 0) {
          img.isPrimary = false;
        }
      });
    }

    // Create listing using transaction to ensure atomicity
    const listing = await prisma.$transaction(async (tx) => {
      // Create the listing
      const created = await tx.listing.create({
        data: {
          userId: data.userId,
          categoryId: data.categoryId,
          locationId: finalLocationId,
          title: data.title,
          slug,
          description: data.description,
          price: data.price,
          currency: data.currency as any,
          condition: data.condition as any,
          negotiable: data.negotiable ?? true,
          attributes: data.attributes || null,
          status: (data.status as any) || "DRAFT",
          isPhoneVisible: data.isPhoneVisible ?? true,
          isFeatured: data.isFeatured ?? false,
          isSpotlight: data.isSpotlight ?? false,
          images: {
            create: imagesData,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          location: {
            select: {
              id: true,
              country: true,
              state: true,
              city: true,
              area: true,
              lat: true,
              lng: true,
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      // Decrement quota only after successful listing creation (for non-admin users)
      if (subscriptionIdForQuota) {
        await tx.subscription.update({
          where: { id: subscriptionIdForQuota },
          data: {
            remainingListings: {
              decrement: 1,
            },
          },
        });
      }

      return created;
    });

    return listing;
  },

  async update(id: number, data: {
    categoryId?: number;
    locationId?: number | null;
    location?: {
      country: string;
      state?: string | null;
      city: string;
      area?: string | null;
      lat?: number | null;
      lng?: number | null;
    } | null;
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    condition?: string;
    negotiable?: boolean;
    attributes?: any;
    status?: string;
    isPhoneVisible?: boolean;
  }, userId: number, userRole: "USER" | "ADMIN") {
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { 
        title: true, 
        slug: true, 
        locationId: true,
        userId: true,
        status: true,
      },
    });

    if (!existing) {
      throw new Error("Listing not found");
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Store subscription ID for quota decrement after successful update (only for non-admin)
    let subscriptionIdForQuota: number | null = null;

    // Apply plan checks only for non-admin users when status is being changed to ACTIVE
    // or when updating other plan-restricted fields
    if (user.role !== "ADMIN" && (data.status === "ACTIVE" || existing.status === "ACTIVE")) {
      // Get user's active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: "ACTIVE",
          endAt: {
            gte: new Date(),
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!subscription) {
        throw new Error("No active subscription found. Please subscribe to a plan to publish listings.");
      }

      const plan = subscription.plan;

      // Check max active listings (only if status is being set to ACTIVE)
      if (data.status === "ACTIVE" && plan.maxActiveListings > 0) {
        const activeListingsCount = await prisma.listing.count({
          where: {
            userId: userId,
            status: "ACTIVE",
            deletedAt: null,
            // Exclude current listing if it's already active
            ...(existing.status === "ACTIVE" ? { id: { not: id } } : {}),
          },
        });

        if (activeListingsCount >= plan.maxActiveListings) {
          throw new Error(
            `You have reached the maximum limit of ${plan.maxActiveListings} active listings for your plan. Please upgrade your plan or pause/delete existing listings.`
          );
        }
      }

      // Check quota listings (only if status is being changed from non-ACTIVE to ACTIVE)
      if (data.status === "ACTIVE" && existing.status !== "ACTIVE") {
        if (subscription.remainingListings <= 0) {
          throw new Error(
            "You have no remaining listings in your subscription quota. Please upgrade your plan or wait for quota renewal."
          );
        }
        // Store subscription ID for quota decrement after successful update
        subscriptionIdForQuota = subscription.id;
      }
    }

    // Update slug if title changed
    let slug = existing.slug;
    if (data.title && data.title !== existing.title) {
      slug = await ensureUniqueListingSlug(data.title, id);
    }

    // Handle location - create if location details provided, otherwise use locationId
    let finalLocationId: number | null | undefined = undefined;
    if (data.location !== undefined) {
      if (data.location) {
        // Create new location
        const newLocation = await prisma.location.create({
          data: {
            country: data.location.country,
            state: data.location.state || null,
            city: data.location.city,
            area: data.location.area || null,
            lat: data.location.lat || null,
            lng: data.location.lng || null,
          },
        });
        finalLocationId = newLocation.id;
      } else {
        // Explicitly set to null
        finalLocationId = null;
      }
    } else if (data.locationId !== undefined) {
      finalLocationId = data.locationId;
    }

    const updateData: any = {};
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (finalLocationId !== undefined) updateData.locationId = finalLocationId;
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = slug;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.negotiable !== undefined) updateData.negotiable = data.negotiable;
    if (data.attributes !== undefined) updateData.attributes = data.attributes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isPhoneVisible !== undefined) updateData.isPhoneVisible = data.isPhoneVisible;

    // Use transaction to ensure atomicity when updating listing and decrementing quota
    return prisma.$transaction(async (tx) => {
      const updated = await tx.listing.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          location: {
            select: {
              id: true,
              country: true,
              state: true,
              city: true,
              area: true,
              lat: true,
              lng: true,
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      // Decrement quota only after successful listing update (for non-admin users)
      // Only decrement when status changes from non-ACTIVE to ACTIVE
      if (subscriptionIdForQuota && data.status === "ACTIVE" && existing.status !== "ACTIVE") {
        await tx.subscription.update({
          where: { id: subscriptionIdForQuota },
          data: {
            remainingListings: {
              decrement: 1,
            },
          },
        });
      }

      return updated;
    });
  },

  async remove(id: number, force: boolean = false) {
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing) {
      throw new Error("Listing not found");
    }

    if (force) {
      // Hard delete
      await prisma.listing.delete({
        where: { id },
      });
    } else {
      // Soft delete
      await prisma.listing.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    return { deleted: true };
  },

  async userMetrics(userId: number) {
    const where = {
      userId,
      deletedAt: null,
    };

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(startOfCurrentMonth);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const [
      totalListings,
      statusCounts,
      aggregateCounts,
      recentListingsRaw,
      favoriteListingsRaw,
      trendSource,
    ] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.groupBy({
        by: ["status"],
        where,
        _count: {
          _all: true,
        },
      }),
      prisma.listing.aggregate({
        where,
        _sum: {
          viewsCount: true,
          favoritesCount: true,
        },
      }),
      prisma.listing.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          viewsCount: true,
          favoritesCount: true,
        },
      }),
      prisma.listing.findMany({
        where,
        orderBy: [
          { favoritesCount: "desc" },
          { viewsCount: "desc" },
          { updatedAt: "desc" },
        ],
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          currency: true,
          favoritesCount: true,
          viewsCount: true,
          createdAt: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      }),
      prisma.listing.findMany({
        where: {
          ...where,
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        select: {
          id: true,
          createdAt: true,
          viewsCount: true,
          favoritesCount: true,
        },
      }),
    ]);

    const statusBreakdown = statusCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.status] = curr._count?._all ?? 0;
      return acc;
    }, {});

    const totalViews = aggregateCounts._sum.viewsCount ?? 0;
    const totalFavorites = aggregateCounts._sum.favoritesCount ?? 0;

    const totals = {
      totalListings,
      active: statusBreakdown["ACTIVE"] || 0,
      draft: statusBreakdown["DRAFT"] || 0,
      pending: statusBreakdown["PENDING"] || 0,
      sold: statusBreakdown["SOLD"] || 0,
      totalViews,
      totalFavorites,
      avgViewsPerListing: totalListings > 0 ? Math.round(totalViews / totalListings) : 0,
      engagementRate: totalViews > 0 ? Number(((totalFavorites / totalViews) * 100).toFixed(2)) : 0,
      statusBreakdown,
    };

    const months: {
      key: string;
      label: string;
      year: number;
      listings: number;
      views: number;
      favorites: number;
    }[] = [];

    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(startOfCurrentMonth);
      date.setMonth(date.getMonth() - offset);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      months.push({
        key,
        label: date.toLocaleString("en-US", { month: "short" }),
        year: date.getFullYear(),
        listings: 0,
        views: 0,
        favorites: 0,
      });
    }

    const monthMap = new Map(months.map((m) => [m.key, m]));

    for (const item of trendSource) {
      const created = new Date(item.createdAt);
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      const bucket = monthMap.get(key);
      if (bucket) {
        bucket.listings += 1;
        bucket.views += item.viewsCount ?? 0;
        bucket.favorites += item.favoritesCount ?? 0;
      }
    }

    const monthlyTrend = months.map((m) => ({
      month: `${m.label} ${String(m.year).slice(-2)}`,
      listings: m.listings,
      views: m.views,
      favorites: m.favorites,
    }));

    const recentListings = recentListingsRaw.map((listing) => ({
      id: listing.id,
      title: listing.title,
      status: listing.status,
      price: listing.price ? Number(listing.price) : 0,
      currency: listing.currency,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      viewsCount: listing.viewsCount ?? 0,
      favoritesCount: listing.favoritesCount ?? 0,
    }));

    const topFavorites = favoriteListingsRaw.map((listing) => ({
      id: listing.id,
      title: listing.title,
      status: listing.status,
      price: listing.price ? Number(listing.price) : 0,
      currency: listing.currency,
      favoritesCount: listing.favoritesCount ?? 0,
      viewsCount: listing.viewsCount ?? 0,
      createdAt: listing.createdAt,
      primaryImage: listing.images?.[0]?.url || null,
    }));

    return {
      totals,
      monthlyTrend,
      topFavorites,
      recentListings,
    };
  },
};


