"use client";

import * as React from "react";
import SimpleModal from "@/components/ui/SimpleModal";
import CategoryForm from "./CategoryForm";

export default function AddCategoryModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSuccess = React.useCallback(() => {
    onCreated();
    onOpenChange(false);
  }, [onCreated, onOpenChange]);

  return (
    <SimpleModal
      open={open}
      onClose={handleClose}
      title="Create Category"
      size="lg"
    >
      <CategoryForm
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </SimpleModal>
  );
}

