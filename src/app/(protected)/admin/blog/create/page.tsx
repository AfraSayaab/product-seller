"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import PostForm, { BlogFormData } from "@/components/admin/blog/postform";

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  blogId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BlogForm({ initialData, blogId, onSuccess, onCancel }: BlogFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoSlug, setAutoSlug] = React.useState(true);
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    initialData?.image ?? null
  );

  const initialState: BlogFormData = {
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
  };

  const [formData, setFormData] = React.useState<BlogFormData>(initialState);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { ...formData, title: formData.title.trim(), slug: formData.slug.trim() };

      if (blogId) {
        await api(`/api/admin/blogs/${blogId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Blog updated successfully");
      } else {
        await api("/api/admin/blogs", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Blog created successfully");
      }

      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
    setImagePreview(initialState.image);
    setAutoSlug(true);
    onCancel();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">{blogId ? "Edit Blog Post" : "Add New Blog Post"}</h1>
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
        />
      </div>
    </div>
  );
}
