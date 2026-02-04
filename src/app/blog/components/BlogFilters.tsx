"use client";

type Props = {
  months: string[];
  categories: string[];
  tags: string[];
  selectedMonth: string | null;
  selectedCategory: string | null;
  selectedTag: string | null;
  onSelectMonth: (v: string | null) => void;
  onSelectCategory: (v: string | null) => void;
  onSelectTag: (v: string | null) => void;
};

export default function BlogFilters({
  months,
  categories,
  tags,
  selectedMonth,
  selectedCategory,
  selectedTag,
  onSelectMonth,
  onSelectCategory,
  onSelectTag,
}: Props) {
  const hasActiveFilters =
    selectedMonth || selectedCategory || selectedTag;

  const clearFilters = () => {
    onSelectMonth(null);
    onSelectCategory(null);
    onSelectTag(null);
  };

  return (
    <aside className="space-y-6">

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="
            w-full rounded-2xl border border-black
            px-4 py-2 text-sm font-semibold
            text-black
            transition-all
            hover:border-pink-500 hover:text-pink-500
          "
        >
          Clear filters
        </button>
      )}

      {/* ARCHIVE */}
      <div className="rounded-2xl border bg-background p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">
          Archive
        </h4>

        <div className="flex flex-wrap gap-2">
          {months.map((month) => {
            const active = selectedMonth === month;

            return (
              <button
                key={month}
                onClick={() => onSelectMonth(active ? null : month)}
                className={`
                  rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-pink-500 text-white shadow-sm"
                      : "border border-gray-300 text-gray-700 hover:border-black hover:text-black"
                  }
                `}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="rounded-2xl border bg-background p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">
          Categories
        </h4>

        <ul className="space-y-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;

            return (
              <li key={cat}>
                <button
                  onClick={() => onSelectCategory(active ? null : cat)}
                  className={`
                    flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm transition
                    ${
                      active
                        ? "bg-pink-50 text-pink-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                    }
                  `}
                >
                  <span>{cat}</span>
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* TAGS */}
      <div className="rounded-2xl border bg-background p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-black">
          Tags
        </h4>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = selectedTag === tag;

            return (
              <button
                key={tag}
                onClick={() => onSelectTag(active ? null : tag)}
                className={`
                  rounded-full px-3 py-1.5 text-xs font-medium transition-all
                  ${
                    active
                      ? "border border-pink-500 bg-pink-500 text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black"
                  }
                `}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
