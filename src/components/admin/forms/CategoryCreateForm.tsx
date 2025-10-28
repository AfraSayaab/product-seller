// File: components/forms/CategoryCreateForm.tailwind.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import ImageFileUploader from "@/components/uploader/ImageFileUploader";
import ParentCategorySelect from "@/components/CategorySelector";
// ─────────────────────────────────────────────────────────────
// Schema (attributeSchema removed; backend receives {})
// ─────────────────────────────────────────────────────────────
const Schema = z.object({
  name: z
    .string()
    .min(2, "Please enter at least 2 characters for the name.")
    .max(100, "Name is too long"),
  slug: z
    .string()
    .min(2, "Please enter at least 2 characters for the slug.")
    .max(120, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  parentId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || /^\d+$/.test(v), "Parent ID must be a whole number (or leave empty)."),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional(), // S3 key/URL or null
});

export type CategoryCreateValues = z.infer<typeof Schema>;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function CategoryCreateForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [parentIdNum, setParentIdNum] = React.useState<number | null>(null);

  React.useEffect(() => {
    // keep RHF field in sync as string|null for your payload conversion
    setValue("parentId", parentIdNum !== null ? String(parentIdNum) : "");
  }, [parentIdNum]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CategoryCreateValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: "",
      isActive: true,
      image: null,
    },
    mode: "onTouched",
  });

  // Auto-generate slug when user types name (only if slug is empty)
  React.useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "name") {
        const n = (values as any).name as string;
        const currentSlug = (values as any).slug as string;
        if (n && !currentSlug) {
          setValue("slug", slugify(n), { shouldValidate: true, shouldDirty: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = async (values: CategoryCreateValues) => {
    try {
      setSubmitting(true);

      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        parentId: values.parentId ? Number(values.parentId) : null,
        image: values.image || null,
        isActive: values.isActive,
        attributeSchema: {}, // fixed empty object for backend
      };

      const res = await api<any>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const success = res?.success === true || Boolean(res?.data) || Boolean(res?.id);
      if (!success) throw new Error(res?.message || res?.error || "Failed to create category");

      toast.success("Category created successfully.");
      onSuccess?.();
      reset({ name: "", slug: "", parentId: "", isActive: true, image: null });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="off"
            disabled={submitting}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:opacity-60"
            placeholder="e.g. Laptops"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
          <p className="text-xs text-gray-500">Shown in lists and navigation.</p>
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-900">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            autoComplete="off"
            disabled={submitting}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:opacity-60"
            placeholder="laptops"
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-xs text-red-600">{errors.slug.message}</p>
          )}
          <p className="text-xs text-gray-500">Lowercase, numbers, and hyphens only.</p>
        </div>

        {/* Parent ID */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-900">Parent Category (optional)</label>
          <ParentCategorySelect
            value={parentIdNum}
            onChange={(id) => setParentIdNum(id)}   // returns number|null
            excludeId={undefined /* e.g., current editing id to prevent self-parenting */}
            pageSize={20}
            debounceMs={300}
            placeholder="Search categories…"
            allowClear
            disabled={submitting}
            className="w-full"
          // apiPath="/api/admin/categories" // default
          // mapItemLabel={(i) => `${i.name}`}
          />
          <p className="text-xs text-gray-500">Leave empty for a top-level category.</p>
          {errors.parentId && <p className="text-xs text-red-600">{errors.parentId.message}</p>}
        </div>
        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Active</p>
            <p className="text-xs text-gray-500">Inactive categories are hidden from users.</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              disabled={submitting}
              {...register("isActive")}
            />
            <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-gray-900 peer-focus:outline-none"></div>
            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* Image (single) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-900">Image (optional)</label>

          <ImageFileUploader
            label=""
            helperText="JPEG/PNG/WebP up to 5MB"
            mode="single"
            accept={["image/*"]}
            maxSizeMB={5}
            folder="products/hero"
            defaultValue={null}
            onChange={(v: any) => setValue("image", v)}
          />
          <p className="text-xs text-gray-500">Recommended: square image (e.g., 800×800).</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:opacity-60"
          >
            {submitting && (
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>

    </div>
  );
}


