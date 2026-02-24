import Link from "next/link";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  children?: Category[];
}

interface ChildCategoriesProps {
  parentCategory: Category;
}

export default function ChildCategories({
  parentCategory,
}: ChildCategoriesProps) {
  if (!parentCategory.children || parentCategory.children.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {parentCategory.children.map((child) => (
          <Link
            key={child.id}
            href={`/listings/personal-category/${child.slug}`}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <h3 className="font-medium">{child.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}