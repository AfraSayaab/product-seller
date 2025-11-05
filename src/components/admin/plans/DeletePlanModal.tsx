"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import SimpleModal from "@/components/ui/SimpleModal";

export default function DeletePlanModal({
  open,
  onClose,
  planId,
  planName,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  planId: number | null;
  planName: string;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!planId) return;

    setIsDeleting(true);
    try {
      await api(`/api/admin/plans/${planId}`, {
        method: "DELETE",
      });
      toast.success("Plan deleted successfully");
      onDeleted();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open || !planId) return null;

  return (
    <SimpleModal
      open={open}
      onClose={onClose}
      title="Delete Plan"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-black">
          Are you sure you want to delete <strong>{planName}</strong>?
        </p>
        <p className="text-sm text-gray-600">
          This action cannot be undone. If this plan has active subscriptions, deletion will fail.
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

