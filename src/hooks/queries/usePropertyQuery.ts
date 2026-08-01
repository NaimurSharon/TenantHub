import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { PropertyItem } from "@/lib/api/types";

export const propertyKeys = {
  all: ["properties"] as const,
  context: ["properties", "context"] as const,
  list: ["properties", "list"] as const,
};

/**
 * Hook to fetch selected property context & assigned properties.
 * Syncs the current active property & assigned list into Zustand useAuthStore.
 */
export function usePropertyContext() {
  const setPropertyContext = useAuthStore((s) => s.setPropertyContext);
  const setAssignedProperties = useAuthStore((s) => s.setAssignedProperties);

  const query = useQuery({
    queryKey: propertyKeys.context,
    queryFn: () => api.properties.getContext(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data) {
      if (query.data.assigned_properties) {
        setAssignedProperties(query.data.assigned_properties);
      }
      if (query.data.selected_property) {
        const p = query.data.selected_property;
        setPropertyContext({
          id: p.id,
          name: p.display_name || p.name,
          code: p.property_code || `P-${p.id}`,
        });
      }
    }
  }, [query.data, setPropertyContext, setAssignedProperties]);

  return query;
}

/**
 * Mutation hook to switch the active property context.
 * Updates the backend context, syncs Zustand store, and resets query caches.
 */
export function useSwitchProperty() {
  const queryClient = useQueryClient();
  const setPropertyContext = useAuthStore((s) => s.setPropertyContext);

  return useMutation({
    mutationFn: async (property: PropertyItem) => {
      const res = await api.properties.selectContext(property.id);
      return { property, res };
    },
    onSuccess: ({ property }) => {
      setPropertyContext({
        id: property.id,
        name: property.display_name || property.name,
        code: property.property_code || `P-${property.id}`,
      });
      // Invalidate all property & domain queries so lists re-fetch for newly selected property
      queryClient.resetQueries();
    },
  });
}
