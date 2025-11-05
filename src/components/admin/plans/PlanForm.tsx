"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface PlanFormData {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  durationDays: number;
  maxActiveListings: number;
  quotaListings: number;
  quotaPhotosPerListing: number;
  quotaVideosPerListing: number;
  quotaBumps: number;
  quotaFeaturedDays: number;
  maxCategories: number;
  isSticky: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

interface PlanFormProps {
  initialData?: Partial<PlanFormData>;
  planId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CURRENCIES = ["PKR", "USD", "EUR", "GBP", "AED", "INR"] as const;

export default function PlanForm({
  initialData,
  planId,
  onSuccess,
  onCancel,
}: PlanFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Helper to convert Decimal/string to number
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return Number(value) || 0;
  };

  const toInt = (value: any): number => {
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'string') return parseInt(value) || 0;
    return Math.floor(Number(value)) || 0;
  };

  const [formData, setFormData] = React.useState<PlanFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description ?? null,
    price: toNumber(initialData?.price),
    currency: initialData?.currency || "PKR",
    durationDays: toInt(initialData?.durationDays) || 7,
    maxActiveListings: toInt(initialData?.maxActiveListings),
    quotaListings: toInt(initialData?.quotaListings),
    quotaPhotosPerListing: toInt(initialData?.quotaPhotosPerListing) || 8,
    quotaVideosPerListing: toInt(initialData?.quotaVideosPerListing),
    quotaBumps: toInt(initialData?.quotaBumps),
    quotaFeaturedDays: toInt(initialData?.quotaFeaturedDays),
    maxCategories: toInt(initialData?.maxCategories) || 1,
    isSticky: initialData?.isSticky ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const [autoSlug, setAutoSlug] = React.useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure all numeric values are properly converted to numbers
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || null,
        price: typeof formData.price === 'number' ? formData.price : parseFloat(String(formData.price)) || 0,
        currency: formData.currency,
        durationDays: typeof formData.durationDays === 'number' ? formData.durationDays : parseInt(String(formData.durationDays)) || 7,
        maxActiveListings: typeof formData.maxActiveListings === 'number' ? formData.maxActiveListings : parseInt(String(formData.maxActiveListings)) || 0,
        quotaListings: typeof formData.quotaListings === 'number' ? formData.quotaListings : parseInt(String(formData.quotaListings)) || 0,
        quotaPhotosPerListing: typeof formData.quotaPhotosPerListing === 'number' ? formData.quotaPhotosPerListing : parseInt(String(formData.quotaPhotosPerListing)) || 8,
        quotaVideosPerListing: typeof formData.quotaVideosPerListing === 'number' ? formData.quotaVideosPerListing : parseInt(String(formData.quotaVideosPerListing)) || 0,
        quotaBumps: typeof formData.quotaBumps === 'number' ? formData.quotaBumps : parseInt(String(formData.quotaBumps)) || 0,
        quotaFeaturedDays: typeof formData.quotaFeaturedDays === 'number' ? formData.quotaFeaturedDays : parseInt(String(formData.quotaFeaturedDays)) || 0,
        maxCategories: typeof formData.maxCategories === 'number' ? formData.maxCategories : parseInt(String(formData.maxCategories)) || 1,
        isSticky: Boolean(formData.isSticky),
        isFeatured: Boolean(formData.isFeatured),
        isActive: Boolean(formData.isActive),
      };

      if (planId) {
        await api(`/api/admin/plans/${planId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Plan updated successfully");
      } else {
        await api("/api/admin/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Plan created successfully");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Plan Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          placeholder="e.g., Free, Featured, Spotlight"
        />
      </div>

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
          placeholder="plan-slug"
        />
        <p className="text-xs text-gray-600">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Description
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value || null }))}
          disabled={isSubmitting}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all resize-none"
          placeholder="Plan description (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Price <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            required
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Currency <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
            required
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Duration (Days) <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.durationDays}
          onChange={(e) => setFormData((prev) => ({ ...prev, durationDays: parseInt(e.target.value) || 1 }))}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          placeholder="7"
        />
        <p className="text-xs text-gray-600">Subscription duration in days (e.g., 7, 30)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Max Active Listings
          </label>
          <input
            type="number"
            min="0"
            value={formData.maxActiveListings}
            onChange={(e) => setFormData((prev) => ({ ...prev, maxActiveListings: parseInt(e.target.value) || 0 }))}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="0"
          />
          <p className="text-xs text-gray-600">Overall cap for active listings</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Quota Listings
          </label>
          <input
            type="number"
            min="0"
            value={formData.quotaListings}
            onChange={(e) => setFormData((prev) => ({ ...prev, quotaListings: parseInt(e.target.value) || 0 }))}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="0"
          />
          <p className="text-xs text-gray-600">New listings allowed in period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Photos Per Listing
          </label>
          <input
            type="number"
            min="0"
            value={formData.quotaPhotosPerListing}
            onChange={(e) => setFormData((prev) => ({ ...prev, quotaPhotosPerListing: parseInt(e.target.value) || 0 }))}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="8"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Videos Per Listing
          </label>
          <input
            type="number"
            min="0"
            value={formData.quotaVideosPerListing}
            onChange={(e) => setFormData((prev) => ({ ...prev, quotaVideosPerListing: parseInt(e.target.value) || 0 }))}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Max Categories
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxCategories}
            onChange={(e) => setFormData((prev) => ({ ...prev, maxCategories: parseInt(e.target.value) || 1 }))}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="1"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">
            Quota Bumps
          </label>
          <input
            type="number"
            min="0"
            value={formData.quotaBumps}
            onChange={(e) => setFormData((prev) => ({ ...prev, quotaBumps: parseInt(e.target.value) || 0 }))}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-black">
          Featured Days
        </label>
        <input
          type="number"
          min="0"
          value={formData.quotaFeaturedDays}
          onChange={(e) => setFormData((prev) => ({ ...prev, quotaFeaturedDays: parseInt(e.target.value) || 0 }))}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          placeholder="0"
        />
        <p className="text-xs text-gray-600">Number of featured days included</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-300 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-black mb-1">
                Sticky Feature
              </label>
              <p className="text-xs text-gray-600">Enable sticky listing feature</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isSticky}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isSticky: e.target.checked }))}
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black peer-focus:ring-offset-2 rounded-full transition-colors peer-checked:bg-black peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-md"></div>
              </div>
              <span className="text-sm font-bold text-black min-w-[60px]">
                {formData.isSticky ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-black mb-1">
                Featured Feature
              </label>
              <p className="text-xs text-gray-600">Enable featured listing feature</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black peer-focus:ring-offset-2 rounded-full transition-colors peer-checked:bg-black peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-md"></div>
              </div>
              <span className="text-sm font-bold text-black min-w-[60px]">
                {formData.isFeatured ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-gray-300 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-black mb-1">
                Plan Status
              </label>
              <p className="text-xs text-gray-600">Active plans are visible to users</p>
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
      </div>

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
            planId ? "Update Plan" : "Create Plan"
          )}
        </button>
      </div>
    </form>
  );
}

