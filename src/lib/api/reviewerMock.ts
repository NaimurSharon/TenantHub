import type { HubData, Tenant, PaginatedResponse, Contact } from "./types";

const now = new Date().toISOString().split("T")[0];

// Mock Tenants for Reviewer
export const MOCK_REVIEWER_TENANTS: Tenant[] = [
  {
    id: 101,
    name: "B.D. TRADING (F.S JOHER)",
    companyName: "BD TRADING LLC",
    unit: "GF-03",
    balance: 17888.82,
    status: "active",
    phone: "+971 50 123 4567",
    email: "info@bdtrading.com",
    leaseStart: "2025-01-01",
    leaseEnd: "2026-12-31",
    createdAt: "2025-01-01T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 102,
    name: "AL SHAMSI FOODS",
    companyName: "AL SHAMSI RESTAURANT",
    unit: "GF-04",
    balance: -4500.00, // Credit balance
    status: "active",
    phone: "+971 50 987 6543",
    email: "accounts@alshamsifoods.ae",
    leaseStart: "2025-03-01",
    leaseEnd: "2026-02-28",
    createdAt: "2025-03-01T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 103,
    name: "VERTEX SOFTWARE SYSTEMS",
    companyName: "VERTEX GLOBAL",
    unit: "5TH-12",
    balance: 0.00,
    status: "active",
    phone: "+971 4 555 7890",
    email: "contact@vertexglobal.com",
    leaseStart: "2024-06-01",
    leaseEnd: "2026-05-31",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: now,
  }
];

// Mock Hub Data for Tenant 101
export const MOCK_HUB_DATA_101: HubData = {
  header: {
    display_name: "B.D. TRADING (F.S JOHER)",
    customer_code: "LEG-CUST-000026",
    current_balance: 17888.82,
    status: "active",
  },
  summary: {
    invoice_total: 480504.82,
    receipt_total: 462616.00,
    running_balance: 17888.82,
    outstanding_amount: 17888.82,
    active_lease_count: 1,
    unit_count: 1,
    next_expiry_date: "2026-12-31",
  },
  transactions: [
    { id: 1, number: "TXN-001", date: now, amount: 480504.82, status: "posted", type: "Invoice", reference: "INV-2026-001" },
    { id: 2, number: "TXN-002", date: now, amount: -462616.00, status: "posted", type: "Receipt", reference: "REC-2026-001" }
  ],
  invoices: [
    { id: 10, invoice_no: "INV-2026-001", invoice_date: now, total_amount: 480504.82, status: "partial", invoice_type: "Rent Invoice" }
  ],
  receipts: [
    { id: 20, receipt_no: "REC-2026-001", receipt_date: now, amount: 462616.00, status: "posted" }
  ],
  credit_memos: [],
  documents: [
    { id: 30, label: "Tenancy_Contract_GF03.pdf", date: "2025-01-01" },
    { id: 31, label: "Trade_License_2026.pdf", date: "2025-12-15" }
  ],
  contacts: [
    { id: 40, contact_name: "John Doe", designation: "Finance Manager", email: "john@bdtrading.com", mobile: "+971 50 111 2222", is_primary: true, is_active: true }
  ],
  active_leases: [
    { id: 50, lease_no: "LEASE-GF03", start_date: "2025-01-01", end_date: "2026-12-31" }
  ],
  units: [
    { unit: { id: 60, unit_name: "GF-03" } }
  ]
};

// Default Empty Hub Data for other tenants
export function getMockHubData(id: number): HubData {
  if (id === 101) return MOCK_HUB_DATA_101;
  const tenant = MOCK_REVIEWER_TENANTS.find(t => t.id === id) ?? MOCK_REVIEWER_TENANTS[0];
  return {
    header: {
      display_name: tenant.name,
      customer_code: `LEG-CUST-000${tenant.id}`,
      current_balance: tenant.balance,
      status: tenant.status,
    },
    summary: {
      invoice_total: Math.max(0, tenant.balance),
      receipt_total: 0,
      running_balance: tenant.balance,
      outstanding_amount: tenant.balance,
      active_lease_count: 1,
      unit_count: 1,
      next_expiry_date: "2026-12-31",
    },
    transactions: [],
    invoices: [],
    receipts: [],
    credit_memos: [],
    documents: [],
    contacts: [],
    active_leases: [],
    units: [{ unit: { id: tenant.id + 1000, unit_name: tenant.unit } }]
  };
}

// Mock Bank Accounts
export const MOCK_BANK_ACCOUNTS = [
  { id: 201, bank_name: "Emirates NBD - Main", account_no: "XXXXX1234", current_balance: 1452200.50, currency: "AED" },
  { id: 202, bank_name: "ADCB - Operating", account_no: "XXXXX5678", current_balance: -12500.00, currency: "AED" }, // Negative balance
  { id: 203, bank_name: "Mashreq Cash", account_no: "CASH-OFFICE", current_balance: 4500.00, currency: "AED" }
];

// Mock Bank Account detail with movements
export function getMockAccountDetail(id: number) {
  const account = MOCK_BANK_ACCOUNTS.find(a => a.id === id) ?? MOCK_BANK_ACCOUNTS[0];
  return {
    ...account,
    transactions: [
      { id: 301, date: now, reference: "REF-9921", description: "Rent Receipt - GF-03", amount: 15000.00, status: "posted" },
      { id: 302, date: now, reference: "REF-9922", description: "Maintenance Payment", amount: -12500.00, status: "posted" },
      { id: 303, date: now, reference: "REF-9923", description: "Office Supplies", amount: -450.00, status: "posted" }
    ],
    transfers: [
      { id: 401, date: now, transfer_no: "TRF-2026-001", remarks: "Internal Transfer to Main", amount: 5000.00, from_bank_account_id: id + 1, to: "Emirates NBD - Main", from: account.bank_name, status: "posted" }
    ]
  };
}

// Mock Daily Report Data
export function getMockDailyReport(date: string) {
  return {
    summary: {
      invoice_amount: 154200.00,
      invoice_count: 5,
      receipt_amount: 112500.00,
      receipt_count: 8,
      payment_amount: 45000.00,
      payment_count: 3,
      outstanding_amount: 41700.00
    },
    balances: [
      { sl: 1, type: "Emirates NBD - Main", opening: 1352200.50, closing: 1452200.50 },
      { sl: 2, type: "ADCB - Operating", opening: 0, closing: -12500.00 },
      { sl: 3, type: "Mashreq Cash", opening: 4500.00, closing: 4500.00 }
    ],
    collections: [
      { sl: 1, category: "Residential Rent", invoices: 3, collections: 85000.00 },
      { sl: 2, category: "Commercial Rent", invoices: 2, collections: 27500.00 }
    ],
    breakdown: [
      { sl: 1, head: "Service Charges", current: 8500.00, aggregate: 92000.00 },
      { sl: 2, head: "Utility Recoveries", current: 3500.00, aggregate: 41000.00 }
    ]
  };
}
