import { prisma } from "./db";
export function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function ensureUniqueSlug(base: string, excludeId?: number) {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let i = 2;
  while (true) {
    const existing = await prisma.category.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${i++}`;
  }
}

export async function ensureUniqueListingSlug(base: string, excludeId?: number) {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let i = 2;
  while (true) {
    const existing = await prisma.listing.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${i++}`;
  }
}