"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar, User, Tag, Image as ImageIcon, CheckCircle2, XCircle, Layers, FileText } from "lucide-react";

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  image: string | null;
  createdById: number;
  createdAt: string;
  attributeSchema: Record<string, any>;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  children: Array<{
    id: number;
    name: string;
    slug: string;
    parentId: number;
    children: any[];
  }>;
  createdBy: {
    id: number;
    username: string;
    email: string;
  };
  _count: {
    children: number;
    listings: number;
  };
}

export default function CategoryViewSheet({
  open,
  onClose,
  categoryId,
}: {
  open: boolean;
  onClose: () => void;
  categoryId: number | null;
}) {
  const [loading, setLoading] = React.useState(false);
  const [categoryData, setCategoryData] = React.useState<CategoryData | null>(null);

  // Fetch category data when sheet opens
  React.useEffect(() => {
    if (open && categoryId) {
      setLoading(true);
      api<CategoryData>(`/api/admin/categories/${categoryId}`)
        .then((data) => {
          setCategoryData(data);
        })
        .catch((error: any) => {
          toast.error(error.message || "Failed to load category details");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCategoryData(null);
    }
  }, [open, categoryId, onClose]);

  if (!categoryId) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Category Details</SheetTitle>
          <SheetDescription>
            View complete information about this category
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">Loading category details...</p>
            </div>
          ) : categoryData ? (
            <>
              {/* Header Section */}
              <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-2">{categoryData.name}</h3>
                    <p className="text-sm text-gray-600 font-mono">/{categoryData.slug}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    categoryData.isActive
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-700 border border-gray-300"
                  }`}>
                    {categoryData.isActive ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Preview */}
                {categoryData.image && (
                  <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <img
                      src={categoryData.image}
                      alt={categoryData.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-bold text-black">Subcategories</span>
                  </div>
                  <p className="text-2xl font-bold text-black">{categoryData._count.children}</p>
                </div>
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-bold text-black">Listings</span>
                  </div>
                  <p className="text-2xl font-bold text-black">{categoryData._count.listings}</p>
                </div>
              </div>

              {/* Parent Category */}
              {categoryData.parent && (
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-bold text-black">Parent Category</span>
                  </div>
                  <div className="pl-7">
                    <p className="text-sm font-medium text-black">{categoryData.parent.name}</p>
                    <p className="text-xs text-gray-600 font-mono">/{categoryData.parent.slug}</p>
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {categoryData.children && categoryData.children.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-bold text-black">Subcategories</span>
                    <span className="text-xs text-gray-500">({categoryData.children.length})</span>
                  </div>
                  <div className="space-y-2 pl-7">
                    {categoryData.children.map((child) => (
                      <div
                        key={child.id}
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-sm font-medium text-black">{child.name}</p>
                        <p className="text-xs text-gray-600 font-mono">/{child.slug}</p>
                        {child.children && child.children.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {child.children.length} nested subcategor{child.children.length === 1 ? "y" : "ies"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created By */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-bold text-black">Created By</span>
                </div>
                <div className="pl-7 space-y-1">
                  <p className="text-sm font-medium text-black">{categoryData.createdBy.username}</p>
                  <p className="text-xs text-gray-600">{categoryData.createdBy.email}</p>
                </div>
              </div>

              {/* Created Date */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-bold text-black">Created At</span>
                </div>
                <p className="text-sm text-gray-700 pl-7">{formatDate(categoryData.createdAt)}</p>
              </div>

              {/* Additional Info */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-600 uppercase">Category ID</span>
                    <p className="text-sm text-black font-mono mt-1">#{categoryData.id}</p>
                  </div>
                  {Object.keys(categoryData.attributeSchema || {}).length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-600 uppercase">Attributes</span>
                      <pre className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded border border-gray-200 overflow-auto">
                        {JSON.stringify(categoryData.attributeSchema, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

