// ==========================
// COMPONENTS – ADD USER
// ==========================
// File: components/admin/users/AddUserDialog.tsx
"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserForm from "../forms/UserForm";

export default function AddUserDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <UserForm
          mode="create"
          onSubmit={async (values) => {
            setSubmitting(true);
            try {
              const payload = { ...values, password: values.password || "changeme" };
              await api(`/api/admin/users`, { method: "POST", body: JSON.stringify(payload) });
              toast.success("User created");
              onOpenChange(false);
              onCreated();
            } catch (e: any) {
              toast.error(e.message || "Failed to create");
            } finally {
              setSubmitting(false);
            }
          }}
          submitting={submitting}
        />
      </DialogContent>
    </Dialog>
  );
}
