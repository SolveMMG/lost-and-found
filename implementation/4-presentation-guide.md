# 4 — Presentation Guide

> Rubric criterion: *Individual Mark — Clarity, professional delivery, time management, and ability to answer technical questions regarding their section.* **(5 marks)**

---

## 4.1 Presentation Structure (Suggested Timing: ~10–12 min total)

| Section | Time | Content |
|---------|------|---------|
| Introduction | 1 min | What the app does; why it matters at USIU |
| User & Task Analysis | 2–3 min | 1–2 personas, 1 scenario, HTA diagram |
| HCI Principles | 2–3 min | Norman + Shneiderman applied to specific screens |
| Prototyping & Layout | 2–3 min | Walk through 3–4 actual app screens with annotations |
| Evaluation / Next Steps | 1 min | What would you test or improve next |
| Q&A | remaining | See Section 4.4 |

---

## 4.2 How to Present Each Section

### Opening (1 min)

Avoid starting with "My name is…" — the marker knows who you are.

Start with the problem:

> "Every semester USIU students lose items on campus and have no easy way to get them back. This app solves that — it connects finders and losers through a searchable digital board, with admin oversight to prevent false claims."

Then state the HCI angle:

> "Today I'll show how we applied HCI principles from this course to make it usable for all three types of users — the reporter, the finder, and the admin."

---

### Section 1 — User & Task Analysis

**What to say:**

1. Introduce one persona briefly — use a name, age, tech comfort level, one constraint
   > "Amara is a 20-year-old student. She's comfortable with technology but she's stressed when she's lost something — and Chapter 1 tells us negative affect narrows thinking. So the report form must be the simplest version possible."

2. Show the HTA as a numbered list or tree diagram (draw it on a slide)
   > "Breaking down the task of reporting a lost item into sub-tasks — we found 6 steps, with step 4 having 8 optional and required inputs. This led us to group those inputs visually."

3. Read through one scenario — keep it short (3–4 sentences)

**What NOT to do:**
- Do not just read slides — speak to your audience
- Do not describe HTA theoretically without applying it to this specific app

---

### Section 2 — HCI Principles

**What to say:**

Pick 2 from Norman and 2 from Shneiderman that are most visible in your app. Show a real screen.

Example for Norman Principle 3 (Make things visible):
> "Here is the item card. The status badge — 'Lost', 'Found', 'Claimed' — is always visible. The user never has to open a modal to find out if an item is available. This bridges the Gulf of Evaluation — the user can immediately evaluate the system state."

Example for Shneiderman Rule 3 (Informative feedback):
> "After submitting a report, a green toast appears for 3 seconds confirming success. This is informative feedback — the user knows the action completed without having to search for confirmation."

**Link to Ch1:**
> "Shneiderman's Rule 8 — reduce short-term memory load — directly maps to Chapter 1's finding that STM holds only 7 plus or minus 2 chunks. Our form groups fields into two sections so the user processes one group at a time."

---

### Section 3 — Prototyping & Layout

**What to say:**

Walk through 3 screens with deliberate annotations. For each screen say:

1. What screen is this and what task does it serve?
2. What screen design principle is applied here?
3. What would you improve?

Example:
> "This is the Report Item modal. Notice the two visual groups — 'What is the item' and 'Where and when'. This is the grouping principle from Chapter 5 — logically related fields are physically together. The Submit button is bottom-right, following WIMP convention from Chapter 3. If I were to improve this, I would add a progress indicator showing which fields are still empty, reducing the chance of a slip — Chapter 1 distinguishes slips from mistakes — the user intended to fill the field but forgot."

---

### Section 4 — Evaluation / Next Steps

Even if you haven't run formal evaluation, mention the methods from **Chapter 9**:

> "We didn't conduct full user testing yet, but the next step would be a cognitive walkthrough — an expert steps through each HTA task and identifies where the design could lead to wrong goals or incorrect actions. We'd also apply Nielsen's 10 heuristics as a checklist."

Or mention a quick heuristic you already applied:
> "We informally applied heuristic evaluation — we walked through the admin dashboard as a non-technical user and identified that the 'Verify' button was not clearly labelled. We renamed it to 'Approve Claim' to make the action explicit."

---

## 4.3 Slide Structure

Each slide should have:
- One main point (not a wall of text)
- A screenshot or diagram where possible
- 3–5 bullet points maximum

Suggested slides:

| Slide | Content |
|-------|---------|
| 1 | App overview — 2 sentences + screenshot of homepage |
| 2 | Persona — name, photo placeholder, 4 bullet point traits |
| 3 | HTA diagram for "Report Lost Item" |
| 4 | Scenario A (3–4 sentence story + screenshot of ReportItemModal) |
| 5 | Norman's 7 Principles — list on left, screenshot on right with callout |
| 6 | Shneiderman's Golden Rules — table of selected rules + app examples |
| 7 | Screen design — annotated screenshot of item feed |
| 8 | Navigation diagram (the flowchart from Section 3.1) |
| 9 | Evaluation methods planned / applied |
| 10 | Summary + what we would do next |

---

## 4.4 Anticipated Technical Questions & Answers

**Q: How did you decide on the category list?**
> A: We used task analysis to identify what types of items USIU students typically lose — electronics, documents, clothing, accessories, keys. This maps to the domain knowledge step in Norman's model — understanding what categories users think in, not just what's technically convenient.

**Q: Why use JWT authentication instead of sessions?**
> A: JWT is stateless — the server doesn't need to store session data. For a university app deployed on Render with a separate frontend on Vercel, stateless auth avoids sticky-session issues. From an HCI perspective, persistent login reduces the step count in every HTA task — the user doesn't re-authenticate every visit.

**Q: How does the app handle colour blindness?**
> A: Chapter 1 notes 8% of males are colour blind. We never use colour as the only indicator — every status badge has a text label alongside the colour. We also chose amber/blue/green rather than red/green which is the most common form of colour blindness (deuteranopia).

**Q: What is the Gulf of Execution in your app?**
> A: A clear example is the Admin Dashboard — before labelling was improved, the action buttons said "Update" which didn't communicate what would happen. The gulf of execution = the user's intention to approve a claim did not clearly map to the "Update" button. Renaming to "Approve Claim" closes that gulf.

**Q: What HTA notation did you use?**
> A: We used a simplified numbered plan notation from Chapter 15 — each task decomposed into sub-tasks with a plan statement describing the order and conditions. We didn't use formal GOMS notation but the structure is equivalent.

**Q: What would you test first if you had users?**
> A: The report form submission flow — it's the highest-frequency task and has the most fields. We'd use think-aloud protocol (Chapter 9) — ask a student to report a fictional item while saying everything they're thinking. This reveals where the Gulf of Evaluation occurs — where they're unsure if the action worked.

---

## 4.5 Common Mistakes to Avoid

- **Describing HCI theory without connecting it to the app** — every principle must have a concrete "in our app, this means…" statement
- **Reading from slides** — use slides as visual anchors, speak from knowledge
- **Ignoring weaknesses** — markers reward honest identification of gaps and proposed fixes over claiming the design is perfect
- **Vague language** — say "the STM limit of 7 items" not "human memory is limited"; say "Shneiderman's Rule 3" not "we give feedback"
- **Going over time** — practise once and cut to the most impactful examples, not all of them
