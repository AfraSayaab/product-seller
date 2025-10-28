"use client";

import * as React from "react";
import { api } from "@/lib/api";

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  image: string | null;
  createdAt: string;
  createdById: number;
  attributeSchema: Record<string, unknown>;
  createdBy?: { id: number; username: string; email: string };
};

type ApiListResponse = {
  success: boolean;
  data?: {
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
    items: CategoryItem[];
  };
  error?: string;
};

export type ParentCategorySelectProps = {
  /** currently selected parent id (or null) */
  value: number | null;
  /** callback returns number id or null */
  onChange: (id: number | null) => void;

  /** API path for categories */
  apiPath?: string; // default: "/api/admin/categories"
  /** page size for list fetching */
  pageSize?: number; // default: 20
  /** min chars to trigger search */
  minChars?: number; // default: 0 (show all)
  /** debounce time for search input */
  debounceMs?: number; // default: 300
  /** placeholder text */
  placeholder?: string; // default: "Search categories…"
  /** label for the field (optional) */
  label?: string; // default: "Parent Category"
  /** show 'None' (clear) button */
  allowClear?: boolean; // default: true
  /** disable interaction */
  disabled?: boolean; // default: false
  /** extra class on wrapper */
  className?: string;

  /** Exclude a category id from results (e.g., current editing id) */
  excludeId?: number;

  /** Optional transform of API items before displaying */
  mapItemLabel?: (item: CategoryItem) => string; // default: `${name} (${slug})`
};

function classNames(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function ParentCategorySelect({
  value,
  onChange,
  apiPath = "/api/admin/categories",
  pageSize = 20,
  minChars = 0,
  debounceMs = 300,
  placeholder = "Search categories…",
  label = "Parent Category",
  allowClear = true,
  disabled = false,
  className,
  excludeId,
  mapItemLabel,
}: ParentCategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<CategoryItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [activeIdx, setActiveIdx] = React.useState<number>(-1);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selectedItem = React.useMemo(
    () => items.find((it) => it.id === value) || null,
    [items, value]
  );

  // Debounce search
  const debouncedQ = useDebounce(q, debounceMs);

  // Fetch list
  const fetchItems = React.useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(apiPath, window.location.origin);
        if (debouncedQ && debouncedQ.length >= minChars) url.searchParams.set("q", debouncedQ);
        url.searchParams.set("page", String(pageNum));
        url.searchParams.set("pageSize", String(pageSize));
        // you can add &withCounts=true or others as your API supports

        const res: ApiListResponse = await api<ApiListResponse>(url.pathname + "?" + url.searchParams.toString(), {
          method: "GET",
        });

        if (!res?.success || !res?.data) throw new Error(res?.error || "Failed to load categories");

        const list = excludeId
          ? res.data.items.filter((x) => x.id !== excludeId)
          : res.data.items;

        setItems(list);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
        // reset active index when new data arrives
        setActiveIdx(list.length ? 0 : -1);
      } catch (e: any) {
        setError(e?.message || "Failed to load categories");
        setItems([]);
        setActiveIdx(-1);
      } finally {
        setLoading(false);
      }
    },
    [apiPath, pageSize, debouncedQ, minChars, excludeId]
  );

  // Load on open + whenever debounced query/page changes
  React.useEffect(() => {
    if (!open) return;
    fetchItems(1);
  }, [open, fetchItems]);

  React.useEffect(() => {
    if (!open) return;
    fetchItems(1);
  }, [debouncedQ]); // eslint-disable-line

  // Click outside to close
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      scrollActiveIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        handleSelect(items[activeIdx]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const scrollActiveIntoView = () => {
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;
      const el = list.querySelector<HTMLLIElement>(`li[data-idx="${activeIdx}"]`);
      if (!el) return;
      const listRect = list.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.top < listRect.top) el.scrollIntoView({ block: "nearest" });
      else if (elRect.bottom > listRect.bottom) el.scrollIntoView({ block: "nearest" });
    });
  };

  const handleSelect = (item: CategoryItem) => {
    onChange(item.id);
    setQ(item.name);
    setOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setQ("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const displayLabel = (item: CategoryItem) =>
    mapItemLabel ? mapItemLabel(item) : `${item.name} (${item.slug})`;

  return (
    <div className={classNames("w-full", className)} ref={wrapperRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-900">{label}</label>
      )}
      <div className="relative">
        <div
          className={classNames(
            "flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm",
            disabled ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-white border-gray-300",
            "focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900"
          )}
        >
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none disabled:opacity-60"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => !disabled && setOpen(true)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="parent-category-listbox"
            role="combobox"
          />
          {allowClear && (value !== null || q) && !disabled && (
            <button
              type="button"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              onClick={clearSelection}
              aria-label="Clear selection"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            className={classNames(
              "rounded-md p-1",
              disabled ? "text-gray-300" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
            onClick={() => !disabled && setOpen((o) => !o)}
            aria-label="Toggle"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.189l3.71-3.96a.75.75 0 111.08 1.04l-4.24 4.53a.75.75 0 01-1.08 0l-4.24-4.53a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Results */}
            <ul
              id="parent-category-listbox"
              role="listbox"
              ref={listRef}
              className="max-h-72 overflow-auto py-1"
            >
              {loading && (
                <li className="px-3 py-2 text-sm text-gray-500">Loading…</li>
              )}

              {!loading && error && (
                <li className="px-3 py-2 text-sm text-red-600">{error}</li>
              )}

              {!loading && !error && items.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No categories found.</li>
              )}

              {!loading &&
                !error &&
                items.map((item, idx) => {
                  const active = idx === activeIdx;
                  const selected = value === item.id;
                  return (
                    <li
                      key={item.id}
                      data-idx={idx}
                      role="option"
                      aria-selected={selected}
                      className={classNames(
                        "flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
                        active ? "bg-gray-100" : "bg-white",
                        selected ? "font-medium" : "font-normal",
                        "hover:bg-gray-50"
                      )}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => handleSelect(item)}
                    >
                      <span className="truncate">{displayLabel(item)}</span>
                      {selected && (
                        <svg className="ml-2 h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 11.586l6.543-6.543a1 1 0 011.664.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </li>
                  );
                })}
            </ul>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t bg-gray-50 px-2 py-1.5">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:text-gray-300"
                  disabled={loading || page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    fetchItems(Math.max(1, page - 1));
                  }}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:text-gray-300"
                  disabled={loading || page >= totalPages}
                  onClick={() => {
                    const next = Math.min(totalPages, page + 1);
                    setPage(next);
                    fetchItems(next);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        Choose a parent category or clear to set as top-level.
      </p>
    </div>
  );
}

/** Debounce hook */
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
