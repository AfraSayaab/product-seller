type ListingTagsProps = {
    tags: string[];
  };
  
  export default function ListingTags({ tags }: ListingTagsProps) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  }
  