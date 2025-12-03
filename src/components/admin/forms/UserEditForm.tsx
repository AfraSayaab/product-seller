// components/admin/users/UserEditForm.tsx
"use client";
import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // npx shadcn add textarea

// ---------------------------------------------
// Edit-only schema (no required password)
// ---------------------------------------------
const UserEditSchema = z.object({
  username: z.string().min(3, "Min 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Invalid phone"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  // Optional profile fields
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
  displayPublicAs: z.string().optional().nullable(),
  website: z.string().url().optional().or(z.literal("")).nullable(),
  whatsapp: z.string().optional().nullable(),
  biography: z.string().optional().nullable(),
  publicAddress: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  pinterest: z.string().optional().nullable(),
  behance: z.string().optional().nullable(),
  dribbble: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  vimeo: z.string().optional().nullable(),
  flickr: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  isFirstLogin: z.boolean().optional(),
  // edit-only: newPassword optional
  newPassword: z.string().min(6, "Min 6 characters").optional().or(z.literal("")),
});
export type UserEditInput = z.infer<typeof UserEditSchema>;

// ---------------------------------------------
// Component
// ---------------------------------------------
export default function UserEditForm({
  initial,
  onSubmit,
  submitting,
  lockIdentity = false, // if true, make username/email readOnly
  className,
}: {
  initial: Partial<UserEditInput> & { id?: number };
  onSubmit: (v: UserEditInput) => void;
  submitting?: boolean;
  lockIdentity?: boolean;
  className?: string;
}) {
  const form = useForm<UserEditInput>({
    resolver: zodResolver(UserEditSchema) as Resolver<UserEditInput>,
    defaultValues: {
      username: initial?.username || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      role: (initial?.role as any) || "USER",
      firstName: (initial as any)?.firstName || "",
      lastName: (initial as any)?.lastName || "",
      nickname: (initial as any)?.nickname || "",
      displayPublicAs: (initial as any)?.displayPublicAs || "",
      website: (initial as any)?.website || "",
      whatsapp: (initial as any)?.whatsapp || "",
      biography: (initial as any)?.biography || "",
      publicAddress: (initial as any)?.publicAddress || "",
      facebook: (initial as any)?.facebook || "",
      twitter: (initial as any)?.twitter || "",
      linkedin: (initial as any)?.linkedin || "",
      pinterest: (initial as any)?.pinterest || "",
      behance: (initial as any)?.behance || "",
      dribbble: (initial as any)?.dribbble || "",
      instagram: (initial as any)?.instagram || "",
      youtube: (initial as any)?.youtube || "",
      vimeo: (initial as any)?.vimeo || "",
      flickr: (initial as any)?.flickr || "",
      isVerified: Boolean((initial as any)?.isVerified) || false,
      isFirstLogin: Boolean((initial as any)?.isFirstLogin) || false,
      newPassword: "",
    },
    mode: "onBlur",
  });

  // unified field wrapper
  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <Label className="text-foreground/90">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <form
      onSubmit={form.handleSubmit((v) => onSubmit(v as any))}
      className={cn("flex flex-col gap-6 text-foreground", className)}
    >
      {/* Account */}
      <Card className="border-foreground/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Username" error={form.formState.errors.username?.message as string}>
              <Input {...form.register("username")} className="bg-background" readOnly={lockIdentity} />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message as string}>
              <Input type="email" {...form.register("email")} className="bg-background" readOnly={lockIdentity} />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message as string}>
              <Input {...form.register("phone")} className="bg-background" />
            </Field>
            <div>
              <Label className="text-foreground/90">Role</Label>
              <div className="mt-1">
                <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v as any)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Field label="New Password (optional)" error={form.formState.errors.newPassword?.message as string}>
              <Input type="password" placeholder="Leave blank to keep current" {...form.register("newPassword")} className="bg-background" />
            </Field>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.watch("isVerified") || false} onCheckedChange={(v) => form.setValue("isVerified", v)} />
              <Label>Verified</Label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.watch("isFirstLogin") || false} onCheckedChange={(v) => form.setValue("isFirstLogin", v)} />
              <Label>First Login</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity */}
      <Card className="border-foreground/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" error={form.formState.errors.firstName?.message as string}>
              <Input {...form.register("firstName")} className="bg-background" />
            </Field>
            <Field label="Last name" error={form.formState.errors.lastName?.message as string}>
              <Input {...form.register("lastName")} className="bg-background" />
            </Field>
            <Field label="Nickname" error={form.formState.errors.nickname?.message as string}>
              <Input {...form.register("nickname")} className="bg-background" />
            </Field>
            <Field label="Display public as" error={form.formState.errors.displayPublicAs?.message as string}>
              <Input {...form.register("displayPublicAs")} className="bg-background" />
            </Field>
            <Field label="Public address" error={form.formState.errors.publicAddress?.message as string}>
              <Input {...form.register("publicAddress")} className="bg-background" />
            </Field>
            <Field label="Biography" error={form.formState.errors.biography?.message as string}>
              <Textarea rows={4} {...form.register("biography")} className="bg-background" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Social */}
      <Card className="border-foreground/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Contact & Social</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ["website", "Website", "https://"],
              ["whatsapp", "WhatsApp", "e.g. +92…"],
              ["facebook", "Facebook", ""],
              ["twitter", "Twitter / X", ""],
              ["linkedin", "LinkedIn", ""],
              ["pinterest", "Pinterest", ""],
              ["behance", "Behance", ""],
              ["dribbble", "Dribbble", ""],
              ["instagram", "Instagram", ""],
              ["youtube", "YouTube", ""],
              ["vimeo", "Vimeo", ""],
              ["flickr", "Flickr", ""],
            ] as const).map(([key, label, ph]) => (
              <Field key={key} label={label} error={(form.formState.errors as any)[key]?.message as string}>
                <Input placeholder={ph} {...form.register(key as any)} className="bg-background" />
              </Field>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()} disabled={submitting}>
          Reset
        </Button>
        <Button type="submit" disabled={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

// Usage (inside EditUserSheet for example):
// <UserEditForm initial={user} onSubmit={(v)=> patchUser(v)} submitting={loading} lockIdentity />
