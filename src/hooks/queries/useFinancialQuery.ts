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
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useBankAccountDetail(id: number | null) {
  return useQuery({
    queryKey: financialKeys.bankAccountDetail(id),
    queryFn: () => api.financial.getAccountDetail(id!),
    enabled: !!id,
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
  });
}

export function useDailyReport(date: string, propertyId: number) {
  return useQuery({
    queryKey: financialKeys.dailyReport(date, propertyId),
    queryFn: () => api.reports.getDailyReport(date, propertyId),
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
  });
}
