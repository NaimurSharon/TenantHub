# Kader Tower — App Store Reviewer Notes

## App Overview
Kader Tower is a **private, internal B2B property management application** for authorized staff at Kader Tower building operations. The app requires login credentials that are provisioned by the system administrator — there is no self-registration flow.

---

## Access Instructions for Reviewers

### Demo Login Credentials
> **Important:** Please use the following dedicated reviewer account. This account has been pre-populated with sample data covering all app features.

| Field    | Value                          |
|----------|-------------------------------|
| Email    | `reviewer@kadertower.com`      |
| Password | `Review@Kader2025`             |

> ⚠️ **Note:** If the above credentials do not work, please contact: support@kadertower.com — we will respond within 24 hours.

---

## 📱 Reviewer Sandbox Mode & Walkthrough

To ensure security and protect real tenant financial records, logging in with the reviewer credentials puts the app into a secure **client-side sandbox mode** featuring fully interactive simulated records:

### 1. Tenants (Tap "Tenants" Card)
- **Sample Tenants:**
  - **`B.D. TRADING (F.S JOHER)`** (ID: 101) — **Outstanding Balance: `$ 17,888.82`**
  - **`AL SHAMSI FOODS`** (ID: 102) — **Credit/Prepayment Balance: `$ (4,500.00)`** (Styled in Destructive Red and parentheses format)
  - **`VERTEX SOFTWARE SYSTEMS`** (ID: 103) — **Balance: `$ 0.00`**
- **Detail Screens (Select `B.D. TRADING`):**
  - **Invoices Tab:** Displays invoice `INV-2026-001` for `$ 480,504.82`.
  - **Receipts Tab:** Displays receipt `REC-2026-001` for `$ 462,616.00`.
  - **Transactions Tab:** Displays both invoice debit and receipt credit lines.
  - **Documents Tab:** Contains mock contract and trade license PDFs.
  - **Contacts Tab:** Manage/edit simulated contacts like `John Doe`.

### 2. Financial Hub (Tap "Financial Hub" Card)
- **Interactive Bank Accounts:**
  - **`Emirates NBD - Main`** — Current Balance: `$ 1,452,200.50` (Favorable green)
  - **`ADCB - Operating`** — Current Balance: **`$ (12,500.00)`** (Unfavorable red + parentheses accounting format)
  - **`Mashreq Cash`** — Current Balance: `$ 4,500.00`
- **Movements Ledger:** Tap any account to view the paginated list of transactions, such as rent collections and maintenance payments.

### 3. Daily Reports (Tap "Daily Reports" Card)
- Displays cash flow summaries for the selected date.
- **Tab Layouts:**
  - **Balances:** Closing and opening balances for NBD, ADCB, and Mashreq.
  - **Collections:** Subdivided collections (e.g., Residential and Commercial Rent).
  - **Breakdown:** Aggregate head metrics (Service Charges, Utility Recoveries).
- **Interactive Calendar:** Tap the date text or calendar icon to toggle the spring-animated calendar overlay and select any date to load reports.

---

## 🔒 Security & Privacy Manifests

- **No Live Financial Exposure:** The sandbox mock data fully covers all app features. No live landlord or tenant banking data is transmitted or displayed.
- **Privacy Declarations:** Built-in iOS privacy manifest files declare accessed API categories (`UserDefaults`, `FileTimestamp`, `SystemBootTime`, `DiskSpace`) in accordance with Apple's 2025/2026 guidelines.
- **Encryption Declaration:** This app does **not** use custom encryption beyond standard HTTPS. The `ITSAppUsesNonExemptEncryption` key is set to `false` in the app's `Info.plist`.

---

## 📞 Support & Contacts
- **Developer Contact:** support@kadertower.com
- **Support / Marketing Info:** https://dev.kadertower.com
- **Privacy Policy URL:** https://dev.kadertower.com/privacy-policy
- **Intended Audience:** Internal property management staff only
