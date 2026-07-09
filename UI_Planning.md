
# ARCHITECTURAL BLUEPRINT FOR SYSTEM EXPANSION

## 1. Context & Objective

* **Current State:** The application is tightly coupled to a single domain (**TenantHub**). Upon successful authentication, the user is directly routed into the TenantHub dashboard and its nested page ecosystem.
* **Target State:** Transition the application from a single-tenant domain architecture into a **Multi-Hub Workspace**. The root-level post-authentication screen must now act as a high-fidelity **Hub Router/Selector**.
* **The Hubs:**
1. **TenantHub (Existing):** Retain 100% of its current state, routing, data-fetching, and UI. It must remain completely untouched and functional when selected.
2. **Financial Hub (New):** A brand new domain based on provided UI assets.
3. **Daily Reports (New):** A brand new domain based on provided UI assets.



---

## 2. Core Technical Architecture Requirements

### A. Root Routing & State Management

* **Decouple the Post-Login Flow:** Intercept the post-login routing. Instead of automatically mounting the `TenantHub` root view, mount a new **Hub Selector Screen**.
* **Isolation of Concerns:** Ensure that each Hub operates in its own isolated module/directory structure (e.g., `/features/tenant-hub`, `/features/financial-hub`, `/features/daily-reports`). Do not leak state or styles between them.
* **Back-Navigation Rules:** Inside `Financial Hub` or `Daily Reports`, the "Back" or "Home" navigation should gracefully return the user to the central **Hub Selector Screen**, not log them out.

### B. UI/UX Paradigm: TenantHub as the Global Design System

* **Inherit the Existing UI System:** Do NOT invent a new design language or look for the new hubs. Use the exact same design tokens, color palette, typography scales, layout grids, container rounding, paddings, margins, shadows, and button styles currently used in **TenantHub**.
* **Seamless Consistency:** The Financial Hub and Daily Reports must feel like native extensions of TenantHub, sharing the exact same premium visual identity.

### C. Image Utilization Strategy (Data & Schema Mining)

You will be provided with images of the new user interfaces for the **Financial Hub** and **Daily Reports**. Process these images under these strict directives:

* **UI Layout & Idea Extraction:** Look at the images to understand the layout structure (e.g., cards, lists, tabs, charts) and the underlying user experience intent.
* **Data Type & Schema Mapping:** Analyze the text, numbers, metrics, and labels inside the images to infer the exact data models and TypeScript types/interfaces needed to back these screens.
* **Synthesis:** Recreate the exact structural layout and data requirements seen in the images, but render them completely using the existing **TenantHub styling system and UI components**.

---

## 3. Step-by-Step Execution Plan for the AI

To complete this task in one single, correct approach, execute the following sequence:

* **Step 1 [Analysis]:** Analyze the existing codebase's routing file (e.g., `AppNavigator`, `routes.ts`, or main tab controller) to locate exactly where the user is sent post-login.
* **Step 2 [Refactor Routing]:** Create a new `HubSelectorScreen`. Divert the post-login route to this screen.
* **Step 3 [Preserve TenantHub]:** Wire the "TenantHub" button on the new selector screen to trigger the exact original entry routing logic, ensuring zero regressions.
* **Step 4 [Data Modeling]:** Extract data points from the provided Financial Hub and Daily Reports images. Create the corresponding mock data arrays, objects, and type definitions.
* **Step 5 [UI Synthesis - Financial Hub]:** Build the Financial Hub screen by mapping the extracted data structure onto existing TenantHub-styled UI components.
* **Step 6 [UI Synthesis - Daily Reports]:** Build the Daily Reports screen using the same pattern (Image Data Blueprint + TenantHub Styles).
* **Step 7 [Wiring]:** Connect the respective buttons on the `HubSelectorScreen` to route to these two newly created modules.

---

> ### 🛑 CRITICAL EXECUTION GUARDRAILS FOR THE AI
> 
> 
> * **Do NOT break or rewrite** any existing `TenantHub` components, API calls, or state managers. It is a black box that must remain functional.
> * **Do NOT use placeholder code** or `// TODO` comments for the UI. Translate the provided images into fully realized, production-ready frontend code.
> * **Do NOT deviate from TenantHub's styling.** If TenantHub uses a specific dark mode, neon tone, or font spacing, apply those exact same rules to the new hubs.
> 
> 
