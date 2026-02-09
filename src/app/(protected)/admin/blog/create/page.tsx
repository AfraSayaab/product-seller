"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import PostForm, { BlogFormData } from "@/components/admin/blog/postform";

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  blogId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BlogForm({ initialData, blogId, onSuccess, onCancel }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoSlug, setAutoSlug] = React.useState(true);

  // form state
  const initialState: BlogFormData = {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords || "",
    schemaMarkup: initialData?.schemaMarkup || "",
    content: initialData?.content || "",
    image: initialData?.image ?? null, // string URL for existing image
    imageAlt: initialData?.imageAlt || "",
    isPublished: initialData?.isPublished ?? true,
  };

  const [formData, setFormData] = React.useState<BlogFormData>(initialState);

  // separate state for preview URL (string)
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    typeof initialState.image === "string" ? initialState.image : null
  );

  // Auto-generate slug from title
  React.useEffect(() => {
    if (autoSlug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, autoSlug]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // append image if it's a File (new upload)
      if (formData.image instanceof File) {
        fd.append("image", formData.image);
      }

      const res = await fetch(
        blogId ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs",
        {
          method: blogId ? "PATCH" : "POST",
          body: fd, // send as FormData
        }
      );

      if (!res.ok) throw new Error(blogId ? "Failed to update blog" : "Failed to create blog");

      toast.success(blogId ? "Blog updated successfully 🎉" : "Blog posted successfully 🎉");

      if (!blogId) {
        // reset form only when creating new blog
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

  // Cancel / reset form
  const handleCancel = () => {
    setFormData(initialState);

    // If image is a File (unlikely on cancel), create URL; else use string or null
    if (initialState.image instanceof File) {
      setImagePreview(URL.createObjectURL(initialState.image));
    } else {
      setImagePreview(initialState.image ?? null);
    }

    setAutoSlug(true);
    onCancel?.();
  };

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
        />
      </div>
    </div>
  );
}
