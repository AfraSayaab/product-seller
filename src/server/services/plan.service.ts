import { prisma } from "@/lib/db";
import { ensureUniqueSlug, slugify } from "@/lib/slug";

type ListParams = {
  q?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
  orderBy?: any; // parsed in route
};

export const PlanService = {
  async list(params: ListParams) {
    const {
      q,
      isActive,
      page,
      pageSize,
      orderBy = [{ createdAt: "desc" }] as any,
    } = params;

    const where: any = {};

    // SEARCH
    if (q && q.length > 0) {
      const qSlug = slugify(q);
      (where as any).OR = [
        { name: { contains: q } },
        { slug: { contains: qSlug } },
        { description: { contains: q } },
      ];
    }

    // FILTER
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [total, items] = await Promise.all([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      pagination: { total, page, pageSize, totalPages },
      items,
    };
  },

  async getById(id: number) {
    return prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });
  },

  async getBySlug(slug: string) {
    return prisma.plan.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });
  },

  async create(input: {
    name: string;
    slug?: string;
    description?: string | null;
    price: number;
    currency?: string;
    durationDays: number;
    maxActiveListings?: number;
    quotaListings?: number;
    quotaPhotosPerListing?: number;
    quotaVideosPerListing?: number;
    quotaBumps?: number;
    quotaFeaturedDays?: number;
    maxCategories?: number;
    isSticky?: boolean;
    isFeatured?: boolean;
    isActive?: boolean;
  }) {
    const slug = await ensureUniqueSlug(input.slug ?? input.name);
    const created = await prisma.plan.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        price: input.price,
        currency: (input.currency as any) || "PKR",
        durationDays: input.durationDays,
        maxActiveListings: input.maxActiveListings ?? 0,
        quotaListings: input.quotaListings ?? 0,
        quotaPhotosPerListing: input.quotaPhotosPerListing ?? 8,
        quotaVideosPerListing: input.quotaVideosPerListing ?? 0,
        quotaBumps: input.quotaBumps ?? 0,
        quotaFeaturedDays: input.quotaFeaturedDays ?? 0,
        maxCategories: input.maxCategories ?? 1,
        isSticky: input.isSticky ?? false,
        isFeatured: input.isFeatured ?? false,
        isActive: input.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });
    return created;
  },

  async update(
    id: number,
    patch: Partial<{
      name: string;
      slug: string;
      description: string | null;
      price: number;
      currency: string;
      durationDays: number;
      maxActiveListings: number;
      quotaListings: number;
      quotaPhotosPerListing: number;
      quotaVideosPerListing: number;
      quotaBumps: number;
      quotaFeaturedDays: number;
      maxCategories: number;
      isSticky: boolean;
      isFeatured: boolean;
      isActive: boolean;
    }>
  ) {
    const existing = await prisma.plan.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!existing) {
      throw new Error("Plan not found.");
    }

    const updateData: any = {};

    if (patch.name !== undefined) {
      updateData.name = patch.name;
      // Update slug if name changed and slug not explicitly provided
      if (patch.slug === undefined) {
        updateData.slug = await ensureUniqueSlug(patch.name, id);
      }
    }
    if (patch.slug !== undefined) {
      updateData.slug = await ensureUniqueSlug(patch.slug, id);
    }
    if (patch.description !== undefined) {
      updateData.description = patch.description;
    }
    if (patch.price !== undefined) {
      updateData.price = patch.price;
    }
    if (patch.currency !== undefined) {
      updateData.currency = patch.currency as any;
    }
    if (patch.durationDays !== undefined) {
      updateData.durationDays = patch.durationDays;
    }
    if (patch.maxActiveListings !== undefined) {
      updateData.maxActiveListings = patch.maxActiveListings;
    }
    if (patch.quotaListings !== undefined) {
      updateData.quotaListings = patch.quotaListings;
    }
    if (patch.quotaPhotosPerListing !== undefined) {
      updateData.quotaPhotosPerListing = patch.quotaPhotosPerListing;
    }
    if (patch.quotaVideosPerListing !== undefined) {
      updateData.quotaVideosPerListing = patch.quotaVideosPerListing;
    }
    if (patch.quotaBumps !== undefined) {
      updateData.quotaBumps = patch.quotaBumps;
    }
    if (patch.quotaFeaturedDays !== undefined) {
      updateData.quotaFeaturedDays = patch.quotaFeaturedDays;
    }
    if (patch.maxCategories !== undefined) {
      updateData.maxCategories = patch.maxCategories;
    }
    if (patch.isSticky !== undefined) {
      updateData.isSticky = patch.isSticky;
    }
    if (patch.isFeatured !== undefined) {
      updateData.isFeatured = patch.isFeatured;
    }
    if (patch.isActive !== undefined) {
      updateData.isActive = patch.isActive;
    }

    return prisma.plan.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });
  },

  async remove(id: number) {
    const existing = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error("Plan not found.");
    }

    // Check if plan has active subscriptions
    if (existing._count.subscriptions > 0) {
      throw new Error("Cannot delete plan with active subscriptions.");
    }

    await prisma.plan.delete({
      where: { id },
    });

    return { deleted: true };
  },
};

