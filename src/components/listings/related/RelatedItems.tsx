import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RelatedItem = {
  id: string;
  title: string;
  price: string;
  image: string;
};

const relatedItems: RelatedItem[] = [
  {
    id: "2",
    title: "Minimal Black Tee",
    price: "$45",
    image: "/hero-image1.webp",
  },
  {
    id: "3",
    title: "Vintage Oversized Shirt",
    price: "$60",
    image: "/hero-image4.webp",
  },
  {
    id: "4",
    title: "Blue Oversized Shirt",
    price: "$60",
    image: "/hero-image3.webp",
  },
];

export default function RelatedItems() {
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-semibold">Related Items</h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {relatedItems.map((item) => (
          <Link key={item.id} href={`/listings/${item.id}`} className="group">
            <Card className="overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-md">
              {/* IMAGE AREA */}
              <div className="relative aspect-4/3 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw"
                />

                {/* price badge */}
                <Badge className="absolute left-3 top-3 rounded-md bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                  {item.price}
                </Badge>
              </div>

              {/* TEXT AREA */}
              <div className="p-5">
                <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  View details
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
