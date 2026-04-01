# HCI Principles in the USIU Lost & Found Web Application

---

## 1. Introduction

The USIU Lost & Found web application is a digital platform designed to help students and staff at the United States International University – Africa report, search for, and reclaim lost or found items on campus. The system replaces manual, paper-based lost property processes with an interactive, real-time web interface accessible from any device.

The application is built using React and TypeScript on the frontend, with an Express.js backend and a PostgreSQL database. Users can register, report lost or found items, submit claims, and receive notifications via the in-app notification centre as well as through email and SMS. An administrator role manages the full lifecycle of each item report: from approval and visibility on the public feed, through reviewing multiple competing claims, to marking an item as resolved once it has been returned to its owner.

Human-Computer Interaction (HCI) is the study of how people interact with technology, and how to design systems that are safe, efficient, effective, and satisfying to use. Two foundational frameworks guide HCI design:

- **Don Norman's 7 Principles of Design** — drawn from *The Design of Everyday Things*, these principles focus on making systems understandable and usable through visibility, feedback, affordance, mapping, constraints, consistency, and error tolerance.
- **Ben Shneiderman's 8 Golden Rules of Interface Design** — a set of practical guidelines for building usable interactive systems, covering consistency, feedback, error prevention, user control, and memory load.

This document identifies every HCI principle present in the USIU Lost & Found application and explains precisely how each one is implemented and observable in the interface.

---

## 2. HCI Principles Used in the Application

---

### Norman's Principle 1 — Visibility

**Definition:** The state of the system and the controls available to the user should be visible at all times. Users should be able to see what actions are possible and what the current state is without having to explore or guess.

**How it is applied:**

The navigation bar is permanently fixed at the top of every page and always displays the current login state. When a user is not signed in, only the "Sign In" button is visible. Once authenticated, the navbar immediately expands to show the user's name, their role badge (User or Admin), the "Report Lost" and "Report Found" action buttons, and the notification bell icon. No important action is hidden behind a menu or a secondary screen.

Every item card in the public feed permanently displays the item's status badge (Pending, Verified, Matched, Resolved), its type badge (Lost or Found), the category, the location, the date, and the reporter's name. The user never needs to open an item to find out its basic state. The claim count badge next to the "Claim" or "Found It" button is always visible, showing how many people have already responded to that item.

In the Admin Dashboard, a row of five summary statistics cards (Total, Pending, Verified, Matched, Resolved) are displayed at the top of the page. This gives the administrator an immediate, permanent overview of the system's state without scrolling or filtering.

---

### Norman's Principle 2 — Feedback

**Definition:** Every action the user performs should produce a clear and immediate response from the system, confirming that the action was received and indicating what has changed as a result.

**How it is applied:**

When a user submits a claim, a toast notification slides in at the bottom of the screen with the message "Claim submitted — An admin will review and get in touch." This confirms the action was registered without requiring the user to navigate away or refresh the page.

The claim count badge on each item card increments immediately after a successful claim submission, reflecting the updated state of the item in real time. Similarly, when a user clicks the notification bell, the red unread count badge disappears as soon as they read all notifications, confirming the read state has been recorded.

Loading states are communicated throughout the application. While items are being fetched, six skeleton cards with an animated pulse replace the item grid, showing the user that data is on its way. Buttons that trigger async operations (Sign In, Create Account, Submit Claim) replace their text with a spinning `Loader2` icon and a label such as "Signing In..." or "Submitting...", so the user is never left wondering whether their click registered.

The Admin Dashboard uses `AlertDialog` confirmation prompts before any status change or claim decision. Once confirmed, the item or claim updates its badge colour immediately, providing visual confirmation that the action succeeded.

---

### Norman's Principle 3 — Make Things Visible (Affordance)

**Definition:** The design of an element should suggest how it is meant to be used. Buttons should look clickable, input fields should look typeable, and draggable elements should look draggable.

**How it is applied:**

All interactive buttons in the application use the Shadcn/UI `Button` component, which applies a consistent elevated, bordered style that signals clickability. Primary action buttons such as "Report Lost" and "Report Found" use filled, coloured backgrounds (red and green respectively) while secondary actions use outlined styles — visually communicating their hierarchy without instruction.

Icon-prefixed inputs in the authentication modal (an envelope icon before the email field, a lock icon before the password field, a phone icon before the phone field) are a recognisable convention that cues the expected input type before the user reads the label.

The `Eye` and `EyeOff` toggle icons inside the password fields clearly afford toggling password visibility — a standard affordance that users recognise from banking and social apps.

The notification bell icon in the navbar uses a `BellRing` variant (animated ring) when unread notifications exist, compared to a static `Bell` when the inbox is clear. This visual difference in the icon itself affords opening, even without reading the badge count.

The "View Claims" expand/collapse toggle in the Admin Dashboard uses `ChevronDown` and `ChevronUp` icons, which are universally understood to mean more content is below and can be expanded or collapsed.

---

### Norman's Principle 4 — Mapping

**Definition:** The relationship between controls and their effects should be natural and logical. Controls should be placed near the things they affect, and their movement or activation should correspond intuitively to the result.

**How it is applied:**

Colour mapping is used consistently and intuitively throughout the application. Red is used for lost items and destructive or negative actions (Deny claim, delete). Green is used for found items, approved states, and positive confirmations. Yellow is used for pending/warning states. Blue is used for informational or in-progress states. This colour-to-meaning mapping is applied uniformly across item type badges, item status badges, claim status badges, and action buttons.

The "Report Lost" and "Report Found" buttons are placed side by side in the navbar, directly above the item feed they affect. Clicking either one opens the Report Item modal pre-configured for the correct type — there is a direct, natural relationship between the button pressed and the state of the form that opens.

In the Admin Dashboard, the Approve and Deny buttons for each claim are placed directly beside that specific claim's details panel, making it unambiguous which claim each button refers to. When a claim is approved or denied, the button row disappears and is replaced by the appropriate coloured status badge — directly in the same position — so the admin can see the result in exactly the same location they took the action.

---

### Norman's Principle 5 — Exploit Constraints

**Definition:** Constrain the design so that users are physically or visually prevented from taking actions that are inappropriate, rather than relying on instructions or warnings alone.

**How it is applied:**

When a user opens the Report Item modal by clicking "Report Lost", the `type` field is pre-set to `"lost"` and is not exposed as an editable field — the user cannot accidentally submit a lost item report as a found item. The same applies when clicking "Report Found", which pre-sets the type to `"found"`.

All required form fields in the Report Item modal, the Claim modal, and the Auth modal have the HTML `required` attribute applied. The browser enforces that these fields must be filled before the form can be submitted, making an incomplete submission physically impossible.

Once a claim is approved by the admin, the Approve and Deny action buttons for that specific claim disappear entirely from the UI. The admin cannot double-approve or approve-then-deny a claim that has already been decided — the action is simply no longer available.

When an item has an approved claim (`isClaimed: true`), the ClaimItemModal replaces the submission form entirely with a read-only panel showing the approved claimant's details. The input fields do not exist in the DOM; there is nothing to interact with incorrectly.

The "Dashboard" tab in the main navigation is marked `disabled={!user}`, making it visually inactive and unclickable for unauthenticated visitors, constraining navigation to paths that are valid for their current session state.

---

### Norman's Principle 6 — Design for Error

**Definition:** Design the system assuming that users will make mistakes. Provide clear error messages that explain what went wrong and how to recover, and where possible prevent errors from occurring in the first place.

**How it is applied:**

The authentication modal shows a specific inline error message when login fails (e.g., "Invalid credentials"), rather than a generic failure state or a silent reload. The error is displayed in red text directly below the form, in the same modal, so the user does not lose their context and knows exactly what to correct.

The ClaimItemModal displays a red inline error message if the submission fails (e.g., "Failed to submit claim" or "Network error. Please try again."). This gives the user actionable information and keeps the form open so they can retry without re-entering their data.

All destructive or irreversible admin actions — approving a report, matching, resolving, approving a claim, denying a claim — are wrapped in `AlertDialog` confirmation dialogs. These dialogs describe exactly what will happen (e.g., "This will approve Jane's claim and automatically deny all other pending claims") before asking for a final confirmation. This two-step process prevents accidental irreversible actions.

In the Claim modal, if existing claims are already present, a yellow notice informs the user: "X claims already submitted — you can still submit yours — the admin will review all claims." This prevents the confusion of silently blocking a submission or leaving the user uncertain about whether their action is valid.

The password confirmation field in the registration form prevents mismatched passwords from being submitted. If the two entries do not match, the form does not proceed, protecting users from locking themselves out with a typo.

---

### Norman's Principle 7 — Consistency and Standards

**Definition:** Similar operations and elements should behave the same way across the entire interface and should follow established platform conventions, so users can apply what they have already learned.

**How it is applied:**

All modals in the application (AuthModal, ReportItemModal, ClaimItemModal, ItemDetailsModal, AdminDashboard dialogs) follow an identical layout pattern: a `DialogHeader` with a title and description at the top, the form or content body in the middle, and action buttons aligned at the bottom right. Users who have used one modal know how to use all of them.

Status badge colours are standardised across every part of the application. Whether appearing on an item card in the public feed, in the Admin Dashboard item list, or inside the claim details panel, the colour meanings never change: yellow = pending, green = approved/verified, red = denied/lost, blue = matched, grey = resolved.

Primary action buttons (submit, approve, confirm) always use filled colour backgrounds. Secondary or neutral actions (cancel, close) always use the `outline` variant with no background fill. This distinction is maintained everywhere, making button hierarchy immediately legible regardless of which screen the user is on.

Navigation follows established web conventions. The logo and application name are in the top-left. User account information and logout are in the top-right. The main content is centred below the header. This follows the standard layout pattern users expect from any web application.

---

### Shneiderman's Rule 1 — Strive for Consistency

**Definition:** Use consistent sequences of actions for similar situations, identical terminology in menus and dialogs, and consistent commands throughout the interface.

**How it is applied:**

Every item card — whether it appears in the public search feed, the user's personal Dashboard, or the Admin Dashboard — uses the same card structure: image at the top, title and badges below, metadata (location, date, reporter) in the body, and action buttons (View Details, Claim/Found It or status badge) at the bottom. The structure never changes by context.

The terminology used for item states is identical across all parts of the application. An item labelled "Verified" in the admin's status filter dropdown shows the same "Verified" badge on the item card, and the notification sent to the reporter reads "Your item has been approved and is now visible to all students" — all using the same vocabulary.

Form structure is consistent: every form in the app places the label above its input, uses a left-aligned icon inside the input field for visual cues, applies the same border and focus-ring styling, and places required fields before optional ones.

---

### Shneiderman's Rule 2 — Enable Frequent Users to Use Shortcuts

**Definition:** As frequency of use increases, so does the desire for shortcuts. Allow users to abbreviate and reduce the steps needed to accomplish common tasks.

**How it is applied:**

The search bar and category filter dropdown are placed at the very top of the item feed, immediately accessible without any additional clicks. A frequent user who regularly browses lost electronics, for example, can filter by category immediately on page load with a single interaction.

Active filter chips are displayed below the search bar whenever a search query or category filter is applied. Each chip has an inline × button that removes only that filter with a single click, rather than requiring the user to clear the input field manually or reset all filters at once.

The "Mark all read" button in the notification popover allows users who have multiple unread notifications to clear them all with one click, rather than clicking each notification individually.

The notification popover opens by clicking the bell icon and refreshes its content immediately on open, meaning a frequent user checking notifications does not need to reload the page or navigate to a separate screen.

---

### Shneiderman's Rule 3 — Offer Informative Feedback

**Definition:** For every user action, there should be system feedback. For common and minor actions, the response can be modest; for infrequent and major actions, the response should be more substantial.

**How it is applied:**

Minor actions such as filtering items or clearing a search query give immediate visual feedback by instantly updating the item grid with the filtered results. The active filter chips appear and disappear in real time, confirming the filter state.

Moderate actions such as submitting a claim or reporting an item trigger a toast notification in the corner of the screen. The toast message is contextual — for a found item report it reads "Found report submitted", for a lost item claim it reads "Claim submitted" — confirming the exact action that was taken.

Major admin actions such as approving a report or approving a claim are preceded by a detailed confirmation dialog and followed by an immediate visual change to the item or claim's status badge. The badge updates from yellow (Pending) to green (Approved) or red (Denied) instantly after the action is confirmed.

The notification bell badge count updates in real time as the backend creates new notification records. Users see the count grow when events occur (a claim is submitted on their item, a claim is approved) and see it drop to zero when they mark all notifications as read — providing continuous feedback about activity related to their items.

---

### Shneiderman's Rule 4 — Design Dialogs to Yield Closure

**Definition:** Sequences of actions should be organised into groups with a beginning, middle, and end. Informative feedback at the completion of a group of actions gives users the satisfaction of accomplishment and signals readiness for the next group.

**How it is applied:**

The Report Item flow has a clear three-stage structure: the user clicks "Report Lost" or "Report Found" (beginning), fills out the form fields (middle), and submits — receiving a success toast and having the modal close automatically (end). The closure is explicit and satisfying.

The Claim Item flow follows the same pattern: open the claim modal, fill in name, contact, and description, submit — the modal closes, a toast confirms the submission, and the item card's claim count badge increments. The user has a clear sense that their task is complete.

The authentication flow (Sign Up) also achieves closure: after a successful registration, the modal closes automatically, the navbar updates to show the user's name and role badge, and the Report Lost/Found buttons appear. The transition from anonymous visitor to logged-in user is complete and immediately evident.

In the Admin Dashboard, after approving a claim, the claim's status badge updates to "Approved" (green), the other pending claims update to "Denied" (red), and the item's overall status badge updates to "Matched". The entire decision workflow reaches a visually complete and final state.

---

### Shneiderman's Rule 5 — Prevent Errors

**Definition:** Design the system so that users cannot make serious errors. Provide input restrictions, selection menus, and confirmation dialogs to prevent mistakes before they happen.

**How it is applied:**

The email input field in both the login and registration forms uses `type="email"`, which triggers the browser's built-in email format validation. A user cannot submit a malformed email address — the browser prevents it before any server request is made.

Required fields (title, category, location, date, and type in the Report Item form; name, contact, and description in the Claim form) are marked with HTML `required`. The form cannot be submitted with any of these fields empty.

The "Confirm Password" field in the registration form must match the password field exactly before the form is submitted. This prevents users from creating accounts with accidental typos in their passwords.

All destructive or irreversible admin actions are gated behind `AlertDialog` confirmation prompts. Before approving a claim, the dialog explicitly states "This will automatically deny all other pending claims." This gives the admin a full understanding of the consequences before they confirm, making accidental irreversible actions very unlikely.

---

### Shneiderman's Rule 6 — Permit Easy Reversal of Actions

**Definition:** Actions should be reversible wherever possible. This relieves anxiety, since the user knows that errors can be undone, and encourages exploration of the interface.

**How it is applied:**

Every modal in the application has a clear and prominent Cancel or Close button. If a user opens the Report Item modal, starts filling in details, and changes their mind, they can cancel at any point without any data being submitted or any state being changed.

Active search and category filters can each be individually removed by clicking their inline × button on the filter chip, or by clearing the text field. The filter state reverts to the default (all items visible) without losing the other filter. This makes filtering exploratory and risk-free.

In the notification centre, individual notifications can be deleted (removing them from the list permanently) but also dismissed by simply closing the popover if the user opened it by accident, with no irreversible effect.

Unread notifications can be marked as read one at a time by clicking them, or all at once. Both operations are low-stakes; there is no permanent loss of information, as the notification text remains visible even after being marked as read until the user explicitly deletes it.

---

### Shneiderman's Rule 7 — Support Internal Locus of Control

**Definition:** Experienced users strongly desire the sense that they are in charge of the system and that the system responds to their actions. Design the system to make users the initiators of actions rather than the responders.

**How it is applied:**

No action in the application happens automatically without the user initiating it. Items are not submitted without clicking "Submit". Claims are not processed without clicking "Submit Claim". Filters are not applied without the user typing in the search box or selecting from the dropdown.

The admin is fully in control of the item lifecycle. Items submitted by users are not visible to the public until the admin explicitly approves them. Claims are not resolved until the admin reviews each one and makes an explicit approve or deny decision. The system does not auto-approve or auto-resolve anything.

Users control their notification state entirely. They decide when to open the bell popover, which notifications to mark as read, and which to delete. The bell icon indicates how many unread notifications exist but never forces the user to open it.

Users who wish to report an item are never automatically redirected to a form. If they are not logged in when they click "Report Lost" or "Report Found", they are shown the authentication modal — allowing them to log in and then return to their action — rather than being sent to a separate login page that would discard their intent.

---

### Shneiderman's Rule 8 — Reduce Short-Term Memory Load

**Definition:** The limitation of human information processing in short-term memory requires that displays be kept simple, multiple page displays be consolidated, and window-motion frequency be reduced. Users should not have to remember information from one part of an interface to use another.

**How it is applied:**

Every piece of information needed to assess an item is displayed directly on its card. The image, title, description, type, status, location, date, reporter's name, and current claim count are all visible at once. The user never has to click into a detail page to recall what they already saw, nor navigate to a different screen to retrieve the reporter's name.

When a user submits a claim on an item that already has other claims, the Claim modal shows a yellow notice counting how many claims already exist. The user does not have to remember this from the item card — the information is brought to them in context.

In the Admin Dashboard, claim details (claimant name, contact, description, date submitted, and current status) are displayed in-line directly below the item they relate to, in an expandable panel. The admin does not have to open a separate claim management page, navigate back, and remember which item they were reviewing.

Active filters are shown as persistent badge chips below the search bar. If the user has applied both a keyword search and a category filter, both are simultaneously visible as chips. They do not have to remember what filters they have applied — the interface maintains and shows that state for them.

The notification popover groups all unread notifications in one scrollable list, sorted by most recent first, with a relative timestamp ("2m ago", "3h ago"). The user can review everything that has happened without remembering the order of events or navigating to a separate notifications page.

---

## 3. Conclusion

The USIU Lost & Found web application demonstrates a considered application of Human-Computer Interaction principles drawn from both Don Norman's design theory and Ben Shneiderman's practical interface guidelines. Every significant design decision in the application — from the colour coding of badges, to the placement of action buttons, to the read-only approved claim view — can be traced back to one or more of these principles.

Norman's principles shaped the structural qualities of the interface: ensuring that the system's state is always visible to the user, that every action produces feedback, that affordances signal correct use, that constraints prevent incorrect actions, that the design tolerates and recovers from errors, and that the layout follows the mappings and conventions that users already know from other applications.

Shneiderman's rules shaped the interaction patterns: maintaining terminology and layout consistency across every screen, providing immediate feedback for every action from minor to major, preventing errors through input validation and confirmation dialogs, giving users full control over their data and workflow, and removing memory burden by displaying all relevant information in-context rather than expecting users to recall it from elsewhere.

Together, these principles ensure that the application is not only functional but genuinely usable — accessible to a first-time visitor reporting a lost item and equally efficient for an administrator processing dozens of reports and claims daily. The result is a system where the interface supports the user's goals rather than creating friction, which is the fundamental purpose of Human-Computer Interaction as a discipline.
