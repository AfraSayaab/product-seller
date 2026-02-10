"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  image: string | null; // optional, for deleting image file
  created_at: string;
}

export default function ManagePostsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("created_at:desc");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data: Blog[] = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch blogs");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ---------------- Improved Delete ----------------
  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete blog");

      // Remove from state immediately for better UX
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));

      toast.success("Blog deleted successfully 🎉");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete blog");
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
        if (field === "slug") return a.slug.localeCompare(b.slug) * multiplier;
        if (field === "created_at")
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * multiplier;
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
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Manage Posts</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:ring-1 focus:ring-black focus:border-black"
        />
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <Table className="table-auto border-collapse">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead
                onClick={() => toggleSort("title")}
                className="cursor-pointer border-b border-gray-300 px-3 py-2 text-left text-gray-800 font-medium"
              >
                <div className="flex items-center gap-1">
                  Title <ArrowUpDown className="h-3 w-3 text-gray-500" />
                </div>
              </TableHead>

              <TableHead
                onClick={() => toggleSort("slug")}
                className="cursor-pointer border-b border-gray-300 px-3 py-2 text-left text-gray-800 font-medium"
              >
                <div className="flex items-center gap-1">
                  Slug <ArrowUpDown className="h-3 w-3 text-gray-500" />
                </div>
              </TableHead>

              <TableHead
                onClick={() => toggleSort("created_at")}
                className="cursor-pointer border-b border-gray-300 px-3 py-2 text-left text-gray-800 font-medium"
              >
                <div className="flex items-center gap-1">
                  Posted Date <ArrowUpDown className="h-3 w-3 text-gray-500" />
                </div>
              </TableHead>

              <TableHead className="border-b border-gray-300 px-3 py-2 text-left text-gray-800 font-medium">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-600">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No posts found
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <TableCell className="border-b border-gray-200 px-3 py-2 text-gray-800">{blog.title}</TableCell>
                  <TableCell className="border-b border-gray-200 px-3 py-2 text-gray-800">{blog.slug}</TableCell>
                  <TableCell className="border-b border-gray-200 px-3 py-2 text-gray-800">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="border-b border-gray-200 px-3 py-2 flex gap-2">
                    <Button
                      onClick={() => handleDelete(blog)}
                      className="bg-black  text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Link href={`/admin/blog/edit/${blog.id}`}>
                      <Button className="bg-black text-white">
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
