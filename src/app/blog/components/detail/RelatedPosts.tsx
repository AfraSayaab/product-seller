"use client";

import BlogCard from "../BlogCard";

export default function RelatedPosts() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <h3 className="mb-8 text-2xl font-bold text-black">
        Related Posts
      </h3>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <BlogCard
            key={i}
            post={{
              slug: "sample",
              title: "Related Blog Post",
              excerpt: "Short description here...",
              image: "/blog-placeholder.webp",
              date: "",
              month: "",
              category: "Fashion",
              tags: [],
            }}
          />
        ))}
      </div>
    </section>
  );
}
