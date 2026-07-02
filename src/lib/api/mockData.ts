/**
 * Demo tenant data — used while EXPO_PUBLIC_USE_MOCKS is "true".
 * Every mock function operates on this array so create/update/delete
 * persist for the lifetime of the JS bundle (hot-reload resets them).
 *
 * When real APIs are connected, this file is never imported.
 */
import type {
  Tenant,
  TenantFilters,
  CreateTenantInput,
  PaginatedResponse,
} from "./types";

const now = new Date().toISOString();

export const DEMO_TENANTS: Tenant[] = [
  {
    id: 1,
    name: "ABDUL KARIM & OTHERS",
    companyName: "ARAB ELECTRONICS",
    unit: "4TH-10",
    balance: 11606.3,
    status: "active",
    phone: "+971501234567",
    email: "abdul.karim@arabelectronics.ae",
    leaseStart: "2025-01-01",
    leaseEnd: "2026-12-31",
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 2,
    name: "ABDUS SALAM",
    companyName: "ARHAMHR TRADING",
    unit: "4TH-10",
    balance: 11606.3,
    status: "active",
    phone: "+971502345678",
    email: "salam@arhamhr.com",
    leaseStart: "2025-03-01",
    leaseEnd: "2027-02-28",
    createdAt: "2025-01-20T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 3,
    name: "ABDUL KARIM",
    companyName: "ARAB AL-JADEED",
    unit: "4TH-10",
    balance: 11606.3,
    status: "active",
    phone: "+971503456789",
    leaseStart: "2025-02-01",
    leaseEnd: "2027-01-31",
    createdAt: "2025-02-01T09:30:00Z",
    updatedAt: now,
  },
  {
    id: 4,
    name: "ABDUS SALAM",
    companyName: "ARHAMHR TRADING",
    unit: "4TH-10",
    balance: 11606.3,
    status: "active",
    leaseStart: "2025-04-01",
    leaseEnd: "2027-03-31",
    createdAt: "2025-03-10T11:00:00Z",
    updatedAt: now,
  },
  {
    id: 5,
    name: "ABDUS SALAM",
    companyName: "ARDU(R) LLC",
    unit: "4TH-10",
    balance: 11606.3,
    status: "active",
    phone: "+971504567890",
    leaseStart: "2025-05-01",
    leaseEnd: "2027-04-30",
    createdAt: "2025-04-05T14:00:00Z",
    updatedAt: now,
  },
  {
    id: 6,
    name: "MOHAMMED RASHID",
    companyName: "GULF STAR GENERAL TRADING",
    unit: "3RD-05",
    balance: 8450.0,
    status: "active",
    phone: "+971505678901",
    email: "m.rashid@gulfstar.ae",
    leaseStart: "2025-06-01",
    leaseEnd: "2027-05-31",
    createdAt: "2025-05-12T10:30:00Z",
    updatedAt: now,
  },
  {
    id: 7,
    name: "FATIMA AL MAZROUEI",
    companyName: "PEARL BEAUTY SALON",
    unit: "2ND-08",
    balance: 5200.75,
    status: "active",
    phone: "+971506789012",
    email: "fatima@pearlbeauty.ae",
    leaseStart: "2025-01-15",
    leaseEnd: "2026-07-14",
    createdAt: "2024-12-20T16:00:00Z",
    updatedAt: now,
  },
  {
    id: 8,
    name: "OMAR HASSAN",
    companyName: "GOLDEN SPICE RESTAURANT",
    unit: "GF-02",
    balance: 22340.0,
    status: "active",
    phone: "+971507890123",
    email: "omar@goldenspice.ae",
    leaseStart: "2024-09-01",
    leaseEnd: "2026-08-31",
    createdAt: "2024-08-10T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 9,
    name: "AHMED BIN YOUSEF",
    companyName: "DESERT TECH SOLUTIONS",
    unit: "5TH-03",
    balance: 0,
    status: "inactive",
    phone: "+971508901234",
    email: "ahmed@deserttech.ae",
    leaseStart: "2024-01-01",
    leaseEnd: "2025-12-31",
    notes: "Lease expired. Pending renewal discussion.",
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 10,
    name: "KHALID AL HAMMADI",
    companyName: "SUNSHINE TEXTILES",
    unit: "3RD-12",
    balance: 3800.5,
    status: "inactive",
    phone: "+971509012345",
    leaseStart: "2024-06-01",
    leaseEnd: "2025-05-31",
    notes: "Vacated. Security deposit pending refund.",
    createdAt: "2024-05-15T13:00:00Z",
    updatedAt: now,
  },
  {
    id: 11,
    name: "NOURA AL KETBI",
    companyName: "BLOSSOM FLOWERS",
    unit: "GF-07",
    balance: 1200.0,
    status: "inactive",
    phone: "+971509123456",
    email: "noura@blossomflowers.ae",
    leaseStart: "2023-10-01",
    leaseEnd: "2025-09-30",
    createdAt: "2023-09-15T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 12,
    name: "SAEED MOHAMMED",
    companyName: "BLUE OCEAN IMPORTS",
    unit: "4TH-15",
    balance: 15780.0,
    status: "inactive",
    phone: "+971509234567",
    email: "saeed@blueocean.ae",
    leaseStart: "2024-03-01",
    leaseEnd: "2025-02-28",
    notes: "Contract terminated early.",
    createdAt: "2024-02-10T11:00:00Z",
    updatedAt: now,
  },
];

/* ── In-memory mutable store ─────────────────────────────────────────────── */

let tenants = [...DEMO_TENANTS];

function delay(ms = 350): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let nextId = 100;

/* ── Mock API handlers ───────────────────────────────────────────────────── */

export async function mockListTenants(
  filters: TenantFilters,
): Promise<PaginatedResponse<Tenant>> {
  await delay();

  let results = [...tenants];

  // Status filter (required)
  results = results.filter((t) => t.status === filters.status);

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.companyName?.toLowerCase().includes(q) ||
        t.unit.toLowerCase().includes(q),
    );
  }

  // Unit filter
  if (filters.unit) {
    const u = filters.unit.toLowerCase();
    results = results.filter((t) => t.unit.toLowerCase().includes(u));
  }

  // Balance range
  if (filters.balanceMin != null)
    results = results.filter((t) => t.balance >= filters.balanceMin!);
  if (filters.balanceMax != null)
    results = results.filter((t) => t.balance <= filters.balanceMax!);

  // Sort
  const sortBy = filters.sortBy || "name";
  const order = filters.sortOrder || "asc";
  results.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else if (sortBy === "balance") cmp = a.balance - b.balance;
    else if (sortBy === "unit") cmp = a.unit.localeCompare(b.unit);
    else if (sortBy === "createdAt")
      cmp =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return order === "asc" ? cmp : -cmp;
  });

  return {
    data: results,
    total: results.length,
    page: 1,
    pageSize: 50,
    hasMore: false,
  };
}

export async function mockGetTenant(id: number): Promise<Tenant> {
  await delay(200);
  const t = tenants.find((t) => t.id === id);
  if (!t) throw new Error("Tenant not found");
  return { ...t };
}

export async function mockCreateTenant(
  input: CreateTenantInput,
): Promise<Tenant> {
  await delay(500);
  const tenant: Tenant = {
    id: ++nextId,
    name: input.name,
    companyName: input.companyName,
    unit: input.unit,
    balance: input.balance ?? 0,
    status: input.status ?? "active",
    phone: input.phone,
    email: input.email,
    leaseStart: input.leaseStart,
    leaseEnd: input.leaseEnd,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tenants.unshift(tenant);
  return tenant;
}

export async function mockUpdateTenant(
  id: number,
  input: Partial<CreateTenantInput>,
): Promise<Tenant> {
  await delay(400);
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Tenant not found");
  tenants[idx] = {
    ...tenants[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  return { ...tenants[idx] };
}

export async function mockDeleteTenant(id: number): Promise<void> {
  await delay(300);
  tenants = tenants.filter((t) => t.id !== id);
}

/** Returns all unique unit values from the current data set. */
export async function mockGetUnits(): Promise<string[]> {
  await delay(150);
  return [...new Set(tenants.map((t) => t.unit))].sort();
}
