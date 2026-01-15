import Link from "next/link";
import Image from "next/image";

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
          <Link
            key={item.id}
            href={`/listings/${item.id}`}
            className="group block"
          >
            <div className="overflow-hidden rounded-xl border">
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={400}
                className="h-60 w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-medium group-hover:underline">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
