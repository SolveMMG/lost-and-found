# 1 — User & Task Analysis

> Rubric criterion: *Evidence of persona development and detailed scenarios. Clear identification of user goals and task decomposition (HTA).* **(5 marks)**

---

## 1.1 Who Uses the USIU Lost and Found App?

From **Chapter 1 (The Human)** the course establishes that every person is different — varying in memory capacity, perception, motor ability, and emotional state. That directly shapes who we design for.

Three distinct user types exist in this system:

---

### Persona 1 — The Student Reporter

**Name:** Amara Osei, 20
**Role:** Second-year student, Computer Science
**Tech comfort:** High — uses smartphone and laptop daily
**Goal:** Report a lost item and get it back quickly
**Frustrations:** Doesn't want to visit the lost-property office in person; worried no one will see her report
**Constraints (Ch1):**
- Short-term memory limit of 7 ± 2 chunks means she should not have to remember form field order or validation rules
- Stress from losing something narrows thinking (negative affect → narrow focus, per Norman's emotion theory) — the form must be dead simple

---

### Persona 2 — The Finder

**Name:** Daniel Kimani, 22
**Role:** Third-year student, Business
**Tech comfort:** Medium
**Goal:** Hand in a found item and notify the owner without hassle
**Frustrations:** Long processes; unclear next steps after submitting
**Constraints (Ch1):**
- Reaction time and attention are limited — confirmation feedback must be immediate (< 200 ms visual response)
- Relies on recognition over recall — every action must be labelled clearly, not rely on memory

---

### Persona 3 — The Admin / Security Staff

**Name:** Grace Mwangi, 45
**Role:** Campus security & lost-property clerk
**Tech comfort:** Low-medium — uses basic office tools
**Goal:** Verify claims, match lost items to found items, mark items as resolved
**Frustrations:** Too many steps to approve a claim; hard to tell what still needs action
**Constraints (Ch1):**
- Older users experience changing short-term memory — reduce cognitive load by chunking related information visually
- Possible colour-vision limitations (8% males, 1% females colour-blind) — never use colour as the only status indicator

---

## 1.2 User Goals

| User | Primary Goal | Secondary Goal |
|------|-------------|----------------|
| Student Reporter | Submit a lost item report | Track its status |
| Finder | Report a found item | Remain anonymous if preferred |
| Admin | Review and resolve reports | Manage overall item list |

---

## 1.3 Hierarchical Task Analysis (HTA)

HTA decomposes goals into sub-tasks and plans. Source: **Chapter 15 (Task Analysis)**.

### Task: Report a Lost Item (Student)

```
0. Report a lost item
  1. Open the app
  2. Authenticate
    2.1 Click "Sign In"
    2.2 Enter email and password
    2.3 Submit login form
  3. Open Report Item form
    3.1 Click "Report Item" button on homepage
  4. Fill in item details
    4.1 Enter title
    4.2 Select category (dropdown)
    4.3 Select type = "Lost"
    4.4 Enter location last seen
    4.5 Set date occurred
    4.6 Add description
    4.7 Upload image (optional)
    4.8 Enter contact info
  5. Submit form
    5.1 Click "Submit"
    5.2 Receive confirmation toast/notification
  6. Monitor status via item card on home feed

Plan 0: Do 1–2, then 3, then 4 (steps in any order within 4), then 5, then 6
Plan 4: Steps 4.1–4.5 are required; 4.6–4.8 are optional but improve match rate
```

### Task: Claim a Found Item (Student)

```
0. Claim a found item
  1. Browse or search the item feed
    1.1 Scroll homepage
    1.2 Use search/filter (category, date, keyword)
  2. Identify matching item
    2.1 Click item card → open ItemDetailsModal
    2.2 Review image, description, location
  3. Submit a claim
    3.1 Click "Claim Item"
    3.2 Fill ClaimItemModal (name, contact, proof description)
    3.3 Submit claim
  4. Await admin verification

Plan 0: Do 1 → 2 → 3 → 4 in sequence
Plan 1: Repeat 1.1–1.2 until matching item found
```

### Task: Admin — Verify a Claim

```
0. Verify and resolve a claim
  1. Open Admin Dashboard
  2. Review pending claims list
    2.1 Read claimant name, contact, description
    2.2 Cross-reference with item details
  3. Approve or reject claim
    3.1 PATCH /api/items/:id/verify (approve)
    3.2 or PATCH /api/items/:id/status (reject/update)
  4. Item marked isClaimed = true; claimant notified
```

---

## 1.4 Scenarios

### Scenario A — Amara Loses Her Student ID

> Amara rushes out of the library after a long study session. At the gate she realises her student ID is missing. She opens the Lost & Found app on her phone. She is already logged in. She taps "Report Item", selects category "Documents", sets type to "Lost", types "USIU Student ID Card" in the title, picks the library as the location, and sets today's date. She adds a short description and taps Submit. A green toast appears: *"Your report has been submitted."* She closes the app and heads to class, knowing that if someone finds her ID and logs it, she will see it on the feed.

**Design implication:** The entire flow must complete in under 2 minutes. The form must not require more than 7 distinct inputs (STM limit, Ch1).

---

### Scenario B — Daniel Finds a Wallet

> Daniel finds a brown leather wallet near the cafeteria. He opens the app and taps "Report Item". He selects "Found", fills the form, and uploads a photo from his phone camera. He submits and leaves the wallet with security. Later the rightful owner logs in, searches "wallet", finds the listing, clicks "Claim Item", and fills in the claim form describing the wallet's contents as proof.

**Design implication:** The image upload flow must be seamless — one tap, not buried in settings. The `ReportItemModal` should make upload a primary action, not a secondary one.

---

### Scenario C — Grace Processes a Backlog

> On Monday morning Grace opens the Admin Dashboard. She sees 5 unresolved claims. She clicks each one, reads the claimant details, checks the item description, and clicks "Verify" on 3 of them. The items disappear from the pending list. She marks one item as "Returned" and closes her browser.

**Design implication:** The admin dashboard must show only actionable items by default. Completed items should be hidden or collapsed. Every action must have clear visual feedback.

---

## 1.5 Mapping to App Code

| HTA Step | Component / Route |
|----------|-------------------|
| Report item form | `frontend/src/components/items/ReportItemModal.tsx` |
| Claim item form | `frontend/src/components/items/ClaimItemModal.tsx` |
| Item details view | `frontend/src/components/items/ItemDetailsModal.tsx` |
| Admin verify/status | `frontend/src/components/admin/AdminDashboard.tsx` |
| Item list / search | `frontend/src/pages/Index.tsx` + `useItems` hook |
| Authentication | `frontend/src/components/auth/AuthModal.tsx` |
| Backend endpoints | `backend/routes/items.js`, `backend/routes/auth.js` |
