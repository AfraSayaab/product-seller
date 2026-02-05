import type { PublicListingsResponse } from "./listing-types";

export type ListingsQuery = {
  q?: string;
  categorySlug?: string[];
  featured?: boolean;
  spotlight?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "featured";
  limit?: number;
  cursor?: string | null;
};

export async function fetchPublicListings(query: ListingsQuery) {
  const sp = new URLSearchParams();

  if (query.q) sp.set("q", query.q);
  if (query.sort) sp.set("sort", query.sort);
  if (typeof query.featured === "boolean") sp.set("featured", String(query.featured));
  if (typeof query.spotlight === "boolean") sp.set("spotlight", String(query.spotlight));
  if (query.limit) sp.set("limit", String(query.limit));
  if (query.cursor) sp.set("cursor", query.cursor);

  (query.categorySlug ?? []).forEach((s) => sp.append("categorySlug", s));

  const res = await fetch(`/api/listings/public-listing?${sp.toString()}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) throw new Error(`Failed to fetch listings (${res.status})`);
  return (await res.json()) as PublicListingsResponse;
}
