import Image from "next/image";

const images = [
  "/hero-image2.webp",
  "/hero-image3.webp",
  "/hero-image4.webp",
];

export default function ImageGallery() {
  return (
    <div className="flex gap-4">
      {/* THUMBNAILS */}
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative h-24 w-20 overflow-hidden rounded-lg border"
          >
            <Image src={img} alt="" fill className="object-cover" />
          </div>
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
