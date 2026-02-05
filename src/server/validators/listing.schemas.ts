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

// List query schema - Enhanced with OLX-style filters
export const ListingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  q: z.string().optional(), // Search query for title/description
  
  // User filter
  userId: z.coerce.number().int().positive().optional(),
  
  // Category filters (support multiple categories)
  categoryId: z.coerce.number().int().positive().optional(),
  categoryIds: z.string().optional(), // Comma-separated category IDs
  
  // Status filter (default to ACTIVE for public listings)
  status: z.string().optional(),
  
  // Condition filters (support multiple conditions)
  condition: z.string().optional(),
  conditions: z.string().optional(), // Comma-separated conditions
  
  // Currency filters (support multiple currencies)
  currency: z.string().optional(),
  currencies: z.string().optional(), // Comma-separated currencies
  
  // Price range filters
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  
  // Negotiable filter
  negotiable: z.coerce.boolean().optional(),
  
  // Phone visibility filter
  isPhoneVisible: z.coerce.boolean().optional(),
  
  // Location filters - by ID
  locationId: z.coerce.number().int().positive().optional(),
  
  // Location filters - by location details (for OLX-style filtering)
  country: z.string().length(2).optional(), // ISO2 country code
  state: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  
  // Location-based search (nearest to user)
  lat: z.coerce.number().min(-90).max(90).optional(), // User's latitude
  lng: z.coerce.number().min(-180).max(180).optional(), // User's longitude
  radius: z.coerce.number().min(0).max(1000).default(50).optional(), // Radius in kilometers (default 50km)
  sortByDistance: z.coerce.boolean().default(false).optional(), // Sort by distance if lat/lng provided
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
});

// Create schema
export const ListingCreateSchema = z.object({
  userId: z.coerce.number().int().positive().optional(), // Optional - will use token userId if not provided
  categoryId: z.coerce.number().int().positive(),
  locationId: z.coerce.number().int().positive().optional().nullable(),
  location: z.object({
    country: z.string().length(2, "Country must be ISO2 code (2 characters)"),
    state: z.string().max(100).optional().nullable(),
    city: z.string().min(1).max(120),
    area: z.string().max(120).optional().nullable(),
    lat: z.coerce.number().optional().nullable(),
    lng: z.coerce.number().optional().nullable(),
  }).optional().nullable(), // Location details (alternative to locationId)
  title: z.string().min(1).max(180),
  description: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  currency: CurrencyEnum.default("PKR"),
  condition: ConditionEnum,
  negotiable: z.boolean().default(true),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
  status: ListingStatusEnum.default("DRAFT"),
  isPhoneVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isSpotlight: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string().url(),
    sortOrder: z.number().int().nonnegative().default(0),
    isPrimary: z.boolean().default(false),
  })).default([]),
});

// Update schema
export const ListingUpdateSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional().nullable(),
  location: z.object({
    country: z.string().length(2, "Country must be ISO2 code (2 characters)"),
    state: z.string().max(100).optional().nullable(),
    city: z.string().min(1).max(120),
    area: z.string().max(120).optional().nullable(),
    lat: z.coerce.number().optional().nullable(),
    lng: z.coerce.number().optional().nullable(),
  }).optional().nullable(), // Location details (alternative to locationId)
  title: z.string().min(1).max(180).optional(),
  description: z.string().min(1).optional(),
  price: z.coerce.number().nonnegative().optional(),
  currency: CurrencyEnum.optional(),
  condition: ConditionEnum.optional(),
  negotiable: z.boolean().optional(),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
  status: ListingStatusEnum.optional(),
  isPhoneVisible: z.boolean().optional(),
});

