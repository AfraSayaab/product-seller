"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm, { BlogFormData, Category } from "@/components/admin/blog/postform";
import { toast } from "sonner";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    schemaMarkup: "",
    content: "",
    image: null,
    imageAlt: "",
    isPublished: false,
    categoryId: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]); // 🔥 must fetch categories

  // Fetch blog data
useEffect(() => {
  if (!id || Array.isArray(id)) return;

  const loadBlog = async () => {
    setIsLoading(true);
    try {
      const [blogRes, catRes] = await Promise.all([
        fetch(`/api/admin/blogs/${id}`),
        fetch("/api/admin/categories"),
      ]);

      if (!blogRes.ok) throw new Error(blogRes.status === 404 ? "Blog not found" : "Failed to fetch blog");
      if (!catRes.ok) throw new Error("Failed to fetch categories");

      const blog = await blogRes.json();

      const catsRes = await catRes.json();
      const cats: Category[] = Array.isArray(catsRes.data?.items) ? catsRes.data.items : [];

      setCategories(cats);

      setFormData({
        title: blog.title,
        slug: blog.slug,
        metaTitle: blog.meta_title ?? "",
        metaDescription: blog.meta_description ?? "",
        keywords: blog.keywords ?? "",
        schemaMarkup: blog.schema_markup ?? "",
        content: blog.content ?? "",
        image: blog.image ?? null,
        imageAlt: blog.image_alt ?? "",
        isPublished: Boolean(blog.is_published),
        categoryId: blog.category_id ?? undefined,
      });

      setImagePreview(blog.image ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load blog");
      router.replace("/admin/blog/manage");
    } finally {
      setIsLoading(false);
    }
  };

  loadBlog();
}, [id, router]);

  // Auto-generate slug
  useEffect(() => {
    if (autoSlug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("slug", formData.slug);
      fd.append("metaTitle", formData.metaTitle);
      fd.append("metaDescription", formData.metaDescription);
      fd.append("keywords", formData.keywords);
      fd.append("schemaMarkup", formData.schemaMarkup);
      fd.append("content", formData.content);
      fd.append("imageAlt", formData.imageAlt);
      fd.append("isPublished", String(formData.isPublished));

      if (formData.categoryId) fd.append("categoryId", String(formData.categoryId));
      if (formData.image instanceof File) fd.append("image", formData.image);

      const res = await fetch(`/api/admin/blogs/${id}`, { method: "PATCH", body: fd });
      if (!res.ok) throw new Error("Failed to update blog");

      toast.success("Blog updated successfully 🎉");
      router.push("/admin/blog/manage");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.push("/admin/blog/manage");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Blog Post</h1>
      {isLoading ? (
        <div className="text-gray-600">Loading blog data...</div>
      ) : (
        <div className="max-w-3xl rounded-xl border border-gray-200 bg-white shadow-sm p-6">
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
            categories={categories} // 🔥 must pass categories
          />
        </div>
      )}
    </div>
  );
}
