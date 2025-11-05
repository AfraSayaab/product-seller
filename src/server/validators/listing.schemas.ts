import { z } from "zod";

// Listing status enum
const ListingStatusEnum = z.enum([
  "DRAFT",
  "PENDING",
  "ACTIVE",
  "PAUSED",
  "SOLD",
  "EXPIRED",
  "REJECTED",
  "ARCHIVED",
]);

// Condition enum
const ConditionEnum = z.enum(["NEW", "LIKE_NEW", "USED", "FOR_PARTS"]);

// Currency enum
const CurrencyEnum = z.enum(["PKR", "USD", "EUR", "GBP", "AED", "INR"]);

// List query schema
export const ListingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  q: z.string().optional(),
  userId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
  condition: z.string().optional(),
  currency: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  negotiable: z.coerce.boolean().optional(),
  isPhoneVisible: z.coerce.boolean().optional(),
  locationId: z.coerce.number().int().positive().optional(),
});

// Image schema for listing creation
export const ListingImageSchema = z.object({
  url: z.string().url(),
  sortOrder: z.number().int().nonnegative().default(0),
  isPrimary: z.boolean().default(false),
}).optional();

// Location schema for listing creation/update
export const ListingLocationSchema = z.object({
  country: z.string().length(2, "Country must be ISO2 code (2 characters)"),
  state: z.string().max(100).optional().nullable(),
  city: z.string().min(1).max(120),
  area: z.string().max(120).optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
}).optional();

// Create schema
export const ListingCreateSchema = z.object({
  userId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  locationId: z.number().int().positive().optional().nullable(),
  location: ListingLocationSchema, // Location details (alternative to locationId)
  title: z.string().min(1).max(180),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  currency: CurrencyEnum.default("PKR"),
  condition: ConditionEnum,
  negotiable: z.boolean().default(true),
  attributes: z.record(z.any()).optional().nullable(),
  status: ListingStatusEnum.default("DRAFT"),
  isPhoneVisible: z.boolean().default(true),
  images: z.array(z.object({
    url: z.string().url(),
    sortOrder: z.number().int().nonnegative().default(0),
    isPrimary: z.boolean().default(false),
  })).default([]),
});

// Update schema
export const ListingUpdateSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional().nullable(),
  location: ListingLocationSchema, // Location details (alternative to locationId)
  title: z.string().min(1).max(180).optional(),
  description: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  currency: CurrencyEnum.optional(),
  condition: ConditionEnum.optional(),
  negotiable: z.boolean().optional(),
  attributes: z.record(z.any()).optional().nullable(),
  status: ListingStatusEnum.optional(),
  isPhoneVisible: z.boolean().optional(),
});

