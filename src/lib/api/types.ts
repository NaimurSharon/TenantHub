/* ── Tenant Hub API Types ─────────────────────────────────────────────────── */

export type TenantStatus = "active" | "inactive";

export interface Tenant {
  id: number;
  name: string;
  companyName?: string;
  unit: string;
  balance: number;
  status: TenantStatus;
  phone?: string;
  email?: string;
  leaseStart?: string;
  leaseEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /customers */
export interface Customer {
  id: number;
  customer_code?: string;
  display_name?: string | null;
  contact_person?: string | null;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_alt?: string | null;
  address?: string | null;
  is_active?: boolean;
  unit_name?: string | null;
  balance_amount?: string | number | null;
  current_balance?: number | null;
  outstanding_amount?: number | null;
  contacts_count?: number;
  leases_count?: number;
  invoices_count?: number;
  receipts_count?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

/** Normalise API customer into app Tenant shape */
export function customerToTenant(c: Customer): Tenant {
  const balance = Number(c.current_balance ?? c.balance_amount ?? c.outstanding_amount ?? 0);
  return {
    id: c.id,
    name: c.display_name ?? c.contact_person ?? "",
    companyName: c.contact_person && c.contact_person !== c.display_name ? c.contact_person : undefined,
    unit: c.unit_name ?? "",
    balance: isNaN(balance) ? 0 : balance,
    status: c.is_active === false ? "inactive" : "active",
    phone: c.phone ?? c.phone_alt ?? undefined,
    email: c.email ?? undefined,
    createdAt: c.created_at ?? "",
    updatedAt: c.updated_at ?? "",
  };
}

export interface Contact {
  id: number;
  contact_name: string;
  designation?: string | null;
  email?: string | null;
  mobile?: string | null;
  is_primary: boolean;
  is_active: boolean;
}

export interface ContactInput {
  contact_name: string;
  designation?: string;
  email?: string;
  mobile?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface HubData {
  header?: any;
  summary?: any;
  transactions?: any[];
  invoices?: any[];
  receipts?: any[];
  credit_memos?: any[];
  documents?: any[];
  contacts?: any[];
  active_leases?: any[];
  units?: any[];
}

export interface TenantFilters {
  status: TenantStatus;
  search?: string;
  unit?: string;
  balanceMin?: number;
  balanceMax?: number;
  sortBy?: "name" | "balance" | "unit" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface CreateTenantInput {
  name: string;
  companyName?: string;
  unit: string;
  balance?: number;
  status?: TenantStatus;
  phone?: string;
  email?: string;
  leaseStart?: string;
  leaseEnd?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/* ── Utility ─────────────────────────────────────────────────────────────── */

export function formatCurrency(amount: number | null | undefined): string {
  const val = Number(amount) || 0;
  return `$ ${val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
