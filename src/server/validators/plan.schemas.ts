import { z } from "zod";

const CurrencyEnum = z.enum(["PKR", "USD", "EUR", "GBP", "AED", "INR"]);

// List query schema
export const PlanListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  q: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// Create schema
export const PlanCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().nonnegative(),
  currency: CurrencyEnum.default("PKR"),
  durationDays: z.number().int().positive().min(1),
  maxActiveListings: z.number().int().nonnegative().default(0),
  quotaListings: z.number().int().nonnegative().default(0),
  quotaPhotosPerListing: z.number().int().nonnegative().default(8),
  quotaVideosPerListing: z.number().int().nonnegative().default(0),
  quotaBumps: z.number().int().nonnegative().default(0),
  quotaFeaturedDays: z.number().int().nonnegative().default(0),
  maxCategories: z.number().int().positive().default(1),
  isSticky: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Update schema
export const PlanUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.number().nonnegative().optional(),
  currency: CurrencyEnum.optional(),
  durationDays: z.number().int().positive().min(1).optional(),
  maxActiveListings: z.number().int().nonnegative().optional(),
  quotaListings: z.number().int().nonnegative().optional(),
  quotaPhotosPerListing: z.number().int().nonnegative().optional(),
  quotaVideosPerListing: z.number().int().nonnegative().optional(),
  quotaBumps: z.number().int().nonnegative().optional(),
  quotaFeaturedDays: z.number().int().nonnegative().optional(),
  maxCategories: z.number().int().positive().optional(),
  isSticky: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

