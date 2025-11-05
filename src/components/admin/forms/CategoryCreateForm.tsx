"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import ImageFileUploader from "@/components/uploader/ImageFileUploader";
import ParentCategorySelect from "@/components/CategorySelector";

// Deferred Parent Select - loads after initial render to prevent blocking
function DeferredParentSelect({
  parentIdNum,
  setParentIdNum,
  isSubmitting,
}: {
  parentIdNum: number | null;
  setParentIdNum: (id: number | null) => void;
  isSubmitting: boolean;
}) {
  const [shouldRender, setShouldRender] = React.useState(false);

  // Defer rendering until after initial mount to prevent blocking
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShouldRender(true);
    }, 150); // Small delay to let dialog animation complete
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (!shouldRender) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Parent Category
        </label>
        <div className="h-10 rounded-lg border border-gray-300 bg-gray-50 animate-pulse" />
        <p className="text-xs text-gray-500">
          Loading category selector...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="category-parent"
        className="block text-sm font-medium text-gray-900"
      >
        Parent Category
      </label>
      <ParentCategorySelect
        value={parentIdNum}
        onChange={(id: number | null) => {
          setParentIdNum(id);
        }}
        excludeId={undefined}
        pageSize={20}
        debounceMs={300}
        placeholder="Search for a parent category..."
        allowClear
        disabled={isSubmitting}
        className="w-full"
      />
      <p className="text-xs text-gray-500">
        Leave empty to create a top-level category, or select a parent to create a subcategory.
      </p>
    </div>
  );
}

// Deferred Image Uploader - loads after initial render to prevent blocking
function DeferredImageUploader({
  setValue,
}: {
  setValue: (name: "name" | "slug" | "parentId" | "isActive" | "image", value: any, options?: any) => void;
}) {
  const [shouldRender, setShouldRender] = React.useState(false);

  // Defer rendering until after initial mount to prevent blocking
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShouldRender(true);
    }, 200); // Delay a bit more since image uploader might be heavier
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (!shouldRender) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Category Image
        </label>
        <div className="h-32 rounded-lg border border-gray-300 bg-gray-50 animate-pulse" />
        <p className="text-xs text-gray-500">
          Loading image uploader...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Category Image
      </label>
      <ImageFileUploader
        label=""
        helperText="Upload JPEG, PNG, or WebP (max 5MB). Square images recommended (800×800px)."
        mode="single"
        accept={["image/*"]}
        maxSizeMB={5}
        folder="products/hero"
        defaultValue={null}
        onChange={(value: any) => {
          const imageValue = typeof value === 'string' ? value : (Array.isArray(value) && value.length > 0 ? value[0]?.url || null : null);
          (setValue as any)("image", imageValue, { shouldValidate: true, shouldDirty: true });
        }}
      />
      <p className="text-xs text-gray-500">
        This image will be displayed on category pages and listings.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CategoryCreateResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    image: string | null;
    isActive: boolean;
  };
  message?: string;
  error?: string;
  id?: number;
}

interface CategoryCreatePayload {
  name: string;
  slug: string;
  parentId: number | null;
  image: string | null;
  isActive: boolean;
  attributeSchema: Record<string, never>;
}

// ─────────────────────────────────────────────────────────────
// Schema with comprehensive validation
// ─────────────────────────────────────────────────────────────
const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(100, { message: "Category name cannot exceed 100 characters" })
    .trim()
    .refine((val) => val.length >= 2, {
      message: "Category name cannot be only whitespace",
    }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(120, { message: "Slug cannot exceed 120 characters" })
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens (no spaces or special characters)",
    })
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
      message: "Slug cannot start or end with a hyphen",
    }),
  parentId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" || val === null || val === undefined ? null : val))
    .refine((val) => val === null || /^\d+$/.test(val), {
      message: "Parent ID must be a valid number",
    }),
  isActive: z.boolean().default(true),
  image: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export type CategoryCreateFormValues = z.infer<typeof categoryCreateSchema>;

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────
function generateRandomString(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

function generateRandomCategoryName(): string {
  const prefixes = ["Premium", "Elite", "Pro", "Smart", "Ultra", "Plus", "Advanced", "Digital"];
  const types = ["Products", "Items", "Goods", "Collection", "Series", "Range", "Line", "Category"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const randomSuffix = generateRandomString(4);
  return `${prefix} ${type} ${randomSuffix}`;
}

// ─────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────
interface CategoryCreateFormProps {
  onSuccess?: (data?: CategoryCreateResponse["data"]) => void;
  onCancel?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function CategoryCreateForm({
  onSuccess,
  onCancel,
}: CategoryCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [parentIdNum, setParentIdNum] = React.useState<number | null>(null);
  const [autoSlugEnabled, setAutoSlugEnabled] = React.useState<boolean>(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<CategoryCreateFormValues>({
    resolver: zodResolver(categoryCreateSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      isActive: true,
      image: null,
    },
    mode: "onTouched",
  });

  // Lazy watch - only subscribe when needed to prevent blocking
  const [watchedName, setWatchedName] = React.useState("");
  const [watchedSlug, setWatchedSlug] = React.useState("");
  
  // Use debounced watch to prevent blocking
  const nameValue = watch("name");
  const slugValue = watch("slug");

  // Track previous values to prevent infinite loops
  const prevNameRef = React.useRef<string>("");
  const prevSlugRef = React.useRef<string>("");
  const prevParentIdRef = React.useRef<number | null>(null);

  // Debounce watched values to prevent excessive re-renders
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setWatchedName(nameValue || "");
      setWatchedSlug(slugValue || "");
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [nameValue, slugValue]);

  // Auto-generate slug from name when enabled - use startTransition for non-urgent updates
  React.useEffect(() => {
    // Only run if name actually changed
    if (watchedName === prevNameRef.current) return;
    prevNameRef.current = watchedName;

    if (autoSlugEnabled && watchedName && watchedName.trim()) {
      // Use startTransition to mark this as non-urgent
      React.startTransition(() => {
        const newSlug = slugify(watchedName);
        const currentSlug = watchedSlug || "";
        
        // Only update if slug is different and not empty
        if (newSlug && newSlug !== currentSlug) {
          prevSlugRef.current = newSlug;
          setValue("slug", newSlug, { 
            shouldValidate: false, // Don't trigger validation on auto-update
            shouldDirty: false,     // Don't mark as dirty on auto-update
            shouldTouch: false,     // Don't touch on auto-update
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedName, autoSlugEnabled]); // Removed watchedSlug and setValue to prevent loops

  // Sync parentId with the selector - use startTransition for non-urgent updates
  React.useEffect(() => {
    // Only run if parentId actually changed
    if (parentIdNum === prevParentIdRef.current) return;
    prevParentIdRef.current = parentIdNum;

    React.startTransition(() => {
      const newParentId = parentIdNum ? String(parentIdNum) : null;
      setValue("parentId", newParentId, {
        shouldValidate: false, // Don't trigger validation on sync
        shouldDirty: false,     // Don't mark as dirty on sync
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentIdNum]); // Removed setValue to prevent loops

  // Disable auto-slug when user manually edits slug - use startTransition
  const handleSlugChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    React.startTransition(() => {
      setValue("slug", value, { shouldValidate: true, shouldDirty: true });
      // Update ref to prevent loop
      prevSlugRef.current = value;
      
      if (value && value !== slugify(watchedName)) {
        setAutoSlugEnabled(false);
      }
    });
  }, [watchedName, setValue]);

  // Generate random name
  const handleGenerateRandomName = React.useCallback(() => {
    const randomName = generateRandomCategoryName();
    prevNameRef.current = randomName;
    setValue("name", randomName, { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true 
    });
    setAutoSlugEnabled(true);
    toast.info("Random category name generated");
  }, [setValue]);

  // Form submission handler
  const onSubmit = async (values: CategoryCreateFormValues) => {
    try {
      setIsSubmitting(true);
      
      toast.loading("Creating category...", { id: "create-category" });

      const payload: CategoryCreatePayload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        parentId: values.parentId ? Number(values.parentId) : null,
        image: values.image || null,
        isActive: values.isActive,
        attributeSchema: {},
      };

      const response = await api<CategoryCreateResponse>("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Validate response
      const isSuccess =
        response?.success === true ||
        Boolean(response?.data) ||
        Boolean(response?.id);

      if (!isSuccess) {
        throw new Error(
          response?.message ||
          response?.error ||
          "Failed to create category. Please try again."
        );
      }

      toast.success("Category created successfully!", {
        id: "create-category",
        description: `"${payload.name}" has been added to your categories.`,
      });

      // Reset form
      reset({
        name: "",
        slug: "",
        parentId: null,
        isActive: true,
        image: null,
      });
      setParentIdNum(null);
      setAutoSlugEnabled(true);

      // Call success callback
      onSuccess?.(response?.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the category.";

      toast.error("Failed to create category", {
        id: "create-category",
        description: errorMessage,
      });

      console.error("Category creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form reset handler
  const handleReset = () => {
    reset({
      name: "",
      slug: "",
      parentId: null,
      isActive: true,
      image: null,
    });
    setParentIdNum(null);
    setAutoSlugEnabled(true);
    toast.info("Form reset successfully");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {/* Name Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="category-name"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomName}
                  disabled={isSubmitting}
                  className="text-xs font-medium text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
                >
                  Generate Random
                </button>
              </div>
              <input
                id="category-name"
                type="text"
                autoComplete="off"
                disabled={isSubmitting}
                placeholder="e.g., Electronics, Fashion, Home & Garden"
                className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm outline-none transition-all focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-60"
                {...register("name")}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.name.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                This name will be displayed in navigation and category listings.
              </p>
            </div>

            {/* Slug Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="category-slug"
                  className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {autoSlugEnabled ? "Auto-generated" : "Manual"}
                </span>
              </div>
              <div className="relative">
                <input
                  id="category-slug"
                  type="text"
                  autoComplete="off"
                  disabled={isSubmitting}
                  placeholder="electronics-accessories"
                  className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm outline-none transition-all focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-60"
                  {...register("slug")}
                  onChange={handleSlugChange}
                />
              </div>
              {errors.slug && (
                <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            {/* Parent Category - Defer loading to prevent blocking */}
            <DeferredParentSelect
              parentIdNum={parentIdNum}
              setParentIdNum={setParentIdNum}
              isSubmitting={isSubmitting}
            />
            {errors.parentId && (
              <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.parentId.message}
              </p>
            )}

            {/* Category Image - Defer loading */}
            <DeferredImageUploader
              setValue={setValue}
            />

            {/* Active Status Toggle */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Category Status
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        watch("isActive")
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {watch("isActive") ? "✓ Active" : "○ Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Inactive categories will be hidden from customers and won't appear in navigation.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center ml-4">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    disabled={isSubmitting}
                    {...register("isActive")}
                  />
                  <div className="h-7 w-12 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                  <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white dark:bg-gray-200 shadow-lg transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting || !isDirty}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
          >
            {isSubmitting && (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSubmitting ? "Creating..." : "Create Category"}
          </button>
        </div>
      </div>
    </form>
  );
}