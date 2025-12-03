"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// 👉 Replace with your uploader
// import ImageUpload from "@/components/common/ImageUpload";

const Schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  parentId: z.string().optional().nullable(),
  image: z.string().nullable().optional(),
  isActive: z.boolean(),
  attributeSchema: z.string().optional(),
});

type Values = z.infer<typeof Schema>;

export default function CategoryEditForm({
  initial,
  onSubmit,
}: {
  initial: any;
  onSubmit: (v: {
    name: string;
    slug: string;
    parentId: number | null;
    image: string | null;
    isActive: boolean;
    attributeSchemaParsed: any;
  }) => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: initial?.name || "",
      slug: initial?.slug || "",
      parentId: initial?.parentId ? String(initial.parentId) : "",
      image: initial?.image || null,
      isActive: Boolean(initial?.isActive),
      attributeSchema:
        JSON.stringify(initial?.attributeSchema ?? {}, null, 2),
    },
    mode: "onTouched",
  });

  const handleSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      let parsed: any = {};
      if (values.attributeSchema && values.attributeSchema.trim().length) {
        parsed = JSON.parse(values.attributeSchema);
      }
      await onSubmit({
        name: values.name,
        slug: values.slug,
        parentId: values.parentId ? Number(values.parentId) : null,
        image: values.image || null,
        isActive: values.isActive,
        attributeSchemaParsed: parsed,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={submitting} {...field} />
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
                <Input disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => {
            const { value, ...rest } = field;
            return (
              <FormItem>
                <FormLabel>Parent ID (optional)</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" disabled={submitting} {...rest} value={value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Image */}
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

        {/* Attribute schema */}
        <FormField
          control={form.control}
          name="attributeSchema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribute Schema (JSON)</FormLabel>
              <FormControl>
                <Textarea rows={6} disabled={submitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
