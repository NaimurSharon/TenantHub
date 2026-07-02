/**
 * API facade — all backend operations.
 * Connects to https://devbackendbms.siscotech.com/api
 */
import { apiRequest } from "./client";
import type {
  Tenant,
  Customer,
  TenantFilters,
  CreateTenantInput,
  PaginatedResponse,
  Contact,
  ContactInput,
  HubData,
} from "./types";
import { customerToTenant } from "./types";

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await apiRequest<{ data: { token: string; user: any } }>(
        "/auth/login",
        { method: "POST", body: { email, password, device_name: "react-native" } },
      );
      return res.data;
    },
    me: async () => {
      return apiRequest<{ data: any }>("/me");
    },
    logout: async () => {
      return apiRequest<void>("/auth/logout", { method: "POST" });
    },
  },

  tenants: {
    /** List tenants/customers with search + pagination. */
    list: async (
      filters: TenantFilters,
    ): Promise<PaginatedResponse<Tenant>> => {
      const res = await apiRequest<{
        data: Customer[];
        meta?: { total?: number; current_page?: number; per_page?: number; last_page?: number };
      }>("/customers", {
        query: {
          per_page: filters.perPage ?? 20,
          page: filters.page ?? 1,
          is_active: filters.status === "active" ? 1 : 0,
          ...(filters.search ? { q: filters.search } : {}),
        },
      });
      const tenants = (res.data ?? []).map(customerToTenant);
      const meta = res.meta ?? {};
      return {
        data: tenants,
        total: meta.total ?? tenants.length,
        page: meta.current_page ?? 1,
        pageSize: meta.per_page ?? 20,
        hasMore: (meta.current_page ?? 1) < (meta.last_page ?? 1),
      };
    },

    /** Get a single tenant by ID. */
    getById: async (id: number): Promise<Tenant> => {
      const res = await apiRequest<{ data: { customer: Customer } }>(`/customers/${id}`);
      return customerToTenant(res.data.customer);
    },

    /** Get tenant hub data (transactions, invoices, etc.) */
    hub: async (customerId: number): Promise<HubData> => {
      const res = await apiRequest<{ data: any }>(`/customers/${customerId}/hub`);
      const d = res.data ?? {};
      const tabs = d.tabs ?? {};
      return {
        header: d.header ?? null,
        summary: d.summary ?? null,
        transactions: tabs.transaction?.rows ?? [],
        invoices: tabs.invoice?.rows ?? [],
        receipts: tabs.receipt?.rows ?? [],
        credit_memos: tabs.credit_memo?.rows ?? [],
        documents: tabs.documents?.rows ?? d.documents ?? [],
        contacts: tabs.contact?.rows ?? [],
        active_leases: d.active_leases ?? [],
        units: d.units ?? [],
      };
    },

    /** Get contacts for a tenant. */
    contacts: async (customerId: number): Promise<Contact[]> => {
      const res = await apiRequest<{ data: { contacts: Contact[] } }>(`/customers/${customerId}/contacts`);
      return res.data?.contacts ?? [];
    },

    /** Create a contact. */
    createContact: async (customerId: number, input: ContactInput): Promise<Contact> => {
      const res = await apiRequest<{ data: Contact }>(`/customers/${customerId}/contacts`, {
        method: "POST",
        body: input,
      });
      return res.data;
    },

    /** Update a contact. */
    updateContact: async (customerId: number, contactId: number, input: Partial<ContactInput>): Promise<Contact> => {
      const res = await apiRequest<{ data: Contact }>(`/customers/${customerId}/contacts/${contactId}`, {
        method: "PATCH",
        body: input,
      });
      return res.data;
    },

    /** Delete a contact. */
    deleteContact: async (customerId: number, contactId: number): Promise<void> => {
      await apiRequest<void>(`/customers/${customerId}/contacts/${contactId}`, { method: "DELETE" });
    },

    /** Distinct unit values — via properties lookup. */
    units: async (): Promise<string[]> => {
      try {
        const res = await apiRequest<{ data: { label: string }[] }>("/properties/1/units/lookup");
        return (res.data ?? []).map((u) => u.label);
      } catch {
        return [];
      }
    },

    /** Create a new customer. */
    create: async (input: Record<string, any>): Promise<Tenant> => {
      const res = await apiRequest<{ data: { customer: Customer } }>("/customers", {
        method: "POST",
        body: input,
      });
      return customerToTenant(res.data.customer);
    },

    /** Delete. */
    delete: async (id: number): Promise<void> => {
      await apiRequest<void>(`/customers/${id}`, { method: "DELETE" });
    },
  },

  /** Billing / supporting APIs */
  billing: {
    invoices: async (customerId: number) => {
      const res = await apiRequest<{ data: any[] }>("/billing-invoices", {
        query: { customer_id: customerId },
      });
      return res.data ?? [];
    },
    receipts: async (customerId: number) => {
      const res = await apiRequest<{ data: any[] }>("/billing-receipts", {
        query: { customer_id: customerId },
      });
      return res.data ?? [];
    },
    leases: async (customerId: number) => {
      const res = await apiRequest<{ data: any[] }>("/leases", {
        query: { customer_id: customerId },
      });
      return res.data ?? [];
    },
  },

  properties: {
    list: async () => {
      const res = await apiRequest<{ data: any[] }>("/properties");
      return res.data ?? [];
    },
    floors: async (propertyId: number) => {
      const res = await apiRequest<{ data: any[] }>(`/properties/${propertyId}/floors/lookup`);
      return res.data ?? [];
    },
  },
};
