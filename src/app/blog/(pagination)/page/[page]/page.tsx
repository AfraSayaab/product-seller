import BlogList from "../../../components/BlogList";
import { notFound } from "next/navigation";

export default async function BlogPaginationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const currentPage = Number(page);

  if (isNaN(currentPage) || currentPage < 2) {
    notFound();
  }

  return <BlogList currentPage={currentPage} />;
}
