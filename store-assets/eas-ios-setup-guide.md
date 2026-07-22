# Expo EAS iOS Build & Submission Setup Guide

This guide contains the configuration templates, credentials, and instructions for building and submitting iOS apps using the **Kader Tower Developer Account**. Use this as a blueprint for other mobile projects targeting the same Apple Developer account.

---

## 🔑 Credentials Registry

To reuse this setup, you need the following developer credentials.

### 1. Developer Portal Info
* **Apple ID:** `siscotech.bd@gmail.com`
* **Apple Team ID:** `Y79T3US546`

### 2. App Store Connect API Key
Used by EAS CLI to authenticate submissions with Apple without prompts:
* **Key ID:** `C66592TZ2J`
* **Issuer ID:** `8bd21bbe-62ea-4d17-9769-5c9b92883236`
* **Filename:** `AuthKey_C66592TZ2J.p8`

### 3. Signing Credentials (iOS Distribution Certificate)
* **Certificate Password:** `#128jubilee`
* **Certificate File:** `pmsystem.p12`
* **Provisioning Profile:** `PMSystem.mobileprovision` (Note: Ensure the bundle ID in your new app matches the profile if reusing this exact one, or generate a new profile for a new bundle ID using the same certificate).

---

## ⚙️ Configuration Files

### 1. `eas.json`
Place this in the root of your React Native / Expo project. It configures EAS to build locally using local credentials and sets up automated submission using the App Store Connect API key.

```json
{
  "cli": {
    "version": ">= 20.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "credentialsSource": "local"
    },
    "production-apk": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production-ipa": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "credentialsSource": "local"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "siscotech.bd@gmail.com",
        "appleTeamId": "Y79T3US546",
        "ascAppId": "[NEW_APP_STORE_CONNECT_APP_ID]",
        "ascApiKeyPath": "./AuthKey_C66592TZ2J.p8",
        "ascApiKeyIssuerId": "8bd21bbe-62ea-4d17-9769-5c9b92883236",
        "ascApiKeyId": "C66592TZ2J"
      },
      "android": {
        "track": "internal"
      }
    }
  }
}
```
> ⚠️ **Important:** Replace `[NEW_APP_STORE_CONNECT_APP_ID]` (the `ascAppId` field) with the specific numerical App ID generated on App Store Connect when creating the new app record.

### 2. `credentials.json`
Place this file in the root of your project to tell EAS where to find your signing credentials. **NEVER commit this file to Git.**

```json
{
  "ios": {
    "distributionCertificate": {
      "path": "./pmsystem.p12",
      "password": "#128jubilee"
    },
    "provisioningProfilePath": "./PMSystem.mobileprovision"
  }
}
```

---

## 🛠️ Step-by-Step Setup & Submission Flow

For any new app project, follow these steps to build and submit:

### Step 1: Copy Credential Files to Project Root
Copy the following files into the root of your new project:
1. `AuthKey_C66592TZ2J.p8` (App Store Connect API key)
2. `pmsystem.p12` (Distribution certificate)
3. `PMSystem.mobileprovision` (Provisioning profile matching your new Bundle ID)

### Step 2: Configure Git Ignore
Add these lines to the bottom of your project's `.gitignore` file to prevent committing secrets to repository hosting services:
```text
# EAS credentials & signing files
credentials.json
*.p12
*.mobileprovision
*.p8
```

### Step 3: Run the Production Build
Trigger Expo's build servers to compile your app. EAS will read `credentials.json` and sign the build automatically:
```bash
npx eas build --platform ios --profile production
```

### Step 4: Submit to App Store Connect
Submit the resulting `.ipa` binary directly to App Store Connect using the configured API Key:
```bash
npx eas submit --platform ios --profile production
```
*(Select the latest build when prompted. The submission will complete automatically without asking for Apple ID credentials or passwords).*

---

## 💡 Best Practices for New Projects
1. **Bundle Identifiers:** When registering a new app, make sure to add the bundle identifier (e.g. `com.kadertower.attendance`) in the Apple Developer Portal first.
2. **Provisioning Profiles:** For new apps, generate a new provisioning profile in the Developer Portal using the existing `pmsystem.p12` certificate. Name the profile and link it to the new Bundle ID, download the `.mobileprovision` file, and update the path in `credentials.json`.
3. **App Store App Record:** Create the App Store record in App Store Connect BEFORE running `eas submit`, and replace the `ascAppId` in your `eas.json` with the newly generated App ID.
