"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";

type ImageGalleryProps = {
  images?: Array<{ url: string }>;
  title?: string;
  placeholderSrc?: string;
};

export default function ImageGallery({
  images = [],
  title = "Listing image",
  placeholderSrc = "/hero-image2.webp",
}: ImageGalleryProps) {
  const urls = useMemo(() => {
    const cleaned = (images || [])
      .map((x) => x?.url)
      .filter(Boolean);
    return cleaned.length ? cleaned : [placeholderSrc];
  }, [images, placeholderSrc]);

  const [ordered, setOrdered] = useState<string[]>(urls);

  // if listing changes, reset gallery order
  useEffect(() => {
    setOrdered(urls);
  }, [urls]);

  const handleThumbnailClick = (index: number) => {
    if (index === 0) return;

    setOrdered((prev) => {
      const next = [...prev];
      [next[0], next[index]] = [next[index], next[0]];
      return next;
    });
  };

  return (
    <div className="flex gap-4">
      {/* THUMBNAILS */}
      <div className="flex flex-col gap-3">
        {ordered.map((img, index) => (
          <button
            key={`${img}-${index}`}
            onClick={() => handleThumbnailClick(index)}
            className={`relative h-24 w-20 overflow-hidden rounded-lg border transition
              ${index === 0 ? "ring-2 ring-[#f6339a]" : "hover:ring-2 hover:ring-muted"}
            `}
            aria-label={`Open image ${index + 1}`}
            type="button"
          >
            <Image
              src={img}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* MAIN IMAGE */}
      <div className="relative flex-1 h-105 overflow-hidden rounded-2xl border bg-muted">
        <Image
          src={ordered[0]}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 700px, 100vw"
        />
      </div>
    </div>
  );
}
