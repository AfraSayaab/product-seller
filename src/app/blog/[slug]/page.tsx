import BlogHero from "../components/detail/BlogHero"; 
import BlogContent from "../components/detail/BlogContent";
import BlogShare from "../components/detail/BlogShare";
import BlogTags from "../components/detail/BlogTags";
import Image from "next/image";
import RelatedPosts from "../components/detail/RelatedPosts";
import Footer from "@/components/Footer";
import { HeaderLayout } from "@/components/Header/header";
import { notFound } from "next/navigation";
import { BlogPost } from "../components/BlogList";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params; // ✅ REQUIRED

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const post: BlogPost & { content: string } = await res.json();

  return (
    <>
      <HeaderLayout />
      <main className="bg-background">
        <BlogHero post={post} />

        <div className="flex max-w-7xl mx-auto px-4 lg:px-8 gap-8 py-10">
          {/* Main Content */}
          <div className="flex-1">
            <BlogContent content={post.content} />

            <div className="relative w-full h-[500px] mt-6 rounded-lg overflow-hidden bg-gray-100">
  <Image
    src={post.image}
    alt={post.title}
    fill
    className="object-contain"
    sizes="(max-width: 768px) 100vw, 700px"
  />
</div>

          </div>

          {/* Sidebar */}
          <aside className="w-64 shrink-0 space-y-6 sticky top-20 self-start">
            <div>
              <h4 className="font-semibold">Date:</h4> <p>{post.date}</p>
            </div>
            <div>
              <h4 className="font-semibold">Category:</h4>
              <p>{post.category}</p>
            </div>
            <BlogTags tags={post.tags} />
            <BlogShare title={post.title} />
          </aside>
        </div>

        <RelatedPosts
  category={post.category}
  currentSlug={post.slug}
/>

      </main>
      <Footer />
    </>
  );
}
