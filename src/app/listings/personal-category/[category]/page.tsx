import Footer from "@/components/Footer";
import { HeaderLayout } from "@/components/Header/header";
import ListingsGridPaginated from "@/components/card/listings-grid-paginated";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  children: Category[];
}

// Recursive helper to find category by slug
function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryBySlug(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export default async function PersonalCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  console.log("CATEGORY PARAM:", category);

  // Fetch category tree from API
  const res = await fetch("http://localhost:3000/api/admin/categories/tree", {
    cache: "no-store",
  });

  const json = await res.json();
  const categories: Category[] = json.data;

  // Find category recursively
  const selectedCategory = findCategoryBySlug(categories, category);

  if (!selectedCategory) {
    return (
      <div className="p-6 text-red-500">
        Category - {category} not found
      </div>
    );
  }

  return (
    <>
      <HeaderLayout />

     

      <ListingsGridPaginated
  categorySlug={selectedCategory.slug}
  title={`${selectedCategory.name} Listings`}
  defaultSort="newest"
/>


      <Footer />
    </>
  );
}
