"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ChangePasswordSchema } from "@/lib/validators";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

export default function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    try {
      setIsSubmitting(true);
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      toast.success("Password Updated Successfully", {
        description: "Your password has been changed. Please use your new password to sign in next time.",
        duration: 5000,
      });

      // Reset form
      form.reset();
    } catch (error: any) {
      // Handle specific error cases with user-friendly messages
      const errorMessage = error.message || "";
      let title = "Unable to Change Password";
      let description = "An unexpected error occurred. Please try again.";

      // Handle validation errors with user-friendly messages
      if (errorMessage.includes("Current password is required") || errorMessage.includes("current password")) {
        title = "Current Password Required";
        description = "Please enter your current password to continue.";
      } else if (errorMessage.includes("New password is required") || errorMessage.includes("new password")) {
        title = "New Password Required";
        description = "Please enter your new password. It must be at least 8 characters long.";
      } else if (errorMessage.includes("at least 8 characters")) {
        title = "Password Too Short";
        description = "Your new password must be at least 8 characters long. Please choose a stronger password.";
      } else if (errorMessage.includes("do not match") || errorMessage.includes("match")) {
        title = "Passwords Don't Match";
        description = "The new password and confirmation password must be the same. Please check and try again.";
      } else if (errorMessage.includes("different from your current")) {
        title = "Password Must Be Different";
        description = "Your new password must be different from your current password. Please choose a different password.";
      } else if (errorMessage.includes("Current password is incorrect") || errorMessage.includes("INVALID_PASSWORD")) {
        title = "Incorrect Current Password";
        description = "The current password you entered is incorrect. Please verify and try again.";
      } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("UNAUTHORIZED")) {
        title = "Session Expired";
        description = "Your session has expired. Please sign in again to change your password.";
      } else if (errorMessage.includes("Invalid token") || errorMessage.includes("INVALID_TOKEN")) {
        title = "Authentication Required";
        description = "Please sign in again to continue.";
      } else if (errorMessage.includes("VALIDATION") || errorMessage.includes("validation") || errorMessage.includes("Please check")) {
        title = "Please Check Your Input";
        description = errorMessage || "Please fill in all required fields correctly and try again.";
      } else if (errorMessage.includes("Network") || errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
        title = "Connection Error";
        description = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (errorMessage.includes("User not found") || errorMessage.includes("USER_NOT_FOUND")) {
        title = "Account Not Found";
        description = "We couldn't find your account. Please sign in again.";
      } else if (errorMessage.trim() !== "") {
        // Use the error message directly if it's user-friendly
        title = "Unable to Change Password";
        description = errorMessage;
      }

      toast.error(title, {
        description,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <Label className="text-foreground/90">{label}</Label>
      <div>{children}</div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <Card className="border-foreground/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>Update your account password. Make sure to use a strong password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Current Password" error={form.formState.errors.currentPassword?.message}>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                {...form.register("currentPassword")}
                className="bg-background pr-10"
                placeholder="Enter your current password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Field label="New Password" error={form.formState.errors.newPassword?.message}>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                {...form.register("newPassword")}
                className="bg-background pr-10"
                placeholder="Enter your new password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm New Password" error={form.formState.errors.confirmPassword?.message}>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...form.register("confirmPassword")}
                className="bg-background pr-10"
                placeholder="Confirm your new password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

