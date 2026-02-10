"use client";

import { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import Pagination from "./Pagination";
import BlogFilters from "./BlogFilters";

/* -------------------- TYPES -------------------- */
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  month: string;
  category: string;
  tags: string[];
};

const POSTS_PER_PAGE = 6;

/* -------------------- COMPONENT -------------------- */
export default function BlogList({ currentPage }: { currentPage: number }) {
  /* -------------------- DATA STATE -------------------- */
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  /* -------------------- FILTER STATES -------------------- */
  const [month, setMonth] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  /* -------------------- FETCH BLOGS -------------------- */
 useEffect(() => {
  fetch(`/api/blogs?page=${currentPage}&limit=${POSTS_PER_PAGE}`)
    .then((res) => res.json())
    .then((data) => {
      setBlogs(Array.isArray(data?.data) ? data.data : []);
      setTotalPages(Number(data?.totalPages) || 1);
    })
    .catch(() => {
      setBlogs([]);
      setTotalPages(1);
    });
}, [currentPage]);

  /* -------------------- FILTER LOGIC -------------------- */
  const filteredBlogs = (blogs ?? []).filter((post) => {

    return (
      (!month || post.month === month) &&
      (!category || post.category === category) &&
      (!tag || post.tags.includes(tag))
    );
  });

  /* -------------------- FILTER OPTIONS -------------------- */
  const months = [...new Set(blogs.map((b) => b.month))];
  const categories = [...new Set(blogs.map((b) => b.category))];
  const tags = [...new Set(blogs.flatMap((b) => b.tags))];

  /* -------------------- RENDER -------------------- */
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 bg-linear-to-b from-pink-50/50 via-white to-white">
      {/* Header */}
      <div className="mb-16 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black">
          Dazzle <span className="text-pink-500">&</span> Bloom Journal
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl">
          Stories, inspiration, and styling tips from the world of sustainable
          and preloved fashion.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Filters */}
        <BlogFilters
          months={months}
          categories={categories}
          tags={tags}
          selectedMonth={month}
          selectedCategory={category}
          selectedTag={tag}
          onSelectMonth={(v) => setMonth(v === month ? null : v)}
          onSelectCategory={(v) =>
            setCategory(v === category ? null : v)
          }
          onSelectTag={(v) => setTag(v === tag ? null : v)}
        />

        {/* Blog Cards + Pagination */}
        <div className="space-y-12">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {filteredBlogs.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
