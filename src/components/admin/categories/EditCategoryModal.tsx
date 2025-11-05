"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CategoryForm from "./CategoryForm";

export default function EditCategoryModal({
  open,
  onClose,
  categoryId,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  categoryId: number | null;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [categoryData, setCategoryData] = React.useState<any>(null);

  // Fetch category data when sheet opens
  React.useEffect(() => {
    if (open && categoryId) {
      setLoading(true);
      api(`/api/admin/categories/${categoryId}`)
        .then((data) => {
          setCategoryData(data);
        })
        .catch((error: any) => {
          toast.error(error.message || "Failed to load category");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCategoryData(null);
    }
  }, [open, categoryId, onClose]);

  const handleSuccess = React.useCallback(() => {
    onUpdated();
    onClose();
  }, [onUpdated, onClose]);

  if (!categoryId) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Make changes to your category here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">Loading category data...</p>
            </div>
          ) : categoryData ? (
            <CategoryForm
              initialData={categoryData}
              categoryId={categoryId}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

