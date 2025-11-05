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

    return prisma.listing.create({
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


