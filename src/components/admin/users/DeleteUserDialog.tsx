
// ==========================
// COMPONENTS – DELETE CONFIRM
// ==========================
// File: components/admin/users/DeleteUserDialog.tsx
"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DeleteUserDialog({ id, open, onOpenChange, onDeleted }: { id: number | null; open: boolean; onOpenChange: (v: boolean) => void; onDeleted: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!id) return;
              try {
                await api(`/api/admin/users/${id}`, { method: "DELETE" });
                onOpenChange(false);
                onDeleted();
              } catch (e: any) {
                // AlertDialogAction can't be disabled easily; use toast on error
              } finally {
                // success toast in caller
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
