"use client";

import { useState } from "react";
import Image from "next/image";

const initialImages = [
  "/hero-image2.webp",
  "/hero-image3.webp",
  "/hero-image4.webp",
];

export default function ImageGallery() {
  const [images, setImages] = useState(initialImages);

  const handleThumbnailClick = (index: number) => {
    if (index === 0) return;

    setImages((prev) => {
      const newImages = [...prev];
      [newImages[0], newImages[index]] = [
        newImages[index],
        newImages[0],
      ];
      return newImages;
    });
  };

  return (
    <div className="flex gap-4">
      {/* THUMBNAILS */}
      <div className="flex flex-col gap-3">
        {images.map((img, index) => (
          <button
            key={img}
            onClick={() => handleThumbnailClick(index)}
            className={`relative h-24 w-20 overflow-hidden rounded-lg border transition 
              ${index === 0 ? "ring-2 ring-[#f6339a]" : "hover:ring-2 hover:ring-muted"}
            `}
          >
            <Image
              src={img}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* MAIN IMAGE */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border bg-muted">
        <Image
          src={images[0]}
          alt="Listing image"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
