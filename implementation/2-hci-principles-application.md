# 2 — HCI Principles Application

> Rubric criterion: *Effective application of design rules (e.g., Shneiderman/Norman) and consideration of human constraints (memory, perception).* **(5 marks)**

---

## 2.1 Norman's 7 Principles (Chapter 7 / Chapter 3)

Norman's model (Chapter 3) describes interaction as a cycle: the user forms a goal, executes actions, perceives the result, and evaluates whether the goal was met. Two "gulfs" break this cycle — the Gulf of Execution (user can't figure out what to do) and the Gulf of Evaluation (user can't tell what happened).

### How Each Principle Applies to This App

---

**Principle 1 — Use both knowledge in the world and knowledge in the head**

Knowledge in the world means the interface itself tells you what to do — you should not have to remember.

- The item feed shows cards with image, title, category badge, and date — all visible at a glance without recalling any state.
- Category dropdowns in `ReportItemModal` list all valid categories explicitly — no need to type or remember codes.
- The "Claim Item" button is only shown on items that have `isClaimed = false` — the world tells you whether claiming is possible.

**What to check in code:** `ItemCard.tsx` — confirm that status badges are always visible and that the Claim button is conditionally rendered based on `item.isClaimed`.

---

**Principle 2 — Simplify the structure of tasks**

Complex tasks should be broken into steps; eliminate unnecessary steps.

- Reporting an item is a single modal with one Submit action — not a multi-page wizard.
- Image upload is optional — the task is not blocked by it.
- Auth state is preserved via JWT stored in context (`useAuth`) — the user does not re-login every session.

**Improvement opportunity:** The `ReportItemModal` form currently has 8+ fields on one screen. Consider grouping into two visual sections: *"What was lost?"* (title, category, description, image) and *"Where and when?"* (location, date, contact). This reduces perceived complexity without adding steps.

---

**Principle 3 — Make things visible: bridge the gulfs of Execution and Evaluation**

- Every form submission should produce immediate feedback (toast notification via `sonner`).
- The current item status (`active`, `returned`, `pending`) must be visually present on each card — not hidden inside the details modal.
- Admin actions (verify, update status) must change the UI immediately on success — not require a page refresh.

**What to check:** `AdminDashboard.tsx` — after a PATCH call, does the item list update in state, or does the user have to reload?

---

**Principle 4 — Get the mappings right**

The relationship between controls and their effects must be natural.

- "Lost" vs "Found" type selector: use radio buttons, not a dropdown — two mutually exclusive choices map better to a toggle/radio group than a hidden list.
- Date fields: use a calendar picker (shadcn `Calendar` component is already available) — maps to how people think about dates.
- Image upload: a drag-and-drop zone or a large camera icon maps more naturally to "add a photo" than a plain text button.

---

**Principle 5 — Exploit constraints**

Constraints prevent errors before they happen.

- Category must be selected from a fixed list — free text here would cause inconsistent filtering.
- Date occurred cannot be in the future — add `max={today}` to the date input.
- The claim form is only accessible to logged-in users (auth middleware in `backend/middleware/auth.js`) — unauthenticated claims are structurally impossible.

---

**Principle 6 — Design for error**

Users will make mistakes (Ch1: slips vs. mistakes).

- *Slips* (right intention, wrong action): Prevent by using clear labels and logical tab order in all forms.
- *Mistakes* (wrong understanding): Prevent by showing inline validation before submit — e.g., "Title must be at least 3 characters."
- Provide undo-equivalent: Admin should be able to un-verify a claim (change `isClaimed` back to `false`) in case of mistake.
- All destructive actions (delete, mark returned) should require a confirmation dialog (`AlertDialog` component is available in the UI library).

---

**Principle 7 — When all else fails, standardise**

Use platform and cultural conventions.

- Submit buttons go bottom-right of modals (standard form convention).
- Cancel/close is top-right X (window standard from Ch3 WIMP section).
- Error messages in red, success in green — but never colour alone (account for colour blindness, Ch1).
- Date format: use the user's locale, not hard-coded MM/DD/YYYY.

---

## 2.2 Shneiderman's 8 Golden Rules (Chapter 7)

---

**Rule 1 — Strive for consistency**

- All modals use the same header structure: title, description, form, action buttons.
- All item cards display information in the same order: image → title → category → date → location.
- Form labels use consistent capitalisation and punctuation throughout.

**Check:** Compare `ReportItemModal.tsx` and `ClaimItemModal.tsx` — do they share the same button styling and label patterns?

---

**Rule 2 — Enable frequent users to use shortcuts**

Admin users visit the dashboard repeatedly. Provide:
- Keyboard shortcut `V` to verify the focused claim (or document existing shortcuts clearly).
- Bulk-approve checkboxes for multiple claims.
- Filter persistence — remember the last-used category filter across sessions.

---

**Rule 3 — Offer informative feedback**

Every state-changing action needs visible feedback:

| Action | Required Feedback |
|--------|------------------|
| Submit report | Toast: "Item reported successfully" |
| Submit claim | Toast: "Claim submitted — admin will review" |
| Admin verifies claim | Toast: "Claim approved" + item card updates |
| Upload image | Progress indicator while uploading to `/api/upload/images` |
| Login fails | Inline error: "Invalid email or password" |

---

**Rule 4 — Design dialogs to yield closure**

Every multi-step process must have a clear end state.

- After submitting a report: modal closes, item appears on the feed, toast confirms.
- After claiming: modal closes, button changes to "Claimed" or disappears.
- After admin verification: item moves out of the pending list.

---

**Rule 5 — Offer error prevention and simple error handling**

- Required fields marked with `*` before the user even starts.
- Inline validation on blur (not only on submit) — user sees the error as soon as they leave a field.
- If image upload fails (network error from `POST /api/upload/images`), show the error inline inside the modal, not as a page-level crash.

---

**Rule 6 — Permit easy reversal of actions**

- Submitted reports can be deleted by the reporting user (add delete option to item owner's view).
- Admin can change item status back if wrongly marked.
- Form data should not be cleared if a modal is accidentally closed — consider `localStorage` draft saving for long forms.

---

**Rule 7 — Support internal locus of control**

Users must feel they are in control, not the system.

- Avoid modal dialogs that block the entire screen unnecessarily.
- The item feed should be browsable without being logged in — forcing login to even view items removes user control and may deter use.
- Notification centre (`NotificationCenter.tsx`) should let users dismiss or mark-read individual notifications, not only clear all.

---

**Rule 8 — Reduce short-term memory load (Ch1: STM = 7 ± 2 chunks)**

STM can hold only ~7 items at once and decays in ~200ms without rehearsal.

- Do not ask the user to remember information from one screen to use on another.
- Item detail modal shows all relevant information inline — the user should not have to "remember" what they read on the card.
- Search/filter state should remain visible while browsing results — show active filters as chips/badges above the list.
- Do not paginate into more than ~7 items per visible screen section before grouping.

---

## 2.3 Human Constraints Applied (Chapter 1)

| Constraint | Chapter 1 Concept | Applied Design Decision |
|------------|-------------------|------------------------|
| Visual acuity | Colour, contrast, font size | Minimum 14px body text; WCAG AA contrast on all text |
| Colour blindness | 8% males, 1% females | Status badges use icon + colour, never colour alone |
| STM capacity | 7 ± 2 chunks | Max 7 form fields visible at once; group related fields |
| STM decay (200ms) | Sensory/working memory | System response to any action < 200ms perceived |
| Reading | Saccades, fixations, word shape | Left-aligned text; sentence case labels (not ALL CAPS) |
| Negative affect | Emotion narrows thinking | Reassuring, calm copy — never panic-inducing error messages |
| Fitts' Law | `Mt = a + b log2(D/S + 1)` | Primary CTA buttons are large and close to the user's interaction point |
| Reaction time | Visual ~200ms, auditory ~150ms | All feedback within one animation frame; never silent actions |

---

## 2.4 Summary Checklist for Presentation

- [ ] Named and referenced Norman's model with a concrete example from the app
- [ ] Named Shneiderman's 8 Golden Rules and applied at least 3 specifically
- [ ] Linked at least two design decisions back to Chapter 1 human constraints (memory, perception, emotion)
- [ ] Identified at least one existing gap in the current implementation and proposed a fix
