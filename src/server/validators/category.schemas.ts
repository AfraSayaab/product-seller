
import { z } from "zod";

export const CategoryBaseSchema = z
  .object({
    // Name: custom messages for empty/too short
    name: z
      .string()
      .min(1, "Please enter the category name")
      .min(2, "Category name must be at least 2 characters long")
      .max(120, "Category name cannot exceed 120 characters"),

    // Slug: optional, but if provided must follow rules
    slug: z
      .string()
      .min(1, "Slug cannot be empty")
      .max(140, "Slug cannot exceed 140 characters")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only")
      .optional(),

    // Parent ID: optional/nullable integer > 0
    parentId: z
      .union([z.number(), z.null()])
      .optional()
      .refine(
        (v) => v === undefined || v === null || (Number.isInteger(v) && v > 0),
        "Parent ID must be a positive integer or null"
      ),

    // Image: optional/nullable string with length cap
    image: z.string().max(255, "Image filename is too long").optional().nullable(),

    // isActive: optional boolean
    isActive: z.boolean().optional(),

    // JSON schema: optional
    attributeSchema: z.any().optional(),
  })
  // Ensure we override the default “Required” message for completely missing `name`
  .superRefine((val, ctx) => {
    if (typeof (val as any).name === "undefined") {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Please enter the category name",
      });
    }
  });




export const CategoryCreateSchema = CategoryBaseSchema;
// NOTE: createdById comes from JWT, not client body.

// export const CategoryUpdateSchema = CategoryBaseSchema.partial()
//   // Explicitly forbid createdById in PATCH
//   .refine((v: any) => typeof v.createdById === "undefined", {
//     message: "createdById cannot be modified",
//     path: ["createdById"],
//   });
export const CategoryUpdateSchema = CategoryBaseSchema.partial();


export const CategoryListQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  parentId: z.coerce.number().int().positive().optional(),
  isActive: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .optional(),
  createdById: z.coerce.number().int().positive().optional(),

  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  // comma-separated list: "createdAt:desc,name:asc"
  sort: z
    .string()
    .trim()
    .optional()
    .default("createdAt:desc"),

  // string flags come in as "true"/"false"
  withCounts: z.string().optional().default("false"),
});
export type CategoryListQuery = z.infer<typeof CategoryListQuerySchema>;

