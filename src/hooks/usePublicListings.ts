"use client";

import * as React from "react";
import { fetchPublicListings, type ListingsQuery } from "@/lib/listing-client";
import type { PublicListingsResponse, PublicListingDTO } from "@/lib/listing-types";

type State = {
  data: PublicListingDTO[];
  nextCursor: string | null;
  loading: boolean;
  error: string | null;
};

export function usePublicListings(query: ListingsQuery) {
  const [state, setState] = React.useState<State>({
    data: [],
    nextCursor: null,
    loading: true,
    error: null,
  });

  const queryKey = React.useMemo(() => JSON.stringify(query), [query]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const res: PublicListingsResponse = await fetchPublicListings({ ...query, cursor: null });
        if (cancelled) return;

        setState({
          data: res.data,
          nextCursor: res.meta.nextCursor,
          loading: false,
          error: null,
        });
      } catch (e: any) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: e?.message ?? "Failed to load listings",
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  return state;
}
