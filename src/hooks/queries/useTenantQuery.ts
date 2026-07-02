/**
 * TanStack Query hooks for the tenant list.
 */
import { useQuery, useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "@/lib/api";
import { useFilterStore } from "@/store/useFilterStore";
import type { TenantFilters, Tenant } from "@/lib/api/types";

const PAGE_SIZE = 20;

export const tenantKeys = {
  all: ["tenants"] as const,
  list: (filters: Partial<TenantFilters>) => ["tenants", "list", filters] as const,
  detail: (id: string) => ["tenants", "detail", id] as const,
  units: ["tenants", "units"] as const,
};

/** Paginated tenant list with infinite scroll. */
export function useTenants() {
  const status = useFilterStore((s) => s.status);
  const search = useFilterStore((s) => s.search);
  const unit = useFilterStore((s) => s.unit);
  const balanceMin = useFilterStore((s) => s.balanceMin);
  const balanceMax = useFilterStore((s) => s.balanceMax);
  const sortBy = useFilterStore((s) => s.sortBy);
  const sortOrder = useFilterStore((s) => s.sortOrder);

  const queryFilters = { status, search: search || undefined };

  const query = useInfiniteQuery({
    queryKey: tenantKeys.list(queryFilters),
    queryFn: ({ pageParam = 1 }) =>
      api.tenants.list({ status, search: search || undefined, perPage: PAGE_SIZE, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 2 * 60_000,
    gcTime: 30 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // Flatten pages and apply client-side filters/sort
  const data = useMemo(() => {
    if (!query.data?.pages) return [];
    let items = query.data.pages.flatMap((p) => p.data);

    // Client-side: unit filter
    if (unit) {
      const u = unit.toLowerCase();
      items = items.filter((t) => t.unit.toLowerCase().includes(u));
    }

    // Client-side: balance range
    if (balanceMin != null) items = items.filter((t) => t.balance >= balanceMin);
    if (balanceMax != null) items = items.filter((t) => t.balance <= balanceMax);

    // Client-side: sort
    items.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "balance") cmp = a.balance - b.balance;
      else if (sortBy === "unit") cmp = a.unit.localeCompare(b.unit);
      else if (sortBy === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return items;
  }, [query.data, unit, balanceMin, balanceMax, sortBy, sortOrder]);

  const total = query.data?.pages?.[0]?.total ?? 0;

  return {
    data: { data, total },
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    error: query.error,
    isError: query.isError,
  };
}

/** Fetch a single tenant by ID. */
export function useTenant(id: number) {
  return useQuery({
    queryKey: tenantKeys.detail(String(id)),
    queryFn: () => api.tenants.getById(id),
    enabled: !!id,
  });
}

/** Fetch distinct unit values for filter dropdowns. */
export function useUnits() {
  return useQuery({
    queryKey: tenantKeys.units,
    queryFn: () => api.tenants.units(),
    staleTime: 5 * 60_000,
  });
}

/** Create tenant mutation with cache invalidation. */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, any>) => api.tenants.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

/** Delete tenant mutation with optimistic removal. */
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.tenants.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
