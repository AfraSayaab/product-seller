
"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function DeleteCategoryDialog({
  id,
  open,
  onOpenChange,
  onDeleted,
}: {
  id: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res :any = await api(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res?.success === false) throw new Error(res?.message || "Delete failed");
      toast.success("Category deleted");
      onDeleted?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The category will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
