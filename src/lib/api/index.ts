/**
 * API facade — all backend operations.
 * Connects to https://devbackendbms.siscotech.com/api
 */
import { apiRequest } from "./client";
import { useAuthStore } from "@/store/useAuthStore";
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
import {
  MOCK_REVIEWER_TENANTS,
  getMockHubData,
  MOCK_BANK_ACCOUNTS,
  getMockAccountDetail,
  getMockDailyReport,
} from "./reviewerMock";

// Check if currently logged in user is the App Store / Play Store reviewer
const isReviewer = (): boolean => {
  try {
    const user = useAuthStore.getState().user;
    return user?.email?.toLowerCase().trim() === "reviewer@kadertower.com";
  } catch {
    return false;
  }
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail === "reviewer@kadertower.com") {
        return {
          token: "mock-reviewer-token",
          user: {
            id: 9999,
            name: "Reviewer Mode",
            email: "reviewer@kadertower.com",
          },
        };
      }
      const res = await apiRequest<{ data: { token: string; user: any } }>(
        "/auth/login",
        { method: "POST", body: { email, password, device_name: "react-native" } },
      );
      return res.data;
    },
    me: async () => {
      if (isReviewer()) {
        return {
          data: {
            id: 9999,
            name: "Reviewer Mode",
            email: "reviewer@kadertower.com",
          },
        };
      }
      return apiRequest<{ data: any }>("/me");
    },
    logout: async () => {
      if (isReviewer()) return;
      return apiRequest<void>("/auth/logout", { method: "POST" });
    },
  },

  tenants: {
    /** List tenants/customers with search + pagination. */
    list: async (
      filters: TenantFilters,
    ): Promise<PaginatedResponse<Tenant>> => {
      if (isReviewer()) {
        let results = [...MOCK_REVIEWER_TENANTS];
        if (filters.status) {
          results = results.filter((t) => t.status === filters.status);
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          results = results.filter(
            (t) =>
              t.name.toLowerCase().includes(q) ||
              t.companyName?.toLowerCase().includes(q) ||
              t.unit.toLowerCase().includes(q)
          );
        }
        return {
          data: results,
          total: results.length,
          page: 1,
          pageSize: 20,
          hasMore: false,
        };
      }

      const queryParams: any = {
        per_page: filters.perPage ?? 20,
        page: filters.page ?? 1,
        is_active: filters.status === "active" ? 1 : 0,
        ...(filters.search ? { q: filters.search } : {}),
      };

      if (filters.sortBy) {
        if (filters.sortBy === "longestOverdue") {
          queryParams.source = "oldest_unpaid";
        } else {
          const sortByMap: Record<string, string> = {
            name: "display_name",
            balance: "current_balance",
            unit: "unit_name",
          };
          const mapped = sortByMap[filters.sortBy];
          if (mapped) {
            queryParams.sortBy = mapped;
            queryParams.order = filters.sortOrder ?? "asc";
          }
        }
      }

      const res = await apiRequest<{
        data: Customer[];
        meta?: { total?: number; current_page?: number; per_page?: number; last_page?: number };
      }>("/customers", {
        query: queryParams,
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
      if (isReviewer()) {
        const tenant = MOCK_REVIEWER_TENANTS.find((t) => t.id === id);
        if (!tenant) throw new Error("Tenant not found");
        return tenant;
      }
      const res = await apiRequest<{ data: { customer: Customer } }>(`/customers/${id}`);
      return customerToTenant(res.data.customer);
    },

    /** Get tenant hub data (transactions, invoices, etc.) */
    hub: async (customerId: number): Promise<HubData> => {
      if (isReviewer()) {
        return getMockHubData(customerId);
      }
      const res = await apiRequest<{ data: any }>(`/customers/${customerId}/hub`);
      const d = res.data ?? {};
      const tabs = d.tabs ?? {};
      return {
        header: d.header ?? null,
        summary: d.summary ?? null,
        transactions: tabs.transaction?.rows ?? [],
        invoices: tabs.invoice?.rows ?? [],
        receipts: tabs.receipt?.rows ?? [],
        credit_memos: tabs.credit_memos?.rows ?? [],
        documents: tabs.documents?.rows ?? d.documents ?? [],
        contacts: tabs.contact?.rows ?? [],
        active_leases: d.active_leases ?? [],
        units: d.units ?? [],
      };
    },

    /** Get contacts for a tenant. */
    contacts: async (customerId: number): Promise<Contact[]> => {
      if (isReviewer()) {
        return (getMockHubData(customerId).contacts || []) as Contact[];
      }
      const res = await apiRequest<{ data: { contacts: Contact[] } }>(`/customers/${customerId}/contacts`);
      return res.data?.contacts ?? [];
    },

    /** Create a contact. */
    createContact: async (customerId: number, input: ContactInput): Promise<Contact> => {
      if (isReviewer()) {
        const newContact: Contact = {
          id: Math.floor(Math.random() * 1000) + 500,
          contact_name: input.contact_name,
          designation: input.designation ?? "",
          email: input.email ?? "",
          mobile: input.mobile ?? "",
          is_primary: input.is_primary ?? false,
          is_active: input.is_active ?? true,
        };
        const hub = getMockHubData(customerId);
        if (!hub.contacts) hub.contacts = [];
        hub.contacts.push(newContact);
        return newContact;
      }
      const res = await apiRequest<{ data: Contact }>(`/customers/${customerId}/contacts`, {
        method: "POST",
        body: input,
      });
      return res.data;
    },

    /** Update a contact. */
    updateContact: async (customerId: number, contactId: number, input: Partial<ContactInput>): Promise<Contact> => {
      if (isReviewer()) {
        const hub = getMockHubData(customerId);
        if (!hub.contacts) hub.contacts = [];
        const contact = hub.contacts.find((c) => c.id === contactId);
        if (!contact) throw new Error("Contact not found");
        Object.assign(contact, input);
        return contact;
      }
      const res = await apiRequest<{ data: Contact }>(`/customers/${customerId}/contacts/${contactId}`, {
        method: "PATCH",
        body: input,
      });
      return res.data;
    },

    /** Delete a contact. */
    deleteContact: async (customerId: number, contactId: number): Promise<void> => {
      if (isReviewer()) {
        const hub = getMockHubData(customerId);
        if (hub.contacts) {
          hub.contacts = hub.contacts.filter((c) => c.id !== contactId);
        }
        return;
      }
      await apiRequest<void>(`/customers/${customerId}/contacts/${contactId}`, { method: "DELETE" });
    },

    /** Distinct unit values — via properties lookup. */
    units: async (): Promise<string[]> => {
      if (isReviewer()) {
        return ["GF-03", "GF-04", "5TH-12"];
      }
      try {
        const res = await apiRequest<{ data: { label: string }[] }>("/properties/1/units/lookup");
        return (res.data ?? []).map((u) => u.label);
      } catch {
        return [];
      }
    },

    /** Create a new customer. */
    create: async (input: Record<string, any>): Promise<Tenant> => {
      if (isReviewer()) {
        const newTenant: Tenant = {
          id: Math.floor(Math.random() * 1000) + 100,
          name: input.name,
          companyName: input.companyName,
          unit: input.unit,
          balance: Number(input.balance) || 0,
          status: input.status ?? "active",
          phone: input.phone,
          email: input.email,
          leaseStart: input.leaseStart,
          leaseEnd: input.leaseEnd,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        MOCK_REVIEWER_TENANTS.push(newTenant);
        return newTenant;
      }
      const res = await apiRequest<{ data: { customer: Customer } }>("/customers", {
        method: "POST",
        body: input,
      });
      return customerToTenant(res.data.customer);
    },

    /** Delete. */
    delete: async (id: number): Promise<void> => {
      if (isReviewer()) {
        const idx = MOCK_REVIEWER_TENANTS.findIndex((t) => t.id === id);
        if (idx !== -1) MOCK_REVIEWER_TENANTS.splice(idx, 1);
        return;
      }
      await apiRequest<void>(`/customers/${id}`, { method: "DELETE" });
    },
  },

  /** Billing / supporting APIs */
  billing: {
    invoices: async (customerId: number) => {
      if (isReviewer()) {
        return getMockHubData(customerId).invoices;
      }
      const res = await apiRequest<{ data: any[] }>("/billing-invoices", {
        query: { customer_id: customerId },
      });
      return res.data ?? [];
    },
    receipts: async (customerId: number) => {
      if (isReviewer()) {
        return getMockHubData(customerId).receipts;
      }
      const res = await apiRequest<{ data: any[] }>("/billing-receipts", {
        query: { customer_id: customerId },
      });
      return res.data ?? [];
    },
    leases: async (customerId: number) => {
      if (isReviewer()) {
        return getMockHubData(customerId).active_leases;
      }
      const res = await apiRequest<{ data: any[] }>("/leases", {
        query: { customer_id: customerId },
      });
      return res.data ?? [];
    },
  },

  properties: {
    list: async () => {
      if (isReviewer()) {
        return [{ id: 1, name: "Kader Tower" }];
      }
      const res = await apiRequest<{ data: any[] }>("/properties");
      return res.data ?? [];
    },
    floors: async (propertyId: number) => {
      if (isReviewer()) {
        return [{ id: 1, name: "Ground Floor" }, { id: 2, name: "5th Floor" }];
      }
      const res = await apiRequest<{ data: any[] }>(`/properties/${propertyId}/floors/lookup`);
      return res.data ?? [];
    },
  },

  financial: {
    listAccounts: async (isActive: boolean) => {
      if (isReviewer()) {
        return MOCK_BANK_ACCOUNTS;
      }
      const res = await apiRequest<{ data: { bank_accounts: any[] } }>("/setting/bank-accounts", {
        query: { is_active: isActive ? 1 : 0 },
      });
      return res.data?.bank_accounts ?? [];
    },
    getAccountDetail: async (accountId: number) => {
      if (isReviewer()) {
        return getMockAccountDetail(accountId);
      }
      const res = await apiRequest<{ data: { bank_account: any } }>(`/setting/bank-accounts/${accountId}`);
      return res.data?.bank_account ?? null;
    },
  },

  reports: {
    getDailyReport: async (date: string, propertyId: number) => {
      if (isReviewer()) {
        return getMockDailyReport(date);
      }
      const res = await apiRequest<{ data: any }>("/reports/daily-report", {
        query: { date, property_id: propertyId },
      });
      return res.data ?? null;
    },
  },
};
