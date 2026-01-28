"use client";

import { useState } from "react";
import BlogCard from "./BlogCard";
import Pagination from "./Pagination";
import BlogFilters from "./BlogFilters";

/* -------------------- TYPES -------------------- */
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string; // ISO string
  month: string;
  category: string;
  tags: string[];
};

/* -------------------- DUMMY BLOG DATA -------------------- */
const BLOGS: BlogPost[] = Array.from({ length: 22 }).map((_, i) => ({
  slug: `blog-post-${i + 1}`,
  title: `Blog Post Title ${i + 1}`,
  excerpt:
    "This is a short description of the blog post to give readers a preview of the content and entice them to click continue reading.",
  image: "/blog-placeholder.webp",
  date: "2026-01-12",
  month: "January 2026",
  category: i % 2 === 0 ? "Fashion" : "Lifestyle",
  tags: i % 2 === 0 ? ["Vintage", "Style"] : ["Tips", "Sustainability"],
}));

const POSTS_PER_PAGE = 6;

/* -------------------- COMPONENT -------------------- */
export default function BlogList({ currentPage }: { currentPage: number }) {
  /* -------------------- FILTER STATES -------------------- */
  const [month, setMonth] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  /* -------------------- FILTER LOGIC -------------------- */
  const filteredBlogs: BlogPost[] = BLOGS.filter((post: BlogPost) => {
    return (
      (!month || post.month === month) &&
      (!category || post.category === category) &&
      (!tag || post.tags.includes(tag))
    );
  });

  /* -------------------- PAGINATION -------------------- */
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = filteredBlogs.slice(start, start + POSTS_PER_PAGE);
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);

  /* -------------------- FILTER OPTIONS -------------------- */
  const months = [...new Set(BLOGS.map((b: BlogPost) => b.month))];
  const categories = [...new Set(BLOGS.map((b: BlogPost) => b.category))];
  const tags = [...new Set(BLOGS.flatMap((b: BlogPost) => b.tags))];

  /* -------------------- RENDER -------------------- */
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 bg-linear-to-b from-pink-50/50 via-white to-white">
      {/* Header */}
      <div className="mb-16 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black">
          Dazzle <span className="text-pink-500"> &</span> Bloom Journal
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl">
          Stories, inspiration, and styling tips from the world of sustainable
          and preloved fashion.
        </p>
      </div>

      {/* Grid: Sidebar + Blogs */}
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
          onSelectCategory={(v) => setCategory(v === category ? null : v)}
          onSelectTag={(v) => setTag(v === tag ? null : v)}
        />

        {/* Blog Cards + Pagination */}
        <div className="space-y-12">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {paginatedBlogs.map((post: BlogPost) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
