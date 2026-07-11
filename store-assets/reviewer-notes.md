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

## Feature Walkthrough for Reviewers

After logging in, you will see the **Hub Selector** (main landing screen):

### 1. Tenant Hub (Tap "Tenants" card)
- Browse the list of active tenants
- Tap any tenant row to open the **Tenant Detail** screen
- Explore tabs: **Invoices**, **Receipts**, **Transactions**, **Credit Memos**, **Contacts**, **Profile**
- Use the search icon (top right) to search tenants
- Use the toggle to switch between Active / Inactive tenants

### 2. Financial Hub (Tap "Financial Hub" card)
- Select any bank account from the left sidebar list
- Browse transaction movements with pagination (Previous / Next)
- Filter by: All / Debit / Credit using the filter tabs
- Tap the refresh icon to reload data

### 3. Daily Reports (Tap "Daily Reports" card)
- View today's financial summary metrics
- Use left/right arrows to navigate between dates
- Tap the **calendar icon** in the date bar to select any specific date
- Switch between tabs: **Balances**, **Collections**, **Breakdown**

---

## App Network Dependency
This app connects to a live API backend at `https://dev.kadertower.com`. An active internet connection is required to use all features. The reviewer test account is live on this server.

---

## Privacy Policy
https://dev.kadertower.com/payment-terms

---

## Encryption Declaration
This app does **not** use custom encryption beyond standard HTTPS. The `ITSAppUsesNonExemptEncryption` key is set to `false` in the app's `Info.plist`.

---

## Contact
- **Developer Contact:** support@kadertower.com
- **Support URL:** https://dev.kadertower.com
- **App Category:** Business / Productivity
- **Intended Audience:** Internal property management staff only
