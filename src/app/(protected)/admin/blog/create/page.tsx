"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import PostForm, { BlogFormData, Category } from "@/components/admin/blog/postform";

interface BlogFormProps {
  initialData?: Partial<BlogFormData & { categoryId?: number }>;
  blogId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BlogForm({ initialData, blogId, onSuccess, onCancel }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoSlug, setAutoSlug] = React.useState(true);
  const [categories, setCategories] = React.useState<Category[] | null>(null);

  const initialState: BlogFormData & { categoryId?: number } = {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords || "",
    schemaMarkup: initialData?.schemaMarkup || "",
    content: initialData?.content || "",
    image: initialData?.image ?? null,
    imageAlt: initialData?.imageAlt || "",
    isPublished: initialData?.isPublished ?? true,
    categoryId: initialData?.categoryId ?? undefined,
  };

  const [formData, setFormData] = React.useState(initialState);
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    typeof initialState.image === "string" ? initialState.image : null
  );

  // Auto-generate slug
  React.useEffect(() => {
    if (autoSlug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, autoSlug]);

  // Fetch categories
  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const json = await res.json();
        console.log("Categories API response:", json);
        const data: Category[] = Array.isArray(json.data?.items) ? json.data.items : [];
        setCategories(data);
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to load categories");
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("slug", formData.slug.trim());
      fd.append("metaTitle", formData.metaTitle.trim());
      fd.append("metaDescription", formData.metaDescription.trim());
      fd.append("keywords", formData.keywords.trim());
      fd.append("schemaMarkup", formData.schemaMarkup.trim());
      fd.append("content", formData.content.trim());
      fd.append("imageAlt", formData.imageAlt);
      fd.append("isPublished", String(formData.isPublished));

      // Always append categoryId, null if not set
     if (formData.categoryId != null) {
  fd.append("categoryId", String(formData.categoryId));
}


      if (formData.image instanceof File) fd.append("image", formData.image);

      const res = await fetch(blogId ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs", {
        method: blogId ? "PATCH" : "POST",
        body: fd,
      });

      if (!res.ok) {
        // Read the response text for better error message
        const text = await res.text();
        console.error("Blog creation failed:", text);
        throw new Error(text || (blogId ? "Failed to update blog" : "Failed to create blog"));
      }

      toast.success(blogId ? "Blog updated successfully 🎉" : "Blog posted successfully 🎉");

      if (!blogId) {
        setFormData(initialState);
        setImagePreview(null);
        setAutoSlug(true);
      }

      onSuccess?.();
      router.push("/admin/blog/manage");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
    setImagePreview(typeof initialState.image === "string" ? initialState.image : null);
    setAutoSlug(true);
    onCancel?.();
  };

  // Only render PostForm after categories are loaded
  if (!categories) return <div className="p-6">Loading ...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">
          {blogId ? "Edit Blog Post" : "Add New Blog Post"}
        </h1>
        <p className="text-sm text-gray-600">Create and publish a blog article</p>
      </div>

      <div className="max-w-5xl rounded-xl border border-gray-200 bg-white shadow-sm">
        <PostForm
          formData={formData}
          setFormData={setFormData}
          autoSlug={autoSlug}
          setAutoSlug={setAutoSlug}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          categories={categories} // guaranteed array
        />
      </div>
    </div>
  );
}
