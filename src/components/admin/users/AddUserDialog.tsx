// ==========================
// ADD USER DIALOG
// ==========================
// File: components/admin/users/AddUserDialog.tsx
"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UserCreateForm from "../forms/UserForm";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export default function AddUserDialog({
  open,
  onOpenChange,
  onCreated,
}: AddUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1">
          <UserCreateForm
            onSuccess={() => {
              onCreated();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

