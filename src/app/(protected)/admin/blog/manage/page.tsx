"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
}

interface ListBlogProps {
  onEdit?: (id: number) => void;
  onDeleted?: () => void;
}

export default function ManagePostsPage({ onEdit, onDeleted }: ListBlogProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("createdAt:desc");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await api("/api/admin/blogs");
      setBlogs(data as Blog[]);
    } catch {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api(`/api/admin/blogs/${id}`, { method: "DELETE" });
      toast.success("Blog deleted successfully");
      fetchBlogs();
      onDeleted?.();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs
      .filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.slug.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const [field, dir] = sort.split(":");
        const multiplier = dir === "asc" ? 1 : -1;
        if (field === "title") return a.title.localeCompare(b.title) * multiplier;
        if (field === "createdAt") return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
        return 0;
      });
  }, [blogs, search, sort]);

  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      const [f, dir] = prev.split(":");
      return f === field ? `${field}:${dir === "asc" ? "desc" : "asc"}` : `${field}:asc`;
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Posts</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border px-4 py-2"
        />
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>
                <div className="flex items-center gap-1">
                  Title <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("createdAt")}>
                <div className="flex items-center gap-1">
                  Posted Date <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !filteredBlogs.length ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-sm text-muted-foreground">
                  No posts found
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-gray-50">
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(blog.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/blog/edit/${blog.id}`} passHref>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
