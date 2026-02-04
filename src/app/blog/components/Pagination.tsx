import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const href = page === 1 ? "/blog" : `/blog/page/${page}`;

        return (
          <Link
            key={page}
            href={href}
            className={`h-10 w-10 flex items-center justify-center rounded-full border transition
              ${
                page === currentPage
                  ? "bg-pink-500 text-white border-pink-500"
                  : "border-gray-300 text-black hover:border-pink-500"
              }`}
          >
            {page}
          </Link>
        );
      })}
    </div>
  );
}
