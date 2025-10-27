import { prisma } from "@/lib/db";
import { ensureUniqueSlug, slugify } from "@/lib/slug";

type ListParams = {
  q?: string;
  parentId?: number;
  isActive?: boolean;
  createdById?: number;
  page: number;
  pageSize: number;
  withCounts?: boolean;
};

async function assertNoCycle(id: number | null | undefined, parentId?: number | null) {
  if (!id || !parentId) return;
  if (id === parentId) throw new Error("Category cannot be its own parent.");

  let current = await prisma.category.findUnique({ where: { id: parentId }, select: { id: true, parentId: true } });
  while (current?.parentId) {
    if (current.parentId === id) throw new Error("Parent creates a cycle.");
    current = await prisma.category.findUnique({ where: { id: current.parentId }, select: { id: true, parentId: true } });
  }
}

export const CategoryService = {
  async list(params: ListParams) {
    const { q, parentId, isActive, createdById, page, pageSize, withCounts } = params;
    const where: any = {};
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: slugify(q), mode: "insensitive" } }];
    if (typeof parentId === "number") where.parentId = parentId;
    if (typeof isActive === "boolean") where.isActive = isActive;
    if (typeof createdById === "number") where.createdById = createdById;

    const [total, items] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          ...(withCounts
            ? { _count: { select: { children: true, listings: true } } }
            : {}),
          createdBy: { select: { id: true, username: true, email: true } },
        },
      }),
    ]);

    return { pagination: { total,  page, pageSize , totalPages: Math.max(1, Math.ceil(total / pageSize))}, items};
  },

  async getById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true, parentId: true } },
        createdBy: { select: { id: true, username: true, email: true } },
        _count: { select: { children: true, listings: true } },
      },
    });
  },

  async getBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: { createdBy: { select: { id: true, username: true, email: true } } },
    });
  },

  async create(input: {
    name: string;
    slug?: string;
    parentId?: number | null;
    image?: string | null;
    isActive?: boolean;
    attributeSchema?: any;
    createdById: number; // REQUIRED
  }) {
    const parent = input.parentId ? await prisma.category.findUnique({ where: { id: input.parentId } }) : null;
    if (input.parentId && !parent) throw new Error("Parent category not found.");

    const slug = await ensureUniqueSlug(input.slug ?? input.name);
    const created = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        parentId: input.parentId ?? null,
        image: input.image ?? null,
        isActive: input.isActive ?? true,
        attributeSchema: input.attributeSchema ?? undefined,
        createdById: input.createdById,
        // createdAt handled by DB default(now())
      },
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
      },
    });
    return created;
  },

  async update(
    id: number,
    patch: Partial<{
      name: string;
      slug: string;
      parentId: number | null;
      image: string | null;
      isActive: boolean;
      attributeSchema: any;
      // createdById intentionally not allowed
    }>
  ) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new Error("Category not found.");

    if (typeof (patch as any).createdById !== "undefined") {
      throw new Error("createdById cannot be modified.");
    }

    if (typeof patch.parentId !== "undefined") {
      if (patch.parentId) {
        const parent = await prisma.category.findUnique({ where: { id: patch.parentId } });
        if (!parent) throw new Error("Parent category not found.");
      }
      await assertNoCycle(id, patch.parentId);
    }

    const newSlug =
      patch.slug ? await ensureUniqueSlug(patch.slug, id)
      : patch.name ? await ensureUniqueSlug(patch.name, id)
      : undefined;

    const updated = await prisma.category.update({
      where: { id },
      data: { ...patch, slug: newSlug ?? undefined },
      include: {
        createdBy: { select: { id: true, username: true, email: true } },
      },
    });
    return updated;
  },

  async remove(id: number, force = false) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, listings: true } } },
    });
    if (!cat) throw new Error("Category not found.");

    if (!force) {
      if (cat._count.children > 0) throw new Error("Category has children. Delete/reassign them first, or use force=1.");
      if (cat._count.listings > 0) throw new Error("Category has listings. Reassign/delete them first, or use force=1.");
    }

    await prisma.category.delete({ where: { id } });
    return true;
  },

  async tree(rootId?: number, maxDepth = 5) {
    const byParent = new Map<number | null, any[]>();
    const allCats = await prisma.category.findMany({ orderBy: { name: "asc" } });
    for (const c of allCats) {
      const key = c.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    }

    const roots = rootId
      ? (await prisma.category.findUnique({ where: { id: rootId } })) ? [await prisma.category.findUnique({ where: { id: rootId } }) as any] : []
      : allCats.filter(c => c.parentId === null);

    function build(node: any, depth: number): any {
      if (depth >= maxDepth) return { ...node, children: [] };
      const kids = byParent.get(node.id) || [];
      return { ...node, children: kids.map(k => build(k, depth + 1)) };
    }

    return roots.map(r => build(r, 1));
  },

  async breadcrumbs(id: number) {
    const trail: Array<{ id: number; name: string; slug: string; parentId: number | null }> = [];
    let current = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, parentId: true },
    });
    while (current) {
      trail.unshift(current);
      current = current.parentId
        ? await prisma.category.findUnique({
            where: { id: current.parentId },
            select: { id: true, name: true, slug: true, parentId: true },
          })
        : null;
    }
    return trail;
  },

  async isSlugAvailable(slug: string, excludeId?: number) {
    const exists = await prisma.category.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    return !exists;
  },
};
