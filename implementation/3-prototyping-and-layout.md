# 3 — Prototyping & Layout

> Rubric criterion: *Quality of wireframes OR screens. Logical navigation structure and adherence to screen design principles.* **(5 marks)**

---

## 3.1 Navigation Structure

From **Chapter 5 (Interaction Design Basics)** — navigation design requires knowing:
- Where you are
- What you can do
- Where you are going / what will happen
- Where you've been / what you've done

### Global Navigation Map

```
[Public — not logged in]
  └─ Homepage (Index.tsx)
       ├─ Browse item cards (read-only)
       ├─ Search / filter bar
       └─ Sign In / Register → AuthModal

[Logged in — Student]
  └─ Homepage
       ├─ Browse item cards
       ├─ Click item card → ItemDetailsModal
       │    └─ "Claim Item" → ClaimItemModal
       ├─ "Report Item" button → ReportItemModal
       └─ NotificationCenter (bell icon)

[Logged in — Admin]
  └─ Homepage (same as student)
       └─ "Admin Dashboard" → AdminDashboard
            ├─ Pending claims list
            ├─ Verify / reject claim
            └─ Update item status
```

### Navigation Rules Applied

- **Breadcrumbs** (Ch5): The modal stack makes location clear — Homepage → Item Details → Claim Form. Each modal has a visible back/close action.
- **Avoid deep hierarchies** (Ch5): The app is intentionally flat — max 2 levels deep (Homepage → Modal). No sub-sub-menus.
- **Four golden rules of navigation** (Ch5):
  - *Where you are:* Page title + modal heading always name the current context
  - *What you can do:* Visible buttons for all primary actions; disabled states for unavailable actions
  - *Where you are going:* Hover tooltips on icon buttons; descriptive button labels ("Report Item", not "Submit")
  - *Where you've been:* Claimed items show a "Claimed" badge so the user sees what they already acted on

---

## 3.2 Screen Design Principles (Chapter 5)

### Grouping and Structure

Content that is logically related must be physically grouped.

**ReportItemModal — Recommended Field Groups:**

```
┌─────────────────────────────────────────┐
│  Report a Lost / Found Item             │
├─────────────────────────────────────────┤
│  WHAT IS THE ITEM?                      │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Title *      │  │ Category *       │ │
│  └──────────────┘  └──────────────────┘ │
│  ┌──────────────────────────────────────┐│
│  │ Description                          ││
│  └──────────────────────────────────────┘│
│  [ + Upload Image ]                     │
├─────────────────────────────────────────┤
│  WHERE AND WHEN?                        │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Location *   │  │ Date Occurred *  │ │
│  └──────────────┘  └──────────────────┘ │
│  ┌──────────────────────────────────────┐│
│  │ Contact Info                         ││
│  └──────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  ○ Lost   ○ Found            [Submit]   │
└─────────────────────────────────────────┘
```

Justification: Groups reduce STM load (Ch1) — user processes one group at a time, not 8 independent fields.

---

### Alignment (Chapter 5)

- Left-align all form labels — English reads left to right; left-alignment creates a scan line
- Right-align numbers (item count, dates) — visual length signals magnitude
- Align action buttons to the right of modal footers — matches platform convention (WIMP standard, Ch3)
- Item cards: fixed image height (e.g. 200px) ensures titles start at the same vertical line across cards — easy to scan

---

### White Space (Chapter 5)

White space is not empty space — it separates, structures, and highlights.

- 16px padding inside all cards
- 8px gap between form fields within a group
- 24px gap between field groups (visual section separator without a divider line)
- Do not pack the homepage — max 3 columns on desktop, 1 on mobile

---

### Decoration — Fonts and Colour (Chapter 5)

**Typography:**
- Body text: minimum 14px, sans-serif (Tailwind default `font-sans`)
- Headings: bold weight, sentence case — not ALL CAPS (Ch5: uppercase harder to scan as words)
- Avoid more than 3 font sizes per screen

**Colour:**
- Use colour sparingly — to reinforce information that is also communicated another way (Ch5)
- Status system:

| Status | Colour | Also shown as |
|--------|--------|--------------|
| Active / Lost | Amber | "Lost" text badge |
| Found | Blue | "Found" text badge |
| Claimed | Green | "Claimed" text badge + tick icon |
| Pending admin | Grey | "Pending" text badge |

- Never use colour as the only differentiator — colour-blind users (Ch1: 8% males) must still be able to distinguish statuses

---

## 3.3 WIMP Elements in the App (Chapter 3)

The app is a WIMP (Windows, Icons, Menus, Pointers) system running in a browser.

| WIMP Element | Used Where | Design Notes |
|-------------|-----------|-------------|
| **Windows** | Modals (ReportItemModal, ClaimItemModal, ItemDetailsModal, AuthModal) | Each modal is a bounded window with its own context; close via X or Escape |
| **Icons** | Bell (notifications), upload icon, image placeholder | Icons must be paired with text labels where action is non-obvious |
| **Menus** | Category dropdown, status filter dropdown | Use `Select` component from shadcn — keyboard accessible |
| **Pointers** | Clickable item cards, buttons | Cursor: pointer on all interactive elements; cursor: default on static text |
| **Buttons** | Primary (Submit, Verify), Secondary (Cancel), Destructive (Delete) | Visual weight matches importance: primary = filled, secondary = outline, destructive = red outline |
| **Dialogs** | Confirm before destructive action | Use `AlertDialog` — blocks interaction until confirmed (appropriate for irreversible actions) |
| **Toolbars** | Search + filter bar on homepage | Grouped logically: search input + category filter + type filter as a horizontal bar |

---

## 3.4 Interaction Styles (Chapter 3)

The app uses **point-and-click** as its primary interaction style — appropriate for a web application with a broad user base of varying technical skill.

- No command-line input
- Menus over free-text where the set of values is known (category, status, type)
- Form-fill style for data entry (ReportItemModal, ClaimItemModal) — structured and familiar
- Query interface for search — keyword + filter, not SQL

**Why not natural language?** Ch3 notes natural language interfaces are "hard to do well" — vague and ambiguous. A structured search with filters is more reliable for this domain.

---

## 3.5 Prototype Screens — What to Show in the Presentation

For the presentation you need wireframes or actual screens. The app already has a working UI — use screenshots of:

1. **Homepage (not logged in):** Shows the item feed, search bar, Sign In button
2. **ReportItemModal open:** Demonstrates grouped form layout and image upload
3. **ItemDetailsModal:** Shows full item detail — image, description, contact info, Claim button
4. **ClaimItemModal:** Shows the claim form with proof-of-ownership fields
5. **AdminDashboard:** Shows the claims list with Verify/Reject actions
6. **AuthModal:** Login and register tabs

For each screen annotate:
- Which design rule is being applied
- Which HTA step this screen corresponds to (link back to File 1)
- Any current gap and the proposed improvement

---

## 3.6 Responsive Design

The app runs on phones (students on campus) and desktops (admin at a desk).

- Use Tailwind responsive prefixes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for the item feed
- Modals should be full-screen on mobile (`w-full h-full` on small screens)
- Touch targets must be at least 44×44px — Fitts' Law (Ch1) says larger targets = faster, more accurate selection
- Font size minimum 16px on mobile to prevent browser zoom override
