"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
import CategoryEditForm from "../forms/CategoryEditForm";

export default function EditCategorySheet({
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

  React.useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    api(`/api/admin/categories?q=&page=1&pageSize=1&withCounts=false`)
      .catch(() => null) // not required; we will read single below
      .finally(() => {});
    api(`/api/admin/categories/${id}`)
      .then((d) => setInit(d))
      .catch((e) => toast.error(e.message || "Failed to load category"))
      .finally(() => setLoading(false));
  }, [open, id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl p-0">
        <SheetHeader className="p-5 border-b">
          <SheetTitle>Edit Category</SheetTitle>
        </SheetHeader>

        <div className="relative h-[calc(100vh-8rem)] overflow-y-auto px-5 pb-10">
          {loading && <LoaderOverlay label="Loading…" className="bg-background/70" />}

          {init && (
            <CategoryEditForm
              initial={init}
              onSubmit={async (values) => {
                try {
                  const payload = {
                    name: values.name,
                    slug: values.slug,
                    parentId: values.parentId ? Number(values.parentId) : null,
                    image: values.image || null,
                    isActive: values.isActive,
                    attributeSchema: values.attributeSchemaParsed,
                  };
                  await api(`/api/admin/categories/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                  });
                  toast.success("Category updated");
                  onUpdated?.();
                } catch (e: any) {
                  toast.error(e.message || "Failed to update category");
                }
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
