"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm, { BlogFormData } from "@/components/admin/blog/postform";
import { fetchBlogById } from "@/api/blogApi";
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
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) return;
      setIsLoading(true);
      const blog = await fetchBlogById(Number(id));
      if (!blog) {
        toast.error("Blog not found");
        return;
      }

      setFormData({
        title: blog.title,
        slug: blog.slug,
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
        keywords: blog.keywords,
        schemaMarkup: blog.schemaMarkup,
        content: blog.content,
        image: blog.image,
        imageAlt: blog.imageAlt,
        isPublished: blog.isPublished,
      });

      // Show image as URL
      setImagePreview(blog.image || null);
      setIsLoading(false);
    };

    loadBlog();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitted data:", formData); // Here you can call API later
      toast.success("Blog updated (dummy)");
      router.push("/admin/blog/manage");
    } catch (err) {
      toast.error("Failed to update blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Blog Post</h1>
      {isLoading ? (
        <div>Loading blog data...</div>
      ) : (
        <PostForm
          formData={formData}
          setFormData={setFormData}
          autoSlug={autoSlug}
          setAutoSlug={setAutoSlug}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/admin/blog/manage")}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
