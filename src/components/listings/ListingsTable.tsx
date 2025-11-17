// ===============================
// components/listings/ListingsTable.tsx
// Listings table component
// ===============================
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Listing = {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  condition: string;
  status: string;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string; slug: string };
  location?: {
    id: number;
    country: string;
    state: string | null;
    city: string;
    area: string | null;
  };
  images?: Array<{ url: string; isPrimary: boolean }>;
  user?: { id: number; username: string; email: string };
};

type ListingsTableProps = {
  rows: Listing[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: string) => void;
  onChanged: () => void;
  isAdmin?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500",
  PENDING: "bg-yellow-500",
  ACTIVE: "bg-green-500",
  PAUSED: "bg-blue-500",
  SOLD: "bg-purple-500",
  EXPIRED: "bg-red-500",
  REJECTED: "bg-red-600",
  ARCHIVED: "bg-gray-600",
};

const CONDITION_COLORS: Record<string, string> = {
  NEW: "bg-green-500",
  LIKE_NEW: "bg-blue-500",
  USED: "bg-orange-500",
  FOR_PARTS: "bg-red-500",
};

export default function ListingsTable({
  rows,
  pagination,
  sort,
  loading,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onChanged,
  isAdmin = false,
}: ListingsTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setDeletingId(id);
    try {
      await api(`/api/listings/${id}`, { method: "DELETE" });
      toast.success("Listing deleted successfully");
      onChanged();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (field: string) => {
    const [currentField, currentDir] = sort.split(":");
    const newDir = currentField === field && currentDir === "asc" ? "desc" : "asc";
    onSortChange(`${field}:${newDir}`);
  };

  const getSortIcon = (field: string) => {
    const [currentField, currentDir] = sort.split(":");
    if (currentField !== field) return null;
    return currentDir === "asc" ? "↑" : "↓";
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  Title {getSortIcon("title")}
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  Price {getSortIcon("price")}
                </button>
              </TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  Created {getSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-8">
                  Loading listings...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-8 text-muted-foreground">
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md border bg-muted overflow-hidden">
                      {row.images && row.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.images.find((img) => img.isPrimary)?.url || row.images[0].url}
                          alt={row.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate" title={row.title}>
                        {row.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.viewsCount} views • {row.favoritesCount} favorites
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.category ? (
                      <span className="text-sm">{row.category.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.location ? (
                      <div className="text-sm">
                        <div>{row.location.city}</div>
                        {row.location.area && (
                          <div className="text-xs text-muted-foreground">{row.location.area}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{'£' + row.price}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={CONDITION_COLORS[row.condition] || "bg-gray-500"}
                    >
                      {row.condition.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[row.status] || "bg-gray-500"}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {row.user ? (
                        <div className="text-sm">
                          <div>{row.user.username}</div>
                          <div className="text-xs text-muted-foreground">{row.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/listings/${row.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(isAdmin ? `/admin/listings/${row.id}/edit` : `/user/listings/${row.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === row.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

