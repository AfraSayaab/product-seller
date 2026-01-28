

import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "./BlogList";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";

export default function BlogCardSpotlight({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <article className="group relative overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-md">

        {/* IMAGE AREA */}
        <div className="relative aspect-4/3 w-full overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Category */}
          <Badge className="absolute left-3 top-3 rounded-md bg-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {post.category}
          </Badge>

          {/* Month */}
          <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-black/5">
            {post.month}
          </span>

          
        </div>

        {/* TAGS – Half Image / Half Content */}
        {post.tags?.length > 0 && (
          <div className="absolute left-4 top-[calc(53%-10px)] z-20 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-pink-500 bg-white px-3 py-1 text-[11px] font-medium text-pink-600 shadow-sm"
              >
                #{tag}
              </span>
            ))}
            
          </div>
        )}
<div className="absolute right-18 top-[calc(62%)] z-20 flex flex-wrap gap-2">
  {/* Share Button */}
{/* Share Button */}
<button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    // share logic
  }}
  aria-label="Share post"
  className="
    absolute bottom-3 left-3 z-20
    flex h-10 w-10 items-center justify-center
    rounded-full
    border border-pink-500
    bg-white
    text-pink-500
    shadow-sm
    ring-1 ring-black/5
    transition-all
    hover:scale-105
    hover:bg-pink-500
    hover:text-white
  "
>
  <Share2 className="h-4 w-4 transition-colors" />
</button>

</div>
        {/* CONTENT */}
        <div className="p-5 pt-8">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-pink-600 transition">
            {post.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>

          {/* Redesigned Continue Reading */}
          <span className="mt-4 inline-flex items-center justify-center rounded-2xl border border-pink-500 px-5 py-2 text-sm font-semibold text-pink-500 transition-all group-hover:bg-pink-500 group-hover:text-white">
            Read More
          </span>
        </div>
      </article>
    </Link>
  );
}
