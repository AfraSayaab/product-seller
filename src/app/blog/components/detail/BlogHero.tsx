// src/app/blog/components/detail/BlogHero.tsx
import Image from "next/image";
import { MessageCircle, ArrowRightIcon } from "lucide-react";
import { BlogPost } from "../BlogList";

type Props = {
  post: BlogPost;
};

export default function BlogHero({ post }: Props) {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-40 py-12 gap-8 w-full">

        {/* Left: Blog Text */}
        <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6 text-white">
          <p className="text-pink-500 font-bold text-sm uppercase tracking-widest">
            Blog
          </p>

          <h1 className="max-w-2xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic uppercase tracking-wider mx-auto lg:mx-0">
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 text-white/90">
            {post.excerpt}
          </p>
        </div>

        {/* Right: Chat Card (same as main hero) */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <div className="bg-[rgba(42,30,26,0.9)] rounded-2xl p-6 w-full max-w-sm flex flex-col justify-between">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-500 w-10 h-10 rounded-full flex items-center justify-center">
                <MessageCircle className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold">BloomBot</p>
                <p className="text-pink-500 text-xs uppercase tracking-widest">
                  AI CONCIERGE
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="hidden lg:block p-4 mb-4 relative text-white lg:my-10">
              <p className="text-sm">
                &quot;Looking for something similar to this blog style? I can help!&quot;
              </p>

              <div className="flex flex-wrap gap-3 mt-4">
                <button className="border border-white text-white px-3 py-1 rounded-full text-xs hover:bg-white hover:text-black transition">
                  Similar outfits?
                </button>
                <button className="border border-white text-white px-3 py-1 rounded-full text-xs hover:bg-white hover:text-black transition">
                  Budget options?
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#4b3c37] rounded-full p-1 flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask BloomBot..."
                className="flex-1 px-4 py-2 rounded-full text-black placeholder-gray-400 focus:outline-none"
              />
              <button className="bg-pink-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black transition">
                <ArrowRightIcon className="text-white w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
