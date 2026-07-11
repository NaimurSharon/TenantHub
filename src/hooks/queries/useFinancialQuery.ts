import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const financialKeys = {
  all: ["financial"] as const,
  bankAccounts: (isActive: boolean) => ["financial", "bankAccounts", isActive] as const,
  bankAccountDetail: (id: number | null) => ["financial", "bankAccountDetail", id] as const,
  dailyReport: (date: string, propertyId: number) => ["financial", "dailyReport", date, propertyId] as const,
};

export function useBankAccounts(isActive: boolean) {
  return useQuery({
    queryKey: financialKeys.bankAccounts(isActive),
    queryFn: () => api.financial.listAccounts(isActive),
    staleTime: 5 * 60_000,   // 5 min — account list rarely changes
    gcTime: 30 * 60_000,
  });
}

export function useBankAccountDetail(id: number | null) {
  return useQuery({
    queryKey: financialKeys.bankAccountDetail(id),
    queryFn: () => api.financial.getAccountDetail(id!),
    enabled: !!id,
    staleTime: 2 * 60_000,   // 2 min — balance/transactions can change
    gcTime: 15 * 60_000,
  });
}

export function useDailyReport(date: string, propertyId: number) {
  // Past dates are immutable — once fetched, they never need to be re-fetched
  // within the same session (Infinity staleTime). Today's date is live data
  // and should re-fetch on every screen re-mount (60 s staleTime).
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;

  return useQuery({
    queryKey: financialKeys.dailyReport(date, propertyId),
    queryFn: () => api.reports.getDailyReport(date, propertyId),
    staleTime: isToday ? 60_000 : Infinity, // Past reports are immutable
    gcTime: isToday ? 15 * 60_000 : 60 * 60_000, // Past reports kept longer
  });
}

