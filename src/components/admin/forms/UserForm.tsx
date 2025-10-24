
// ==========================
// COMPONENTS – USER FORM (create/edit)
// ==========================
// File: components/admin/users/UserForm.tsx
"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserUpsertSchema, UserUpsertInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function UserForm({ mode, initial, onSubmit, submitting }: { mode: "create" | "edit"; initial?: any; onSubmit: (v: any) => void; submitting?: boolean }) {
  const form = useForm<UserUpsertInput>({
    resolver: zodResolver(UserUpsertSchema.refine((data) => (mode === "create" ? !!data.password : true), {
      message: "Password required",
      path: ["password"],
    })),
    defaultValues: {
      username: initial?.username || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      role: initial?.role || "USER",
      firstName: initial?.firstName || "",
      lastName: initial?.lastName || "",
      isVerified: initial?.isVerified || false,
      password: "",
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((v) => onSubmit(v))}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Username</Label>
          <Input {...form.register("username")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...form.register("phone")} />
        </div>
        <div>
          <Label>First name</Label>
          <Input {...form.register("firstName")} />
        </div>
        <div>
          <Label>Last name</Label>
          <Input {...form.register("lastName")} />
        </div>
        <div>
          <Label>Role</Label>
          <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {mode === "create" && (
          <div>
            <Label>Password</Label>
            <Input type="password" {...form.register("password")} />
          </div>
        )}
        {mode === "edit" && (
          <div>
            <Label>New Password (optional)</Label>
            <Input type="password" placeholder="Leave blank to keep current" {...form.register("password")} />
          </div>
        )}
        <div className="flex items-center gap-2 pt-6">
          <Switch checked={form.watch("isVerified")} onCheckedChange={(v) => form.setValue("isVerified", v)} />
          <Label>Verified</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>{mode === "create" ? "Create" : "Save changes"}</Button>
      </div>
    </form>
  );
}
