"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

import EditCategorySheet from "./EditCategorySheet";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  image: string | null;
  createdAt?: string;
  attributeSchema?: Record<string, any>;
};

export default function CategoriesTable({
  rows,
  pagination,
  sort,
  loading,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onChanged,
}: {
  rows: Category[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  loading: boolean;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (ps: number) => void;
  onSortChange?: (s: string) => void;
  onChanged?: () => void;
}) {
  const [openEditId, setOpenEditId] = React.useState<number | null>(null);
  const [openDeleteId, setOpenDeleteId] = React.useState<number | null>(null);

  const [localSort, setLocalSort] = React.useState<string>(sort || "createdAt:desc");
  React.useEffect(() => setLocalSort(sort), [sort]);

  const toggleSort = (field: string) => {
    const [f, dir] = localSort.split(":");
    const next = f === field ? `${field}:${dir === "asc" ? "desc" : "asc"}` : `${field}:asc`;
    setLocalSort(next);
    onSortChange?.(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("slug")}>
                Slug <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("isActive")}>
                Active <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("createdAt")}>
                Created <ArrowUpDown className="inline h-3 w-3 ml-1" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!rows?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            )}

            {rows?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.parentId ? `#${c.parentId}` : <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  {c.image ? (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-xs">{c.image}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">No image</span>
                  )}
                </TableCell>
                <TableCell>
                  {c.isActive ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                </TableCell>
                <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => setOpenEditId(c.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setOpenDeleteId(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} • {pagination.total} records
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={String(pagination.pageSize)}
            onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <EditCategorySheet
        id={openEditId}
        open={!!openEditId}
        onOpenChange={() => setOpenEditId(null)}
        onUpdated={() => {
          onChanged?.();
          setOpenEditId(null);
        }}
      />

      <DeleteCategoryDialog
        id={openDeleteId}
        open={!!openDeleteId}
        onOpenChange={() => setOpenDeleteId(null)}
        onDeleted={() => {
          onChanged?.();
          setOpenDeleteId(null);
        }}
      />
    </div>
  );
}
