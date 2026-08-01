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

export interface PropertyItem {
  id: number;
  property_code: string;
  name: string;
  display_name: string;
  property_type: string;
  is_active: boolean;
}

export interface PropertyContextResponse {
  selected_property: PropertyItem | null;
  assigned_properties: PropertyItem[];
  assigned_property_count: number;
  selection_required: boolean;
}

export interface TenantFilters {
  status: TenantStatus;
  search?: string;
  unit?: string;
  balanceMin?: number;
  balanceMax?: number;
  sortBy?: "name" | "balance" | "unit" | "createdAt" | "longestOverdue";
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

let activeCurrencySymbol = "$";

export function setGlobalCurrencySymbol(symbol: string) {
  if (symbol && symbol.trim()) {
    activeCurrencySymbol = symbol.trim();
  }
}

export function getGlobalCurrencySymbol(): string {
  return activeCurrencySymbol;
}

export function formatCurrency(
  amount: number | null | undefined,
  customSymbol?: string
): string {
  const symbol = customSymbol || activeCurrencySymbol || "$";
  let storeFormat: any = null;
  try {
    const { useAuthStore } = require("@/store/useAuthStore");
    storeFormat = useAuthStore.getState()?.currencyFormat;
  } catch {
    storeFormat = null;
  }
  const formatOpts = storeFormat || {};

  const decimalPlaces = formatOpts.decimal_places ?? 2;
  const primaryGroup = formatOpts.primary_group_size ?? 3;
  const secondaryGroup = formatOpts.secondary_group_size ?? 3;
  const thousandSep = formatOpts.thousand_separator ?? ",";
  const decimalSep = formatOpts.decimal_separator ?? ".";
  const negativeFormat = formatOpts.negative_format ?? "Parentheses";

  const val = Number(amount) || 0;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  // 1. Format decimal portion
  const fixedStr = absVal.toFixed(decimalPlaces);
  const [intPart, decPart] = fixedStr.split(".");

  // 2. Format integer grouping (primary & secondary group sizes)
  let formattedInt = "";
  if (intPart.length <= primaryGroup) {
    formattedInt = intPart;
  } else {
    const primaryChunk = intPart.slice(-primaryGroup);
    let remaining = intPart.slice(0, -primaryGroup);
    const chunks = [];

    const secSize = secondaryGroup > 0 ? secondaryGroup : primaryGroup;
    while (remaining.length > 0) {
      if (remaining.length <= secSize) {
        chunks.unshift(remaining);
        break;
      }
      chunks.unshift(remaining.slice(-secSize));
      remaining = remaining.slice(0, -secSize);
    }

    formattedInt = chunks.join(thousandSep) + thousandSep + primaryChunk;
  }

  // 3. Combine integer and decimal parts
  const numberStr = decPart !== undefined && decimalPlaces > 0
    ? `${formattedInt}${decimalSep}${decPart}`
    : formattedInt;

  if (isNegative) {
    if (negativeFormat === "Parentheses") {
      return `${symbol} (${numberStr})`;
    }
    return `${symbol} -${numberStr}`;
  }

  return `${symbol} ${numberStr}`;
}

/* ── Date Formatting Utilities ───────────────────────────────────────────── */

export type DateFormatPattern =
  | "MM/dd/yyyy"
  | "dd-MM-yyyy"
  | "MMM d, yyyy"
  | "MMMM d, yyyy"
  | "EEEE, MMM d"
  | "yyyy-MM-dd";

let activeDateFormat: DateFormatPattern = "MM/dd/yyyy"; // Default to US Format selected in Admin Panel

export function setGlobalDateFormat(pattern: DateFormatPattern | string) {
  if (pattern && pattern.trim()) {
    activeDateFormat = pattern.trim() as DateFormatPattern;
  }
}

export function getGlobalDateFormat(): DateFormatPattern {
  return activeDateFormat;
}

export function formatDate(
  dateInput: string | Date | null | undefined,
  pattern?: DateFormatPattern | string
): string {
  if (!dateInput) return "";

  let d: Date;
  if (typeof dateInput === "string") {
    const cleanStr = dateInput.split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) return String(dateInput);

  let fmt = pattern;
  if (!fmt) {
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      fmt = useAuthStore.getState()?.dateFormat;
    } catch {
      fmt = activeDateFormat;
    }
  }
  if (!fmt) fmt = activeDateFormat;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const monthShort = d.toLocaleDateString("en-US", { month: "short" });
  const monthLong = d.toLocaleDateString("en-US", { month: "long" });
  const dayNameLong = d.toLocaleDateString("en-US", { weekday: "long" });

  switch (fmt) {
    case "MM/dd/yyyy":
      return `${mm}/${dd}/${yyyy}`;
    case "dd-MM-yyyy":
      return `${dd}-${mm}-${yyyy}`;
    case "MMM d, yyyy":
      return `${monthShort} ${d.getDate()}, ${yyyy}`;
    case "MMMM d, yyyy":
      return `${monthLong} ${d.getDate()}, ${yyyy}`;
    case "EEEE, MMM d":
      return `${dayNameLong}, ${monthShort} ${d.getDate()}`;
    case "yyyy-MM-dd":
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${mm}/${dd}/${yyyy}`;
  }
}
