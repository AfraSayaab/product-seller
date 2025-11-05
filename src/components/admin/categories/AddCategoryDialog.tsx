"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import CustomModal from "@/components/ui/CustomModal";
import CategoryCreateForm from "../forms/CategoryCreateForm";

export default function AddCategoryDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  // Use key to force remount when dialog closes to reset form state
  const [formKey, setFormKey] = React.useState(0);
  const [shouldRenderForm, setShouldRenderForm] = React.useState(false);

  // Defer form rendering until modal is fully open to prevent blocking
  React.useEffect(() => {
    if (open) {
      // Use requestAnimationFrame to defer rendering until after modal animation
      const rafId = requestAnimationFrame(() => {
        const timeoutId = setTimeout(() => {
          setShouldRenderForm(true);
        }, 50); // Small delay to let modal animation complete
        
        return () => clearTimeout(timeoutId);
      });
      
      return () => cancelAnimationFrame(rafId);
    } else {
      // Reset when closing
      setShouldRenderForm(false);
      setFormKey((k) => k + 1);
    }
  }, [open]);

  const handleSuccess = React.useCallback(() => {
    onCreated();
    onOpenChange(false);
  }, [onCreated, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <CustomModal
      open={open}
      onClose={handleCancel}
      title="Create New Category"
      description="Add a new product category to organize your products effectively. Slug auto-generates and can be edited."
      size="lg"
      showCloseButton={true}
    >
      {shouldRenderForm ? (
        <CategoryCreateForm
          key={formKey}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <Plus className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading form...
          </p>
        </div>
      )}
    </CustomModal>
  );
}
