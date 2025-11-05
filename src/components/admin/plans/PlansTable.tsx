"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EditPlanModal from "./EditPlanModal";
import DeletePlanModal from "./DeletePlanModal";

type Plan = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  durationDays: number;
  maxActiveListings: number;
  quotaListings: number;
  quotaPhotosPerListing: number;
  quotaVideosPerListing: number;
  quotaBumps: number;
  quotaFeaturedDays: number;
  maxCategories: number;
  isSticky: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { subscriptions: number };
};

// Memoized row component for lazy loading
const PlanRow = React.memo(({ 
  plan, 
  onEdit, 
  onDelete,
}: { 
  plan: Plan; 
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const formatDate = React.useMemo(() => {
    if (!plan.createdAt) return "—";
    return new Date(plan.createdAt).toLocaleString();
  }, [plan.createdAt]);

  const formatPrice = React.useMemo(() => {
    const price = typeof plan.price === 'number' ? plan.price : Number(plan.price);
    return `${plan.currency} ${price.toFixed(2)}`;
  }, [plan.currency, plan.price]);

  return (
    <TableRow key={plan.id} className="hover:bg-muted/50">
      <TableCell className="font-medium">{plan.name}</TableCell>
      <TableCell className="text-muted-foreground hidden sm:table-cell">{formatPrice}</TableCell>
      <TableCell className="hidden md:table-cell">{plan.durationDays} days</TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex flex-col gap-1 text-xs">
          <span>{plan.quotaPhotosPerListing} photos</span>
          <span>{plan.quotaVideosPerListing} videos</span>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex flex-col gap-1 text-xs">
          <span>{plan.maxCategories} categories</span>
          <span>{plan.quotaListings} listings</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col gap-1">
          {plan.isSticky && <Badge variant="default" className="w-fit text-xs">Sticky</Badge>}
          {plan.isFeatured && <Badge variant="default" className="w-fit text-xs">Featured</Badge>}
          {!plan.isSticky && !plan.isFeatured && <span className="text-muted-foreground text-xs">—</span>}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={plan.isActive ? "default" : "secondary"}>
          {plan.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">{formatDate}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(plan.id)}
            className="h-8 w-8 hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Edit ${plan.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(plan.id)}
            className="h-8 w-8 hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Delete ${plan.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
});

PlanRow.displayName = "PlanRow";

// Mobile card view component
const PlanCard = React.memo(({ 
  plan, 
  onEdit, 
  onDelete,
}: { 
  plan: Plan; 
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const formatDate = React.useMemo(() => {
    if (!plan.createdAt) return "—";
    return new Date(plan.createdAt).toLocaleString();
  }, [plan.createdAt]);

  const formatPrice = React.useMemo(() => {
    const price = typeof plan.price === 'number' ? plan.price : Number(plan.price);
    return `${plan.currency} ${price.toFixed(2)}`;
  }, [plan.currency, plan.price]);

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{plan.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{plan.slug}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {plan.isActive ? (
            <span className="px-2 py-1 text-xs font-bold bg-black text-white">Active</span>
          ) : (
            <span className="px-2 py-1 text-xs font-bold border-2 border-black">Inactive</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Price:</span> {formatPrice}
        </div>
        <div>
          <span className="font-medium">Duration:</span> {plan.durationDays} days
        </div>
        <div>
          <span className="font-medium">Photos:</span> {plan.quotaPhotosPerListing}
        </div>
        <div>
          <span className="font-medium">Videos:</span> {plan.quotaVideosPerListing}
        </div>
        <div>
          <span className="font-medium">Categories:</span> {plan.maxCategories}
        </div>
        <div>
          <span className="font-medium">Listings:</span> {plan.quotaListings}
        </div>
        {(plan.isSticky || plan.isFeatured) && (
          <div className="col-span-2 flex gap-2">
            {plan.isSticky && <Badge variant="default" className="text-xs">Sticky</Badge>}
            {plan.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
          </div>
        )}
        <div className="col-span-2">
          <span className="font-medium">Created:</span> {formatDate}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-black">
        <button 
          onClick={() => onEdit(plan.id)}
          className="px-3 py-1 text-sm border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button 
          onClick={() => onDelete(plan.id)}
          className="px-3 py-1 text-sm border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
});

PlanCard.displayName = "PlanCard";

export default function PlansTable({
  rows,
  pagination,
  sort,
  loading,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onChanged,
}: {
  rows: Plan[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: string) => void;
  onChanged?: () => void;
}) {
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [openEditId, setOpenEditId] = React.useState<number | null>(null);
  const [openDeleteId, setOpenDeleteId] = React.useState<number | null>(null);
  const [deletePlanName, setDeletePlanName] = React.useState("");

  const handleEdit = React.useCallback((id: number) => {
    setOpenEditId(id);
  }, []);

  const handleDelete = React.useCallback((id: number) => {
    const plan = rows.find((p) => p.id === id);
    if (plan) {
      setDeletePlanName(plan.name);
      setOpenDeleteId(id);
    }
  }, [rows]);

  const handleSort = React.useCallback((field: string) => {
    const currentField = sort.split(":")[0];
    const currentDir = sort.split(":")[1] || "asc";
    const newDir = currentField === field && currentDir === "asc" ? "desc" : "asc";
    onSortChange(`${field}:${newDir}`);
  }, [sort, onSortChange]);

  const visibleRows = React.useMemo(() => rows, [rows]);

  return (
    <div className="flex flex-col gap-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            className="text-xs"
          >
            Table
          </Button>
          <Button
            variant={view === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("cards")}
            className="text-xs"
          >
            Cards
          </Button>
        </div>
      </div>

      {/* Table View */}
      {view === "table" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Name
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden lg:table-cell">Media</TableHead>
                  <TableHead className="hidden lg:table-cell">Limits</TableHead>
                  <TableHead className="hidden md:table-cell">Features</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("isActive")}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading plans...
                    </TableCell>
                  </TableRow>
                ) : visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No plans found
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((plan) => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Card View */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Loading plans...
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No plans found
            </div>
          ) : (
            visibleRows.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-300">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total} plans
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="flex items-center justify-end gap-2">
        <label className="text-sm text-muted-foreground">Page size:</label>
        <select
          value={pagination.pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Modals */}
      <EditPlanModal
        open={!!openEditId}
        onClose={() => setOpenEditId(null)}
        planId={openEditId}
        onUpdated={() => {
          onChanged?.();
          setOpenEditId(null);
        }}
      />

      <DeletePlanModal
        open={!!openDeleteId}
        onClose={() => setOpenDeleteId(null)}
        planId={openDeleteId}
        planName={deletePlanName}
        onDeleted={() => {
          onChanged?.();
          setOpenDeleteId(null);
        }}
      />
    </div>
  );
}

