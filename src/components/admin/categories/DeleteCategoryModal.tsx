"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import SimpleModal from "@/components/ui/SimpleModal";

export default function DeleteCategoryModal({
  open,
  onClose,
  categoryId,
  categoryName,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  categoryId: number | null;
  categoryName: string;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!categoryId) return;

    setIsDeleting(true);
    try {
      await api(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      toast.success("Category deleted successfully");
      onDeleted();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open || !categoryId) return null;

  return (
    <SimpleModal
      open={open}
      onClose={onClose}
      title="Delete Category"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-black">
          Are you sure you want to delete <strong>{categoryName}</strong>?
        </p>
        <p className="text-sm text-gray-600">
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-black">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}

