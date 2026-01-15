"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
type SpotlightItem = {
    id: string;
    title: string;
    category: string;
    priceLabel: string;
    image: string;
    featured?: boolean;
};

const items: SpotlightItem[] = [
    {
        id: "1",
        title: "Suffuse Custom Made Outfit",
        category: "Women",
        priceLabel: "£1200",
        image: "/hero-image2.webp",
        featured: true,
    },
    {
        id: "2",
        title: "Pakistani Bridal Dress For Sale",
        category: "Women",
        priceLabel: "£1550",
        image: "/hero-image3.webp",
        featured: true,
    },
    {
        id: "3",
        title: "Luxury Clutches",
        category: "Accessories",
        priceLabel: "£120",
        image: "/hero-image4.webp",
    },
    {
        id: "1",
        title: "Suffuse Custom Made Outfit",
        category: "Women",
        priceLabel: "£1200",
        image: "/hero-image2.webp",
        featured: true,
    },
    {
        id: "2",
        title: "Pakistani Bridal Dress For Sale",
        category: "Women",
        priceLabel: "£1550",
        image: "/hero-image3.webp",
        featured: true,
    },
    {
        id: "3",
        title: "Luxury Clutches",
        category: "Accessories",
        priceLabel: "£120",
        image: "/hero-image4.webp",
    },
    {
        id: "1",
        title: "Suffuse Custom Made Outfit",
        category: "Women",
        priceLabel: "£1200",
        image: "/hero-image2.webp",
        featured: true,
    },
    {
        id: "2",
        title: "Pakistani Bridal Dress For Sale",
        category: "Women",
        priceLabel: "£1550",
        image: "/hero-image3.webp",
        featured: true,
    },
    {
        id: "3",
        title: "Luxury Clutches",
        category: "Accessories",
        priceLabel: "£120",
        image: "/hero-image4.webp",
    },

];

export default function SpotlightWardrobeCarousel() {
    const [liked, setLiked] = React.useState<Record<string, boolean>>({});

    const autoplay = React.useRef(
        Autoplay({ delay: 3500, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    return (
        <section className="w-full py-10">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-6 text-center">
                    <p className="text-sm font-medium text-rose-500">
                        Explore Our Highlights
                    </p>
                    <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
                        Spotlight Wardrobe
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Explore some of the best.
                    </p>
                </div>

                <div className="relative">
                    <Carousel
                        opts={{ align: "start", loop: true }}
                        plugins={[autoplay.current]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">

                            {items.map((item) => {
                                const isLiked = !!liked[item.id];

                                return (
                                    <CarouselItem
                                        key={item.id}
                                        className="pl-4 basis-[88%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                                    >
                                        <Link key={item.id} href={`/listings/${item.id}`} >
                                        <Card className="group overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-md">
                                            {/* IMAGE AREA */}
                                            <div className="relative aspect-4/3 w-full overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                                    sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                />

                                                {/* top-left: price */}
                                                <Badge className="absolute left-3 top-3 rounded-md bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                                                    {item.priceLabel}
                                                </Badge>

                                                {/* top-right: featured */}
                                                {item.featured && (
                                                    <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-black/5">
                                                        FEATURED
                                                    </span>
                                                )}

                                                {/* bottom-right: favourite */}
                                                <div className="absolute bottom-3 right-3">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            setLiked((prev) => ({
                                                                ...prev,
                                                                [item.id]: !prev[item.id],
                                                            }))
                                                        }
                                                        className="h-10 w-10 rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 hover:bg-white"
                                                        aria-label="Add to favourite"
                                                    >
                                                        <Heart
                                                            className={`h-5 w-5 ${isLiked
                                                                    ? "fill-rose-500 text-rose-500"
                                                                    : "text-rose-500"
                                                                }`}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* WHITE AREA (TEXT BELOW IMAGE) */}
                                            <div className="p-5">
                                                <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                                                    {item.title}
                                                </h3>

                                                <p className="mt-2 text-sm text-muted-foreground">{item.category}</p>
                                            </div>
                                        </Card>
                                        </Link>
                                    </CarouselItem>
                                );
                            })}

                        </CarouselContent>

                        {/* arrows top-right */}
                        <div className="pointer-events-none absolute -top-14 right-0 flex items-center gap-2">
                            <div className="pointer-events-auto">
                                <CarouselPrevious className="static h-10 w-10 rounded-lg border bg-background shadow-sm hover:bg-muted" />
                            </div>
                            <div className="pointer-events-auto">
                                <CarouselNext className="static h-10 w-10 rounded-lg border bg-background shadow-sm hover:bg-muted" />
                            </div>
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
