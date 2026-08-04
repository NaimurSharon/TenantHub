import type { HubData, Tenant } from "./types";

const now = new Date().toISOString().split("T")[0];

// 25+ Realistic Mock Tenants for Reviewer Mode (John Doe)
export const MOCK_REVIEWER_TENANTS: Tenant[] = [
  {
    id: 101,
    name: "NEXUS GLOBAL TECHNOLOGIES LLC",
    companyName: "NEXUS GLOBAL FZ",
    unit: "5TH-12",
    balance: 17888.82,
    status: "active",
    phone: "+971 4 399 8811",
    email: "billing@nexusglobal.ae",
    leaseStart: "2025-01-01",
    leaseEnd: "2026-12-31",
    createdAt: "2025-01-01T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 102,
    name: "AURA DESIGN STUDIO FZ-LLC",
    companyName: "AURA DESIGNS",
    unit: "3RD-04",
    balance: -4500.00, // Credit balance
    status: "active",
    phone: "+971 50 987 6543",
    email: "accounts@auradesign.ae",
    leaseStart: "2025-03-01",
    leaseEnd: "2026-02-28",
    createdAt: "2025-03-01T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 103,
    name: "QUANTUM LOGISTICS SOLUTIONS",
    companyName: "QUANTUM LOGISTICS",
    unit: "GF-01",
    balance: 0.00,
    status: "active",
    phone: "+971 4 555 7890",
    email: "info@quantumlogistics.com",
    leaseStart: "2024-06-01",
    leaseEnd: "2026-05-31",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 104,
    name: "VELOCITY MOTORS TRADING",
    companyName: "VELOCITY AUTO GROUP",
    unit: "GF-02",
    balance: 45210.50,
    status: "active",
    phone: "+971 4 333 1122",
    email: "finance@velocitymotors.ae",
    leaseStart: "2024-09-15",
    leaseEnd: "2026-09-14",
    createdAt: "2024-09-15T11:00:00Z",
    updatedAt: now,
  },
  {
    id: 105,
    name: "BLUE HORIZON REAL ESTATE",
    companyName: "BLUE HORIZON HOLDINGS",
    unit: "2ND-08",
    balance: 8900.00,
    status: "active",
    phone: "+971 4 222 4455",
    email: "admin@bluehorizonre.com",
    leaseStart: "2025-02-01",
    leaseEnd: "2027-01-31",
    createdAt: "2025-02-01T08:30:00Z",
    updatedAt: now,
  },
  {
    id: 106,
    name: "STARLIGHT RETAILERS LTD",
    companyName: "STARLIGHT STORES",
    unit: "GF-05",
    balance: 12450.00,
    status: "active",
    phone: "+971 50 444 9988",
    email: "payables@starlightretail.ae",
    leaseStart: "2024-11-01",
    leaseEnd: "2026-10-31",
    createdAt: "2024-11-01T09:15:00Z",
    updatedAt: now,
  },
  {
    id: 107,
    name: "ZENITH LAW ASSOCIATES",
    companyName: "ZENITH LEGAL FZ",
    unit: "4TH-02",
    balance: 0.00,
    status: "active",
    phone: "+971 4 888 3344",
    email: "contact@zenithlaw.ae",
    leaseStart: "2023-05-01",
    leaseEnd: "2026-04-30",
    createdAt: "2023-05-01T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 108,
    name: "HYPERION MEDICAL CENTER",
    companyName: "HYPERION HEALTHCARE",
    unit: "1ST-01",
    balance: 29300.00,
    status: "active",
    phone: "+971 4 777 5566",
    email: "accounts@hyperionhealth.ae",
    leaseStart: "2024-01-01",
    leaseEnd: "2026-12-31",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 109,
    name: "PRISM ADVERTISING & MEDIA",
    companyName: "PRISM CREATIVE FZ",
    unit: "3RD-09",
    balance: -2100.00, // Credit balance
    status: "active",
    phone: "+971 55 666 7788",
    email: "finance@prismmedia.ae",
    leaseStart: "2025-04-01",
    leaseEnd: "2026-03-31",
    createdAt: "2025-04-01T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 110,
    name: "SOLARIS CLEAN ENERGY SOLUTIONS",
    companyName: "SOLARIS POWER FZE",
    unit: "6TH-05",
    balance: 54000.00,
    status: "active",
    phone: "+971 4 111 2233",
    email: "info@solarisenergy.ae",
    leaseStart: "2024-08-01",
    leaseEnd: "2026-07-31",
    createdAt: "2024-08-01T07:45:00Z",
    updatedAt: now,
  },
  {
    id: 111,
    name: "TITAN ENGINEERING & CONSTRUCTION",
    companyName: "TITAN BUILDERS LLC",
    unit: "7TH-01",
    balance: 108500.00,
    status: "active",
    phone: "+971 4 999 0011",
    email: "billing@titaneng.ae",
    leaseStart: "2023-10-01",
    leaseEnd: "2026-09-30",
    createdAt: "2023-10-01T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 112,
    name: "ATLAS SUPPLY CHAIN SOLUTIONS",
    companyName: "ATLAS FREIGHT FZE",
    unit: "2ND-03",
    balance: 14350.00,
    status: "active",
    phone: "+971 4 444 5566",
    email: "ops@atlasfreight.ae",
    leaseStart: "2025-01-15",
    leaseEnd: "2027-01-14",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 113,
    name: "CRESCENT FINANCIAL ADVISORS",
    companyName: "CRESCENT CAPITAL",
    unit: "5TH-01",
    balance: 0.00,
    status: "active",
    phone: "+971 4 666 1122",
    email: "info@crescentcapital.ae",
    leaseStart: "2024-03-01",
    leaseEnd: "2026-02-28",
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 114,
    name: "ORION PHARMACEUTICALS TRADING",
    companyName: "ORION PHARMA FZ",
    unit: "1ST-08",
    balance: 32600.00,
    status: "active",
    phone: "+971 4 555 9900",
    email: "accounts@orionpharma.ae",
    leaseStart: "2024-07-01",
    leaseEnd: "2026-06-30",
    createdAt: "2024-07-01T08:30:00Z",
    updatedAt: now,
  },
  {
    id: 115,
    name: "APEX CONSULTING SERVICES",
    companyName: "APEX GROUP",
    unit: "4TH-08",
    balance: 6750.00,
    status: "active",
    phone: "+971 50 333 7711",
    email: "support@apexconsulting.ae",
    leaseStart: "2025-05-01",
    leaseEnd: "2026-04-30",
    createdAt: "2025-05-01T11:00:00Z",
    updatedAt: now,
  },
  {
    id: 116,
    name: "VORTEX CYBERSECURITY SOLUTIONS",
    companyName: "VORTEX SEC FZ",
    unit: "6TH-10",
    balance: 0.00,
    status: "active",
    phone: "+971 4 222 9911",
    email: "security@vortexsec.ae",
    leaseStart: "2024-12-01",
    leaseEnd: "2026-11-30",
    createdAt: "2024-12-01T10:15:00Z",
    updatedAt: now,
  },
  {
    id: 117,
    name: "MIRAGE INTERIOR DESIGNS",
    companyName: "MIRAGE CONCEPTS",
    unit: "3RD-01",
    balance: 19800.00,
    status: "active",
    phone: "+971 55 111 4433",
    email: "info@miragedesigns.ae",
    leaseStart: "2024-04-01",
    leaseEnd: "2026-03-31",
    createdAt: "2024-04-01T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 118,
    name: "OMEGA INDUSTRIAL SUPPLIES",
    companyName: "OMEGA TRADING LLC",
    unit: "GF-08",
    balance: 78500.00,
    status: "active",
    phone: "+971 4 888 2211",
    email: "sales@omegasupplies.ae",
    leaseStart: "2023-11-01",
    leaseEnd: "2026-10-31",
    createdAt: "2023-11-01T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 119,
    name: "SPECTRA EVENTS & EXHIBITIONS",
    companyName: "SPECTRA MEDIA",
    unit: "2ND-12",
    balance: -1500.00, // Credit balance
    status: "active",
    phone: "+971 50 888 4422",
    email: "events@spectramedia.ae",
    leaseStart: "2025-06-01",
    leaseEnd: "2026-05-31",
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 120,
    name: "BEACON IT SOLUTIONS",
    companyName: "BEACON SYSTEMS",
    unit: "5TH-06",
    balance: 11200.00,
    status: "active",
    phone: "+971 4 777 1144",
    email: "help@beaconsolutions.ae",
    leaseStart: "2024-10-01",
    leaseEnd: "2026-09-30",
    createdAt: "2024-10-01T09:30:00Z",
    updatedAt: now,
  },
  {
    id: 121,
    name: "PULSE FITNESS & WELLNESS",
    companyName: "PULSE GYM LLC",
    unit: "1ST-05",
    balance: 24500.00,
    status: "active",
    phone: "+971 4 333 8899",
    email: "membership@pulsefitness.ae",
    leaseStart: "2024-02-01",
    leaseEnd: "2026-01-31",
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: now,
  },
  {
    id: 122,
    name: "EMPYREAN AVIATION SERVICES",
    companyName: "EMPYREAN CHARTERS",
    unit: "7TH-05",
    balance: 96000.00,
    status: "active",
    phone: "+971 4 999 4455",
    email: "charter@empyrean.ae",
    leaseStart: "2023-08-01",
    leaseEnd: "2026-07-31",
    createdAt: "2023-08-01T11:00:00Z",
    updatedAt: now,
  },
  {
    id: 123,
    name: "KINETIC AUTOMATION SYSTEMS",
    companyName: "KINETIC ROBOTICS",
    unit: "6TH-01",
    balance: 0.00,
    status: "active",
    phone: "+971 4 555 3322",
    email: "contact@kineticrobotics.ae",
    leaseStart: "2025-02-15",
    leaseEnd: "2027-02-14",
    createdAt: "2025-02-15T09:00:00Z",
    updatedAt: now,
  },
  {
    id: 124,
    name: "ECHO HOSPITALITY GROUP",
    companyName: "ECHO RESTAURANTS",
    unit: "GF-10",
    balance: 38900.00,
    status: "active",
    phone: "+971 50 777 3311",
    email: "accounts@echogroup.ae",
    leaseStart: "2024-05-01",
    leaseEnd: "2026-04-30",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: now,
  },
  {
    id: 125,
    name: "ASTRA CHEMICALS TRADING",
    companyName: "ASTRA CHEM FZE",
    unit: "4TH-12",
    balance: 51200.00,
    status: "active",
    phone: "+971 4 222 6677",
    email: "finance@astrachem.ae",
    leaseStart: "2023-09-01",
    leaseEnd: "2026-08-31",
    createdAt: "2023-09-01T08:30:00Z",
    updatedAt: now,
  }
];

// Mock Hub Data Generator for any tenant
export function getMockHubData(id: number): HubData {
  const tenant = MOCK_REVIEWER_TENANTS.find(t => t.id === id) ?? MOCK_REVIEWER_TENANTS[0];
  const isNegative = tenant.balance < 0;
  const absBal = Math.abs(tenant.balance);

  // Generate realistic multi-row history per tenant
  const rentInvAmount = 120000.00;
  const serviceChargeInvAmount = 15000.00;
  const depositInvAmount = 20000.00;
  const totalInvoiced = rentInvAmount + serviceChargeInvAmount + depositInvAmount; // 155000.00

  // Calculate receipts to match tenant.balance exactly
  const totalReceived = totalInvoiced - tenant.balance;
  const firstInstalment = Math.round(totalReceived * 0.5 * 100) / 100;
  const secondInstalment = Math.round((totalReceived - firstInstalment) * 100) / 100;

  return {
    header: {
      display_name: tenant.name,
      customer_code: `LEG-CUST-000${tenant.id}`,
      current_balance: tenant.balance,
      status: tenant.status,
    },
    summary: {
      invoice_total: totalInvoiced,
      receipt_total: totalReceived,
      running_balance: tenant.balance,
      outstanding_amount: Math.max(0, tenant.balance),
      active_lease_count: 1,
      unit_count: 1,
      next_expiry_date: tenant.leaseEnd,
    },
    transactions: [
      { id: tenant.id * 10 + 1, number: `TXN-${tenant.id}-01`, date: tenant.leaseStart, amount: rentInvAmount, status: "posted", type: "Invoice", reference: `INV-${tenant.id}-001` },
      { id: tenant.id * 10 + 2, number: `TXN-${tenant.id}-02`, date: tenant.leaseStart, amount: serviceChargeInvAmount, status: "posted", type: "Invoice", reference: `INV-${tenant.id}-002` },
      { id: tenant.id * 10 + 3, number: `TXN-${tenant.id}-03`, date: tenant.leaseStart, amount: depositInvAmount, status: "posted", type: "Invoice", reference: `INV-${tenant.id}-003` },
      { id: tenant.id * 10 + 4, number: `TXN-${tenant.id}-04`, date: tenant.leaseStart, amount: -firstInstalment, status: "posted", type: "Receipt", reference: `REC-${tenant.id}-001` },
      { id: tenant.id * 10 + 5, number: `TXN-${tenant.id}-05`, date: now, amount: -secondInstalment, status: "posted", type: "Receipt", reference: `REC-${tenant.id}-002` },
      ...(isNegative ? [
        { id: tenant.id * 10 + 6, number: `TXN-${tenant.id}-06`, date: now, amount: -absBal, status: "posted", type: "Credit Memo", reference: `CM-${tenant.id}-001` }
      ] : [])
    ],
    invoices: [
      { id: tenant.id * 100 + 1, invoice_no: `INV-${tenant.id}-001`, invoice_date: tenant.leaseStart, total_amount: rentInvAmount, status: tenant.balance > 0 ? "partial" : "paid", invoice_type: "Annual Base Rent" },
      { id: tenant.id * 100 + 2, invoice_no: `INV-${tenant.id}-002`, invoice_date: tenant.leaseStart, total_amount: serviceChargeInvAmount, status: "paid", invoice_type: "Annual Service Charge" },
      { id: tenant.id * 100 + 3, invoice_no: `INV-${tenant.id}-003`, invoice_date: tenant.leaseStart, total_amount: depositInvAmount, status: "paid", invoice_type: "Security Deposit" },
      { id: tenant.id * 100 + 4, invoice_no: `INV-${tenant.id}-004`, invoice_date: now, total_amount: 3500.00, status: "paid", invoice_type: "Parking Space Rental" }
    ],
    receipts: [
      { id: tenant.id * 100 + 10, receipt_no: `REC-${tenant.id}-001`, receipt_date: tenant.leaseStart, amount: firstInstalment, status: "posted", payment_method: "Cheque" },
      { id: tenant.id * 100 + 11, receipt_no: `REC-${tenant.id}-002`, receipt_date: now, amount: secondInstalment, status: "posted", payment_method: "Bank Transfer" },
      { id: tenant.id * 100 + 12, receipt_no: `REC-${tenant.id}-003`, receipt_date: tenant.leaseStart, amount: depositInvAmount, status: "posted", payment_method: "Bank Transfer" },
      { id: tenant.id * 100 + 13, receipt_no: `REC-${tenant.id}-004`, receipt_date: now, amount: 3500.00, status: "posted", payment_method: "Cash" }
    ],
    credit_memos: [
      { id: tenant.id * 100 + 20, memo_no: `CM-${tenant.id}-001`, date: now, amount: isNegative ? absBal : 2500.00, reason: isNegative ? "Security Deposit Refund Adjustment" : "AC Maintenance Allowance Credit" },
      { id: tenant.id * 100 + 21, memo_no: `CM-${tenant.id}-002`, date: tenant.leaseStart, amount: 1500.00, reason: "Early Sign-On Lease Discount" }
    ],
    documents: [
      { id: tenant.id * 1000 + 1, label: `Tenancy_Contract_${tenant.unit.replace("-", "")}.pdf`, date: tenant.leaseStart },
      { id: tenant.id * 1000 + 2, label: `Trade_License_2026.pdf`, date: "2025-12-15" },
      { id: tenant.id * 1000 + 3, label: `Emirates_ID_Copy.pdf`, date: tenant.leaseStart },
      { id: tenant.id * 1000 + 4, label: `Bank_Deposit_Slip_Receipt.pdf`, date: now }
    ],
    contacts: [
      { id: tenant.id * 10000 + 1, contact_name: "John Doe", designation: "General Manager", email: tenant.email ?? "info@company.com", mobile: tenant.phone ?? "+971 50 000 0000", is_primary: true, is_active: true },
      { id: tenant.id * 10000 + 2, contact_name: "Sarah Jenkins", designation: "Finance Executive", email: `finance@${(tenant.email ?? "info@company.com").split("@")[1] ?? "company.com"}`, mobile: "+971 50 999 1122", is_primary: false, is_active: true },
      { id: tenant.id * 10000 + 3, contact_name: "Michael Chen", designation: "Operations Lead", email: `ops@${(tenant.email ?? "info@company.com").split("@")[1] ?? "company.com"}`, mobile: "+971 52 444 8833", is_primary: false, is_active: true }
    ],
    active_leases: [
      { id: tenant.id * 100000 + 1, lease_no: `LEASE-${tenant.unit.replace("-", "")}`, start_date: tenant.leaseStart, end_date: tenant.leaseEnd }
    ],
    units: [
      { unit: { id: tenant.id + 5000, unit_name: tenant.unit } }
    ]
  };
}

// 6 Diverse Mock Bank Accounts
export const MOCK_BANK_ACCOUNTS = [
  { id: 201, bank_name: "Emirates NBD - Main Operating", account_name: "PM System Primary Operating A/C", account_no: "XXXXX1234", branch_name: "Downtown Dubai", current_balance: 1452200.50, currency: "AED", is_active: true },
  { id: 202, bank_name: "ADCB - Corporate Collections", account_name: "Rent Collections Escrow", account_no: "XXXXX5678", branch_name: "Al Jubail", current_balance: 842150.00, currency: "AED", is_active: true },
  { id: 203, bank_name: "FAB - Service Charge Escrow", account_name: "Building Operations & Service Fund", account_no: "XXXXX9988", branch_name: "Business Bay", current_balance: 312400.00, currency: "AED", is_active: true },
  { id: 204, bank_name: "Mashreq Bank Cash Vault", account_name: "On-Site Office Cash", account_no: "CASH-OFFICE-01", branch_name: "Main Branch", current_balance: 45800.00, currency: "AED", is_active: true },
  { id: 205, bank_name: "HSBC - Operations Reserve", account_name: "Capital Maintenance Reserve", account_no: "XXXXX4433", branch_name: "DIFC Branch", current_balance: 612900.00, currency: "AED", is_active: true },
  { id: 206, bank_name: "RAK Bank - Overdraft Facility", account_name: "Emergency Credit Facility", account_no: "XXXXX7711", branch_name: "RAK City", current_balance: -12500.00, currency: "AED", is_active: true }
];

// Mock Bank Account Detail with Movement History
export function getMockAccountDetail(id: number) {
  const account = MOCK_BANK_ACCOUNTS.find(a => a.id === id) ?? MOCK_BANK_ACCOUNTS[0];
  return {
    ...account,
    transactions: [
      { id: 301, date: now, reference: "REC-9921", description: "Rent Receipt - Unit 5TH-12 (Nexus Global)", amount: 85000.00, status: "posted", number: "TXN-901" },
      { id: 302, date: now, reference: "REC-9922", description: "Service Charge Receipt - Unit GF-02 (Velocity Motors)", amount: 45210.50, status: "posted", number: "TXN-902" },
      { id: 303, date: now, reference: "EXP-8811", description: "HVAC Maintenance Payment - AirCool LLC", amount: -18500.00, status: "posted", number: "TXN-903" },
      { id: 304, date: now, reference: "EXP-8812", description: "DEWA Elevator Electricity Utility Bill", amount: -12400.00, status: "posted", number: "TXN-904" },
      { id: 305, date: now, reference: "REC-9923", description: "Rent Receipt - Unit 1ST-01 (Hyperion Medical)", amount: 29300.00, status: "posted", number: "TXN-905" },
      { id: 306, date: now, reference: "EXP-8813", description: "Security Guard Payroll - GuardForce UAE", amount: -15000.00, status: "posted", number: "TXN-906" }
    ],
    transfers: [
      { id: 401, date: now, transfer_no: "TRF-2026-001", remarks: "Internal Liquidity Transfer to Main Operating", amount: 50000.00, from_bank_account_id: 202, to: "Emirates NBD - Main Operating", from: account.bank_name, status: "posted" },
      { id: 402, date: now, transfer_no: "TRF-2026-002", remarks: "Quarterly Reserve Deposit", amount: 25000.00, from_bank_account_id: 201, to: "HSBC - Operations Reserve", from: account.bank_name, status: "posted" }
    ]
  };
}

// Mock Daily Reports Data
export function getMockDailyReport(date: string) {
  const reportDate = date || now;
  return {
    summary: {
      invoice_amount: 348500.00,
      invoice_count: 12,
      receipt_amount: 279510.50,
      receipt_count: 8,
      expense_amount: 45900.00,
      expense_count: 3,
      net_collection: 233610.50,
      outstanding_amount: 68989.32
    },
    cash_bank_balances: {
      rows: [
        { sl: 1, type: "Emirates NBD - Main Operating", opening: 1383390.00, closing: 1452200.50 },
        { sl: 2, type: "ADCB - Corporate Collections", opening: 792150.00, closing: 842150.00 },
        { sl: 3, type: "FAB - Service Charge Escrow", opening: 312400.00, closing: 312400.00 },
        { sl: 4, type: "Mashreq Bank Cash Vault", opening: 45800.00, closing: 45800.00 },
        { sl: 5, type: "HSBC - Operations Reserve", opening: 587900.00, closing: 612900.00 },
        { sl: 6, type: "RAK Bank - Overdraft Facility", opening: -12500.00, closing: -12500.00 }
      ],
      totals: {
        opening: 3109140.00,
        closing: 3252950.50
      }
    },
    receipt_rows: [
      { id: 201, unit_name: "5TH-12", date: reportDate, number: "REC-9921", party: "NEXUS GLOBAL TECHNOLOGIES", customer: "NEXUS GLOBAL TECHNOLOGIES", lease: "LEASE-5TH12", report_type: "Rent", method: "Cheque", description: "Quarterly Rent Collection", amount: 85000.00, status: "posted" },
      { id: 202, unit_name: "GF-02", date: reportDate, number: "REC-9922", party: "VELOCITY MOTORS TRADING", customer: "VELOCITY MOTORS TRADING", lease: "LEASE-GF02", report_type: "Service Charge", method: "Bank Transfer", description: "Annual Service Charge", amount: 45210.50, status: "posted" },
      { id: 203, unit_name: "1ST-01", date: reportDate, number: "REC-9923", party: "HYPERION MEDICAL CENTER", customer: "HYPERION MEDICAL CENTER", lease: "LEASE-1ST01", report_type: "Rent", method: "Bank Transfer", description: "Monthly Rent Collection", amount: 29300.00, status: "posted" },
      { id: 204, unit_name: "6TH-05", date: reportDate, number: "REC-9924", party: "SOLARIS CLEAN ENERGY", customer: "SOLARIS CLEAN ENERGY", lease: "LEASE-6TH05", report_type: "Rent", method: "Cheque", description: "Advance Rent Payment", amount: 54000.00, status: "posted" },
      { id: 205, unit_name: "2ND-08", date: reportDate, number: "REC-9925", party: "BLUE HORIZON REAL ESTATE", customer: "BLUE HORIZON REAL ESTATE", lease: "LEASE-2ND08", report_type: "Others", method: "Cash", description: "Utility Re-billing Collection", amount: 8900.00, status: "posted" },
      { id: 206, unit_name: "GF-05", date: reportDate, number: "REC-9926", party: "STARLIGHT RETAILERS LTD", customer: "STARLIGHT RETAILERS LTD", lease: "LEASE-GF05", report_type: "Rent", method: "Cheque", description: "Monthly Rent Collection", amount: 12450.00, status: "posted" },
      { id: 207, unit_name: "7TH-01", date: reportDate, number: "REC-9927", party: "TITAN ENGINEERING", customer: "TITAN ENGINEERING", lease: "LEASE-7TH01", report_type: "Rent", method: "Bank Transfer", description: "Partial Lease Settlement", amount: 35000.00, status: "posted" },
      { id: 208, unit_name: "2ND-03", date: reportDate, number: "REC-9928", party: "ATLAS SUPPLY CHAIN", customer: "ATLAS SUPPLY CHAIN", lease: "LEASE-2ND03", report_type: "Service Charge", method: "Cash", description: "Service Charge Settlement", amount: 9650.00, status: "posted" }
    ],
    expense_rows: [
      { id: 301, date: reportDate, number: "EXP-8811", party: "AirCool HVAC Maintenance LLC", description: "Chiller System Bi-Monthly Overhaul", amount: 18500.00, status: "posted" },
      { id: 302, date: reportDate, number: "EXP-8812", description: "DEWA Elevator & Hallway Electricity", party: "Dubai Electricity & Water Authority", amount: 12400.00, status: "posted" },
      { id: 303, date: reportDate, number: "EXP-8813", description: "On-Site Security Guards Monthly Payroll", party: "GuardForce Security UAE", amount: 15000.00, status: "posted" }
    ]
  };
}
