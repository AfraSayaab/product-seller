"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// 👉 Replace this import with your existing uploader.
// Must call onChange(fileName: string | null)
// import ImageUpload from "@/components/common/ImageUpload";

const Schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional(),
  attributeSchema: z.string().optional(), // raw JSON string
});

type Values = z.infer<typeof Schema>;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CategoryCreateForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: "",
      isActive: true,
      image: null,
      attributeSchema: "{}",
    },
    mode: "onTouched",
  });

  // Auto-slug from name if slug is empty
  React.useEffect(() => {
    const sub = form.watch((v, { name }) => {
      if (name === "name") {
        const n = (v as any).name as string;
        if (n && !form.getValues("slug")) {
          form.setValue("slug", slugify(n), { shouldValidate: true });
        }
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const onSubmit = async (values: Values) => {
    try {
      setSubmitting(true);

      // Validate JSON
      let attr: any = {};
      if (values.attributeSchema && values.attributeSchema.trim().length) {
        try {
          attr = JSON.parse(values.attributeSchema);
        } catch {
          throw new Error("Attribute schema must be valid JSON.");
        }
      }

      const payload = {
        name: values.name,
        slug: values.slug,
        parentId: values.parentId ? Number(values.parentId) : null,
        image: values.image || null,
        isActive: values.isActive,
        attributeSchema: attr,
      };

      const res = await api<any>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res?.success && !res?.id) {
        // compatible with your examples
        // if API returns success/data else throw:
        throw new Error(res?.message || "Failed to create category");
      }

      toast.success("Category created");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Laptops" disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="laptops" disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Id (optional) */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent ID (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="numeric id"
                  inputMode="numeric"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload (your existing uploader) */}
        {/* <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <ImageUpload
                    value={field.value || ""}
                    onChange={(fileName: string | null) => field.onChange(fileName)}
                  />
                  {field.value ? (
                    <span className="text-xs text-muted-foreground">{field.value}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No image selected</span>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Active */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel className="m-0">Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={submitting} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Attribute schema (JSON) */}
        <FormField
          control={form.control}
          name="attributeSchema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribute Schema (JSON)</FormLabel>
              <FormControl>
                <Textarea rows={4} disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
