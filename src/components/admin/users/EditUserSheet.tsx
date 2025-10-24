"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
import UserEditForm from "../forms/UserEditForm";

export default function EditUserSheet({
  id,
  open,
  onOpenChange,
  onUpdated,
}: {
  id: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: () => void;
}) {
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
      <SheetContent className="sm:max-w-2xl p-0">
        <SheetHeader className="p-5 border-b">
          <SheetTitle>Edit User</SheetTitle>
        </SheetHeader>

        <div className="relative h-[calc(100vh-8rem)] overflow-y-auto px-5 pb-10">
          {loading && (
            <LoaderOverlay label="Loading user details..." className="bg-background/70" />
          )}

          {init && (
            <UserEditForm
              initial={init}
              onSubmit={(values) => {
                api(`/api/admin/users/${id}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    ...values,
                    // map newPassword -> password if your API expects `passwordHash` server-side
                    password: values.newPassword || undefined,
                  }),

                })
                onUpdated()
              }
              }
              submitting={submitting}
              lockIdentity
            />

          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
