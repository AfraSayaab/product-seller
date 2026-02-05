import { NextResponse } from "next/server";
import { BLOGS } from "../data";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params; 
  console.log("Slug param:", slug);

  const post = BLOGS.find((b) => b.slug === slug);

  if (!post) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...post,
    content: `<p>This is full content for ${post.title}</p>`,
  });
}
