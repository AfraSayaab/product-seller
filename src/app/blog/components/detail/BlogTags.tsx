interface BlogTagsProps {
  tags: string[];
}

export default function BlogTags({ tags }: BlogTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black">
        Tags
      </h4>

      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="
              cursor-pointer
              rounded-full
              border 
              px-3 py-1
              text-xs font-medium
              transition-all
              duration-300
             bg-pink-500
             text-white
             border-pink-500
            "
          >
            #{tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
