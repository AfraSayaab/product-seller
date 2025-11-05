"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import ParentCategorySelect from "@/components/CategorySelector";
import ImageFileUploader from "@/components/uploader/ImageFileUploader";
import type { UploadItem } from "@/components/admin/types/uploader";

interface CategoryFormData {
  name: string;
  slug: string;
  parentId: number | null;
  image: string | null;
  isActive: boolean;
  attributeSchema: Record<string, any>;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  categoryId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  initialData,
  categoryId,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    parentId: initialData?.parentId ?? null,
    image: initialData?.image ?? null,
    isActive: initialData?.isActive ?? true,
    attributeSchema: initialData?.attributeSchema || {},
  });

  const [autoSlug, setAutoSlug] = React.useState(true);
  const [imageUploadItem, setImageUploadItem] = React.useState<UploadItem | null>(null);

  // Initialize image upload item if image exists
  React.useEffect(() => {
    if (initialData?.image && !imageUploadItem) {
      // Convert image URL to UploadItem format if it exists
      setImageUploadItem({
        key: initialData.image,
        url: initialData.image,
        name: "Category Image",
        size: 0,
        type: "image/*",
      });
    }
  }, [initialData?.image, imageUploadItem]);

  // Auto-generate slug from name
  React.useEffect(() => {
    if (autoSlug && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, autoSlug]);

  // Handle image upload
  const handleImageChange = React.useCallback((value: UploadItem | UploadItem[] | null) => {
    const item = Array.isArray(value) ? value[0] : value;
    setImageUploadItem(item);
    setFormData((prev) => ({ ...prev, image: item?.url || null }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        parentId: formData.parentId,
        image: formData.image,
        isActive: formData.isActive,
        attributeSchema: formData.attributeSchema || {},
      };

      if (categoryId) {
        // Update
        await api(`/api/admin/categories/${categoryId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Category updated successfully");
      } else {
        // Create
        await api("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Category created successfully");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Category Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          placeholder="Enter category name (e.g., Electronics, Fashion)"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-black">
            URL Slug <span className="text-red-600">*</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer group">
            <input
              type="checkbox"
              checked={autoSlug}
              onChange={(e) => setAutoSlug(e.target.checked)}
              className="w-4 h-4 border-2 border-black rounded cursor-pointer"
            />
            <span className="text-gray-600 group-hover:text-black transition-colors">Auto-generate</span>
          </label>
        </div>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, slug: e.target.value }));
            setAutoSlug(false);
          }}
          required
          disabled={isSubmitting || autoSlug}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          placeholder="category-slug"
        />
        <p className="text-xs text-gray-600">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
      </div>

      {/* Parent Category */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Parent Category
        </label>
        <ParentCategorySelect
          value={formData.parentId}
          onChange={(id) => setFormData((prev) => ({ ...prev, parentId: id }))}
          excludeId={categoryId}
          pageSize={20}
          debounceMs={300}
          placeholder="Select parent category (optional)..."
          allowClear
          disabled={isSubmitting}
          className="w-full"
        />
        <p className="text-xs text-gray-600">Leave empty to create a top-level category.</p>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Category Image
        </label>
        <ImageFileUploader
          label=""
          helperText="Upload a category image (JPEG, PNG, or WebP up to 5MB)"
          mode="single"
          accept={["image/*"]}
          maxSizeMB={5}
          folder="categories/images"
          defaultValue={imageUploadItem}
          onChange={handleImageChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Active Status */}
      <div className="rounded-lg border border-gray-300 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-bold text-black mb-1">
              Category Status
            </label>
            <p className="text-xs text-gray-600">Active categories are visible to users</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                disabled={isSubmitting}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black peer-focus:ring-offset-2 rounded-full transition-colors peer-checked:bg-black peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-md"></div>
            </div>
            <span className="text-sm font-bold text-black min-w-[60px]">
              {formData.isActive ? "Active" : "Inactive"}
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-300">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-black font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg bg-black text-white font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Saving...
            </span>
          ) : (
            categoryId ? "Update Category" : "Create Category"
          )}
        </button>
      </div>
    </form>
  );
}

