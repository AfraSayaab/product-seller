import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MapPin, Calendar } from "lucide-react";
type RelatedItem = {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
    location: string;
    date: string;
  };
  
  const relatedItems: RelatedItem[] = [
    {
      id: "2",
      title: "Minimal Black Tee",
      price: "$45",
      image: "/hero-image1.webp",
      category: "Men",
      location: "London",
      date: "12 Jan 2026",
    },
    {
      id: "3",
      title: "Vintage Oversized Shirt",
      price: "$60",
      image: "/hero-image4.webp",
      category: "Women",
      location: "Manchester",
      date: "10 Jan 2026",
    },
    {
      id: "4",
      title: "Blue Oversized Shirt",
      price: "$60",
      image: "/hero-image3.webp",
      category: "Men",
      location: "Birmingham",
      date: "08 Jan 2026",
    },
  ];
  
function SellerOtherItems() {
  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-gray-100 rounded-2xl shadow-lg">
      <h3 className="mb-6 text-xl font-serif font-bold text-black">
        More from this seller
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {relatedItems.map((item) => (
          <Card
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background shadow-sm transition hover:shadow-lg"
          >
            {/* IMAGE */}
            <div className="relative aspect-4/3 w-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.05]"
              />

              {/* Price */}
              <Badge className="absolute left-3 top-3 bg-pink-500 text-white">
                {item.price}
              </Badge>

              {/* Bookmark */}
              <button className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white transition hover:bg-pink-500">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-3 p-4">
              {/* Category */}
              <span className="inline-block rounded-md border-black  px-2 text-xs text-black">
                {item.category}
              </span>

              {/* Title */}
              <h4 className="line-clamp-1 text-sm font-semibold text-black">
                {item.title}
              </h4>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-pink-500" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-pink-500" />
                  {item.date}
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/listings/${item.id}`}
                className="block w-full rounded-lg bg-pink-500 py-2 text-center text-sm font-medium text-white transition hover:bg-pink-600"
              >
                View Details
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SellerOtherItems;
