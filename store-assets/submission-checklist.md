# Kader Tower — App Store Submission Checklist

Use this file to track the submission process step by step.

---

## ✅ Pre-Built Fixes (Done by Agent)

- [x] App renamed to **Kader Tower** in `app.json`
- [x] Bundle ID changed to `com.kadertower.app`
- [x] Android package changed to `com.kadertower.app`
- [x] App icon, splash screen, and adaptive icon regenerated
- [x] iOS Privacy Manifest (`NSPrivacyAccessedAPITypes`) configured
- [x] `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` added
- [x] `ITSAppUsesNonExemptEncryption: false` declared
- [x] Privacy Policy link added to login screen (opens https://dev.kadertower.com/privacy-policy)
- [x] `privacyPolicyUrl` added to `app.json` extra section
- [x] `eas.json` submit configurations set up for iOS and Android
- [x] Store listing metadata created (`store-assets/store-listing.json`)
- [x] Reviewer notes template created (`store-assets/reviewer-notes.md`)
- [x] Today's date used as default in Daily Reports (not hardcoded)
- [x] Tablet/iPad split layout implemented

---

## 🔲 Manual Steps Required (You Must Do These)

### Developer Account Setup
- [ ] Enroll / confirm Apple Developer Program membership ($99/yr) as **Organization**
  - URL: https://developer.apple.com/programs/
  - Required: D-U-N-S number for your organization
- [ ] Confirm Google Play Console account ($25 one-time fee)
  - URL: https://play.google.com/console

### Apple App Store Connect
- [ ] Create a new **App Record** in App Store Connect
  - Name: `Kader Tower`
  - Bundle ID: `com.kadertower.app`
  - SKU: `com.kadertower.app`
  - Primary Language: English
- [ ] Fill in App Information:
  - Category: **Business**
  - Secondary Category: **Productivity**
  - Content Rating: Complete questionnaire (expect **4+**)
  - Privacy Policy URL: `https://dev.kadertower.com/privacy-policy`
  - Support URL: `https://dev.kadertower.com`
- [ ] In `eas.json`, replace:
  - `REPLACE_WITH_TEAM_ID` → Your Apple Team ID (from developer.apple.com)
  - `REPLACE_WITH_APP_STORE_CONNECT_APP_ID` → Numeric App ID from App Store Connect
  - `REPLACE_WITH_APPLE_ID_EMAIL` → Your Apple ID email
- [ ] Fill store description using `store-assets/store-listing.json`
- [ ] Upload screenshots (iPhone 6.7" required, iPad 12.9" recommended)
- [ ] Fill in "Notes for Reviewer" from `store-assets/reviewer-notes.md`
- [ ] Set: **Distribution Method → Custom App** (for private B2B distribution)

### Google Play Console
- [ ] Create a new **App** in Google Play Console
  - App name: `Kader Tower`
  - Default language: English (US)
  - App or Game: App
  - Free or Paid: Free
- [ ] Configure Google Service Account for EAS Submit
  - Go to: Play Console → Setup → API Access → Link to Google Cloud Project
  - Download service account JSON → save as `./service-account.json` (gitignored)
- [ ] Fill in Store Listing from `store-assets/store-listing.json`
- [ ] Set Privacy Policy URL: `https://dev.kadertower.com/privacy-policy`
- [ ] Content Rating questionnaire (expect: **Everyone**)
- [ ] Target Audience: Adults (18+) — internal staff only
- [ ] Provide App Access instructions (restricted login app)
- [ ] Upload screenshots (at least 2 phone screenshots + Feature Graphic 1024×500)
- [ ] Start **Closed Testing** track with yourself as tester (required before production)
  - Google requires 14 days & 20 testers for new accounts

### Build & Submit
- [ ] Run: `eas build --platform all --profile production`
- [ ] Verify builds complete successfully in EAS dashboard
- [ ] For iOS: `eas submit --platform ios --profile production`
- [ ] For Android: `eas submit --platform android --profile production`
  - Or upload the `.aab` file manually from EAS dashboard

---

## 📋 Store Description (Copy-Paste Ready)

### Short Description (≤80 chars for Google Play)
```
Manage tenants, finances, and daily reports for Kader Tower.
```

### Full Description
See `store-assets/store-listing.json` → `full_description` field.

### Keywords (Apple only, ≤100 chars total)
```
property,tenant,management,real estate,finance,invoice,business,rent,reports
```

---

## 🔑 Test Credentials (for Reviewer Notes)
- **Email:** `reviewer@kadertower.com`
- **Password:** `Review@Kader2025`

> ⚠️ Create this account on your backend BEFORE submission and populate it with sample data.

---

## 📦 Build Commands
```bash
# Production build for both platforms
eas build --platform all --profile production

# iOS only
eas build --platform ios --profile production

# Android only (.aab)
eas build --platform android --profile production

# Submit after build
eas submit --platform ios
eas submit --platform android
```