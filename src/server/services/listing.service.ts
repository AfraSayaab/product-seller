import { prisma } from "@/lib/db";
import { ensureUniqueListingSlug, slugify } from "@/lib/slug";
import type { Prisma } from "@prisma/client";

type ListParams = {
  q?: string;
  userId?: number;
  categoryId?: number;
  status?: string;
  condition?: string;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  negotiable?: boolean;
  isPhoneVisible?: boolean;
  locationId?: number;
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
      status,
      condition,
      currency,
      minPrice,
      maxPrice,
      negotiable,
      isPhoneVisible,
      locationId,
      page,
      pageSize,
      orderBy = [{ createdAt: "desc" }] as any,
    } = params;

    const where: any = {
      deletedAt: null, // Only show non-deleted listings
    };

    // Search query
    if (q && q.length > 0) {
      const qSlug = slugify(q);
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { slug: { contains: qSlug } },
      ];
    }

    // Filters
    if (typeof userId === "number") where.userId = userId;
    if (typeof categoryId === "number") where.categoryId = categoryId;
    if (status) where.status = status;
    if (condition) where.condition = condition;
    if (currency) where.currency = currency;
    if (typeof negotiable === "boolean") where.negotiable = negotiable;
    if (typeof isPhoneVisible === "boolean") where.isPhoneVisible = isPhoneVisible;
    if (typeof locationId === "number") where.locationId = locationId;

    // Price range
    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      where.price = {};
      if (typeof minPrice === "number") where.price.gte = minPrice;
      if (typeof maxPrice === "number") where.price.lte = maxPrice;
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

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

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      pagination: { total, page, pageSize, totalPages },
      items,
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

    // Prepare images data
    const imagesData = (data.images || []).map((img, index) => ({
      url: img.url,
      sortOrder: img.sortOrder ?? index,
      isPrimary: img.isPrimary ?? (index === 0), // First image is primary by default
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
  }) {
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { title: true, slug: true, locationId: true },
    });

    if (!existing) {
      throw new Error("Listing not found");
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

    return prisma.listing.update({
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
};


