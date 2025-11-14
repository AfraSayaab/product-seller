// ===============================
// components/listings/ListingForm.tsx
// Listing form component for create/edit
// ===============================
"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ParentCategorySelect from "@/components/CategorySelector";
import SortableImageUploader from "@/components/uploader/SortableImageUploader";
import GoogleMapsLocationPicker from "@/components/location/GoogleMapsLocationPicker";
import type { UploadItem } from "@/components/admin/types/uploader";

type ListingFormData = {
  categoryId: number | null;
  location: {
    country: string;
    state?: string | null;
    city: string;
    area?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  negotiable: boolean;
  status: string;
  isPhoneVisible: boolean;
  images: UploadItem[];
};

type ListingFormProps = {
  initialData?: any;
  listingId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  isAdmin?: boolean;
};

const CURRENCIES = ["PKR", "USD", "EUR", "GBP", "AED", "INR"];
const CONDITIONS = ["NEW", "LIKE_NEW", "USED", "FOR_PARTS"];
const STATUSES = ["DRAFT", "PENDING", "ACTIVE", "PAUSED"];

export default function ListingForm({
  initialData,
  listingId,
  onSuccess,
  onCancel,
  isAdmin = false,
}: ListingFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<ListingFormData>({
    categoryId: initialData?.categoryId || null,
    location: initialData?.location || null,
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    currency: initialData?.currency || "PKR",
    condition: initialData?.condition || "USED",
    negotiable: initialData?.negotiable ?? true,
    status: initialData?.status || "DRAFT",
    isPhoneVisible: initialData?.isPhoneVisible ?? true,
    images: initialData?.images?.map((img: any) => ({
      key: img.url || img.key || "",
      url: img.url || "",
      name: img.name || "Image",
      size: img.size || 0,
      type: img.type || "image/*",
    })) || [],
  });

  // Convert existing images to UploadItem format
  React.useEffect(() => {
    if (initialData?.images && initialData.images.length > 0 && formData.images.length === 0) {
      const convertedImages = initialData.images.map((img: any, index: number) => ({
        key: img.url || `existing-${index}`,
        url: img.url || "",
        name: `Image ${index + 1}`,
        size: 0,
        type: "image/*",
      }));
      setFormData((prev) => ({ ...prev, images: convertedImages }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.images]);

  // Memoize callbacks to prevent re-renders
  const handleCurrencyChange = React.useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, currency: value }));
  }, []);

  const handleConditionChange = React.useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, condition: value }));
  }, []);

  const handleStatusChange = React.useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  }, []);

  const handleCategoryChange = React.useCallback((id: number | null) => {
    setFormData((prev) => ({ ...prev, categoryId: id }));
  }, []);

  const handleLocationChange = React.useCallback((location: any) => {
    setFormData((prev) => ({ ...prev, location }));
  }, []);

  const handleImagesChange = React.useCallback((images: UploadItem[]) => {
    setFormData((prev) => ({ ...prev, images }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.categoryId) {
        toast.error("Category is required");
        setIsSubmitting(false);
        return;
      }
      if (!formData.title.trim()) {
        toast.error("Title is required");
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        toast.error("Description is required");
        setIsSubmitting(false);
        return;
      }
      if (formData.price <= 0) {
        toast.error("Price must be greater than 0");
        setIsSubmitting(false);
        return;
      }
      if (formData.images.length === 0) {
        toast.error("At least one image is required");
        setIsSubmitting(false);
        return;
      }

      // Prepare payload
      const payload: any = {
        categoryId: formData.categoryId,
        location: formData.location,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.price,
        currency: formData.currency,
        condition: formData.condition,
        negotiable: formData.negotiable,
        isPhoneVisible: formData.isPhoneVisible,
        images: formData.images.map((img, index) => ({
          url: img.url,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      };

      // Only include status for admin or if explicitly set
      if (isAdmin || formData.status) {
        payload.status = formData.status;
      }

      if (listingId) {
        // Update
        await api(`/api/listings/${listingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Listing updated successfully");
      } else {
        // Create
        await api("/api/listings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Listing created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{listingId ? "Edit Listing" : "Create New Listing"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <ParentCategorySelect
              value={formData.categoryId}
              onChange={handleCategoryChange}
              placeholder="Select a category..."
              allowClear={false}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <GoogleMapsLocationPicker
              value={formData.location}
              onChange={handleLocationChange}
              label="Location"
              helperText="Search and select the location for your listing"
              disabled={isSubmitting}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter listing title..."
              maxLength={180}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/180 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your listing in detail..."
              rows={6}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Currency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.currency || "PKR"}
                onValueChange={handleCurrencyChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Condition and Negotiable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Condition <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.condition || "USED"}
                onValueChange={handleConditionChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Negotiable</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.negotiable}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, negotiable: checked }))}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-muted-foreground">
                  Price is negotiable
                </span>
              </div>
            </div>
          </div>

          {/* Status (Admin only) */}
          {isAdmin && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status || "DRAFT"}
                onValueChange={handleStatusChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Phone Visibility */}
          <div className="space-y-2">
            <Label>Phone Visibility</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={formData.isPhoneVisible}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPhoneVisible: checked }))}
                disabled={isSubmitting}
              />
              <span className="text-sm text-muted-foreground">
                Show phone number in listing
              </span>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>
              Images <span className="text-destructive">*</span>
            </Label>
            <SortableImageUploader
              maxFiles={10}
              maxSizeMB={5}
              folder="listings/images"
              defaultValue={formData.images}
              onChange={handleImagesChange}
              disabled={isSubmitting}
              helperText="Upload up to 10 images. Drag to reorder. First image will be the primary image."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : listingId ? "Update Listing" : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}

