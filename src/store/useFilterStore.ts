/**
 * Filter & search state for the tenant list.
 *
 * Zustand store (no persistence needed — filters reset on app restart,
 * which is the expected behaviour for transient UI state).
 */
import { create } from "zustand";
import type { TenantStatus } from "@/lib/api/types";

export type SortField = "name" | "balance" | "unit" | "createdAt";
export type SortOrder = "asc" | "desc";

interface FilterState {
  status: TenantStatus;
  search: string;
  unit: string;
  balanceMin: number | null;
  balanceMax: number | null;
  sortBy: SortField;
  sortOrder: SortOrder;

  setStatus: (s: TenantStatus) => void;
  setSearch: (s: string) => void;
  setUnit: (u: string) => void;
  setBalanceRange: (min: number | null, max: number | null) => void;
  setSort: (field: SortField, order: SortOrder) => void;
  /** True when any filter beyond the status toggle is active. */
  hasActiveFilters: () => boolean;
  reset: () => void;
}

const DEFAULTS = {
  status: "active" as TenantStatus,
  search: "",
  unit: "",
  balanceMin: null as number | null,
  balanceMax: null as number | null,
  sortBy: "name" as SortField,
  sortOrder: "asc" as SortOrder,
};

export const useFilterStore = create<FilterState>((set, get) => ({
  ...DEFAULTS,

  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  setUnit: (unit) => set({ unit }),
  setBalanceRange: (min, max) => set({ balanceMin: min, balanceMax: max }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  hasActiveFilters: () => {
    const s = get();
    return (
      s.search !== "" ||
      s.unit !== "" ||
      s.balanceMin !== null ||
      s.balanceMax !== null ||
      s.sortBy !== "name" ||
      s.sortOrder !== "asc"
    );
  },

  reset: () => set(DEFAULTS),
}));
