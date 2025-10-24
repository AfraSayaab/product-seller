// ==========================
// COMPONENTS – EDIT USER
// ==========================
// File: components/admin/users/EditUserSheet.tsx
"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import UserForm from "../forms/UserForm";

export default function EditUserSheet({ id, open, onOpenChange, onUpdated }: { id: number | null; open: boolean; onOpenChange: (v: boolean) => void; onUpdated: () => void }) {
  const [init, setInit] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    api(`/api/admin/users/${id}`)
      .then(setInit)
      .catch((e) => toast.error(e.message || "Failed to load user"))
      .finally(() => setLoading(false));
  }, [open, id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
        </SheetHeader>
        {init && (
          <UserForm
            mode="edit"
            initial={init}
            onSubmit={async (values) => {
              if (!id) return;
              setSubmitting(true);
              try {
                await api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(values) });
                toast.success("User updated");
                onOpenChange(false);
                onUpdated();
              } catch (e: any) {
                toast.error(e.message || "Failed to update");
              } finally {
                setSubmitting(false);
              }
            }}
            submitting={submitting}
          />
        )}
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      </SheetContent>
    </Sheet>
  );
}
