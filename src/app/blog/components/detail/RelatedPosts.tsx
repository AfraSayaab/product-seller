"use client";

import BlogCard from "../BlogCard";
import { useEffect, useState } from "react";
import { BlogPost } from "../BlogList";

export default function RelatedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blogs?limit=3")
      .then((res) => res.json())
      .then((data) => setPosts(data.data));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <h3 className="mb-8 text-2xl font-bold text-black">Related Posts</h3>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
