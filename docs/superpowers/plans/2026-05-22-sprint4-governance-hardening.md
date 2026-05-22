# Sprint 4 — THLabs Governance Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close 5 operational governance gaps so that sprint closure, deployment status, and operational state are evidenced rather than asserted.

**Architecture:** Pure document and process discipline — no new infrastructure, no code beyond the conditional STL status update. All changes harden the existing four-artifact stack (status.md, roadmap.md, ADRs, spec/plan pairs). Sprint 3 operational verification is the integration test.

**Sprint type:** docs/governance (non-deployment)
**Sprint status:** In Progress

**Spec:** `docs/superpowers/specs/2026-05-22-sprint4-governance-hardening-design.md`

---

## File Map

| File | Change |
|------|--------|
| `docs/architecture.md` | Add §8 Glossary; update §6 to list both repos |
| `docs/decisions/006-sprint-operational-verification.md` | Create — new ADR |
| `docs/status.md` | Restructure Known Gaps into Drift/Accepted Limitations; add Active State section |
| `docs/roadmap.md` | Correct Sprint 3 status from "completed" to "Awaiting Verification" |
| `docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md` | Add sprint type/status header fields; add Sprint Closure and Verification Record sections |
| `lib/projects.ts` | Conditional: STL `status: 'development'` → `'live'` only if Task 5 verification passes |

---

## Task 1: Canonical Glossary (Gap 5)

**Files:**
- Modify: `docs/architecture.md`

Add `## 8. Glossary` as the final section of `docs/architecture.md`. This establishes shared vocabulary used throughout the governance changes.

- [ ] **Step 1.1: Open `docs/architecture.md` and locate the end of `## 7. Future Direction`**

Confirm the file currently ends with `## 7. Future Direction` and its content. Do not modify any existing section.

- [ ] **Step 1.2: Append `## 8. Glossary`**

Add this section after the last line of the file:

```markdown
---

## 8. Glossary

| Term | Meaning |
|------|---------|
| Sprint | A scoped unit of work with one design spec and one implementation plan. See ADR-005. |
| ADR | Architecture Decision Record — a numbered, immutable decision in `docs/decisions/`. |
| Spec | The design intent document for a sprint, in `docs/superpowers/specs/`. Authored and approved before implementation begins. |
| Plan | The task-by-task implementation breakdown for a sprint, in `docs/superpowers/plans/`. Derived from the spec. |
| Registry | The project list in `lib/projects.ts` — the only coupling point between THLabs and external projects. See ADR-001. |
| `ProjectStatus` | Registry status field: `'development'` (built, not verified live), `'active'` (live, ongoing work), `'live'` (verified live and operational), `'archived'` (retired). |
| Drift | A documented gap where a doc disagrees with reality. Must be reconciled at sprint close. See `docs/status.md` § Known Gaps. |
| Active State | The canonical "you are here" pointer at the top of `docs/status.md`, naming the active sprint and next action. |
```

- [ ] **Step 1.3: Verify**

Confirm `## 8. Glossary` appears as the last section, all 8 terms are present, and no existing section was modified.

- [ ] **Step 1.4: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: add glossary section to architecture.md"
```

---

## Task 2: ADR-006 — Sprint Operational Verification (Gap 3)

**Files:**
- Create: `docs/decisions/006-sprint-operational-verification.md`

Creates the durable, ADR-backed rule that deployment sprints cannot close without a filled-in Verification Record. This makes the rule cold-discoverable by AI sessions reading `docs/decisions/`.

- [ ] **Step 2.1: Create `docs/decisions/006-sprint-operational-verification.md`**

```markdown
# 006 — Sprint Operational Verification

## Context

THLabs's operational success criterion is "deployed and live at the correct URL." Sprint plans already carry a Verification Checklist (Post-Deploy), but no process gates sprint closure on it. Sprint 3 was declared completed in `roadmap.md` before `trout.thlabs.dk` was confirmed reachable and the auth flow was exercised. ADR-002 establishes that THLabs cannot observe external deployment health automatically (deployments are independent Vercel projects with no shared instrumentation). Manual verification is therefore not optional ceremony — it is the only available signal.

## Decision

### Sprint classification

Every sprint is classified in its plan header as one of:
- `sprint type: deployment` — the sprint creates or changes an external deployment, changes a project's auth boundary, or changes registry `status`/`externalUrl` in a way that asserts a deployment is reachable.
- `sprint type: code` — the sprint makes code changes with no new or changed external deployment.
- `sprint type: docs` — the sprint makes documentation or process changes only.

### Sprint states

| State | Meaning |
|-------|---------|
| `In Progress` | Implementation tasks are being executed. |
| `Blocked` | Work cannot proceed; the blocker is named in the plan. |
| `Awaiting Verification` | All implementation tasks done and committed. Deployment prerequisites performed. Operational verification has not yet been recorded. |
| `Complete` | Implementation done AND verification passed (deployment sprints), or implementation done (non-deployment sprints). |
| `Complete (with caveats)` | Verification performed and recorded; one or more checklist items failed or were deferred. Caveats are named in the Verification Record. |

### Exit conditions

**Deployment sprints** (`sprint type: deployment`) may only be marked `Complete` when ALL of the following are true:

1. Every plan task checkbox is checked, or explicitly marked deferred with a reason.
2. The plan's Deployment Prerequisites are done (Vercel project, DNS, env vars, Supabase Auth redirect URLs, user provisioning).
3. A `## Verification Record` exists in the plan with: a date, a named verifier, the environment URL, and a per-item result row for every Verification Checklist item.
4. The Verification Record result is `PASS` or `PASS WITH CAVEATS`.
5. The registry `lib/projects.ts` `status` field reflects verified reality — `'live'` only after a `PASS`.
6. The Sprint Closure block in the plan is fully checked.

`Complete (with caveats)` requires the same conditions plus: all unresolved caveats are recorded in either `docs/roadmap.md` deferred work or `docs/status.md` Accepted Limitations before closure is valid. Caveats must become durable operational knowledge, not ephemeral closure notes.

**Non-deployment sprints** (`sprint type: code` or `docs`) are exempt from the Verification Record requirement. Their Sprint Closure block must state `sprint type: <type> — verification exit condition not applicable`.

### `Awaiting Verification` is a valid, named state

A sprint that has completed all implementation tasks but has not yet produced a passing Verification Record is `Awaiting Verification` — not `Complete`. It must be described as such in `roadmap.md` and its plan header. `lib/projects.ts` `status` may not be promoted to `'live'` while a sprint is `Awaiting Verification`.

## Consequences

- Sprint closure for deployment work requires hands-on confirmation against the live URL.
- `ProjectStatus: 'live'` becomes a verified claim, not an optimistic assertion.
- The lag between "code done" and "sprint done" is visible in `roadmap.md` and plan headers rather than hidden.
- AI sessions resuming cold can read `sprint status: Awaiting Verification` and immediately know: do not mark done, do not change registry status, the next action is to perform and record verification.
- ADR-002's isolation model is the reason manual verification is necessary — and this decision is the process response to that constraint.

*Amends the closure semantics of the implementation plan defined in ADR-005. See also ADR-002 (independent deployments).*
```

- [ ] **Step 2.2: Verify**

Confirm the file exists, follows Context/Decision/Consequences format, defines all 5 sprint states, includes the carry-forward rule for `Complete (with caveats)`, and cross-references ADR-002 and ADR-005.

- [ ] **Step 2.3: Commit**

```bash
git add docs/decisions/006-sprint-operational-verification.md
git commit -m "docs: add ADR-006 sprint operational verification exit condition"
```

---

## Task 3: Drift Reconciliation Discipline (Gap 4)

**Files:**
- Modify: `docs/status.md`
- Modify: `docs/architecture.md`

Splits Known Gaps into Drift (must fix at sprint close) and Accepted Limitations (intentionally deferred). Resolves the only current Drift item by fixing `architecture.md` §6.

- [ ] **Step 3.1: Restructure `## Known Gaps` in `docs/status.md`**

Replace the current `## Known Gaps` section (which lists 4 items in a flat list) with:

```markdown
## Known Gaps

### Drift (doc disagrees with reality — must be reconciled at sprint close)

_None currently open._

### Accepted Limitations (no current intent to close)

- No automated health checks or uptime monitoring for either deployment.
- Project metadata is maintained manually in `lib/projects.ts` — no distributed self-description mechanism yet. See roadmap "Later / Deferred".
```

Note: The architecture.md §6 staleness was the only Drift item. It is resolved in Step 3.2 below, so it is not listed above. The STL `status` field discrepancy is resolved by Task 5 (Sprint 3 verification) and is not a doc drift — it is correctly `'development'` pending verification.

- [ ] **Step 3.2: Fix `docs/architecture.md` §6**

Replace the current `## 6. Current Platform Structure` section with:

```markdown
## 6. Current Platform Structure

Live deployment status is tracked in `docs/status.md`. This section tracks repo/deployment structure only.

| Repo | Purpose | Status |
|------|---------|--------|
| `thlabs` | Public shell, project index, auth gateway | Active |
| `havorred-log` | Sea Trout Log — private catch-logging application | Active |

The `thlabs` repo is a Next.js 16 application. It runs on React 19 with Tailwind CSS 4. It links to `havorred-log` via an `externalUrl` registry entry — no code is shared between them at runtime.

The `havorred-log` repo is independently deployed at `trout.thlabs.dk`. It has its own Supabase project, its own auth boundary, and its own Vercel project.
```

- [ ] **Step 3.3: Verify**

Confirm:
- `docs/status.md` Known Gaps has `### Drift` and `### Accepted Limitations` subsections
- The Drift section is empty (no open drift items)
- `docs/architecture.md` §6 lists both repos and notes that live status defers to `status.md`

- [ ] **Step 3.4: Commit**

```bash
git add docs/status.md docs/architecture.md
git commit -m "docs: restructure Known Gaps into Drift/Accepted Limitations; fix architecture.md platform table"
```

---

## Task 4: Sprint 3 Governance Correction (Gap 2 partial)

**Files:**
- Modify: `docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md`
- Modify: `docs/roadmap.md`

Adds Sprint Closure template and Verification Record stub to the Sprint 3 plan. Corrects `roadmap.md` from asserting Sprint 3 is "completed" to accurately stating it is `Awaiting Verification`.

- [ ] **Step 4.1: Add header fields to Sprint 3 plan**

In `docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md`, after the opening `> **For agentic workers:**` block and before the `**Goal:**` line, add:

```markdown
**Sprint type:** deployment
**Sprint status:** Awaiting Verification
```

- [ ] **Step 4.2: Add `## Verification Record` stub below the existing Verification Checklist**

The Sprint 3 plan ends with `## Verification Checklist (Post-Deploy)` (8 unchecked items). Append directly below those items:

```markdown
---

## Verification Record

**Verified:** —
**Verified by:** —
**Environment:** —
**Result:** —

_Verification not yet performed. Per ADR-006, this sprint cannot be marked Complete until this record is filled in and Result is PASS or PASS WITH CAVEATS._

| # | Checklist item (abbreviated) | Result | Observed |
|---|------------------------------|--------|----------|
| 1 | Anonymous → /login redirect | — | — |
| 2 | Magic-link email received | — | — |
| 3 | Magic link → / with header | — | — |
| 4 | Logout → /login | — | — |
| 5 | THLabs detail page "Open project →" | — | — |
| 6 | No THLabs session carryover | — | — |
| 7 | Unauthenticated / → /login | — | — |
| 8 | STL features work authenticated | — | — |

**Caveats:** —
**Registry action taken:** —
```

- [ ] **Step 4.3: Add `## Sprint Closure` section at the end of the Sprint 3 plan**

Append after the Verification Record:

```markdown
---

## Sprint Closure

- [ ] All task checkboxes above are checked, or explicitly marked deferred with a reason
- [ ] Verification Record is filled in and Result is PASS or PASS WITH CAVEATS
- [ ] Drift reconciliation pass complete
- [ ] `docs/status.md` Active State and `docs/roadmap.md` updated
- [ ] `Complete (with caveats)` caveats recorded in roadmap deferred or status.md Accepted Limitations — or: n/a

**Closed:** —
**Outstanding at close:** —
```

- [ ] **Step 4.4: Correct `docs/roadmap.md` Sprint 3 status**

Replace the current `## Current Sprint Focus` section with:

```markdown
## Current Sprint Focus

**Sprint 3 — Sea Trout Log External Deployment — `Awaiting Verification`**

Implementation is complete: the STL auth layer, middleware, login surface, PKCE callback, and layout shell are merged in `havorred-log`; the THLabs registry `externalUrl` points to `https://trout.thlabs.dk`. Code and infrastructure changes are committed.

**Not operationally verified.** The deployment at `trout.thlabs.dk` has not been confirmed reachable and the auth flow has not been exercised. Per ADR-006, this sprint cannot be marked Complete until the Verification Record in the Sprint 3 plan is filled in with a passing result. STL registry `status` remains `'development'` pending a passing verification.

**Sprint 4 — Governance Hardening — `In Progress`**

Adding governance discipline that closes the operational gaps identified by the portability assessment. See `docs/superpowers/specs/2026-05-22-sprint4-governance-hardening-design.md`.
```

- [ ] **Step 4.5: Verify**

Confirm:
- Sprint 3 plan header has `sprint type: deployment` and `sprint status: Awaiting Verification`
- Sprint 3 plan has `## Verification Record` with empty stub rows
- Sprint 3 plan has `## Sprint Closure` with unchecked checkboxes
- `roadmap.md` accurately describes Sprint 3 as `Awaiting Verification` with explanation
- `roadmap.md` mentions Sprint 4 as `In Progress`

- [ ] **Step 4.6: Commit**

```bash
git add docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md docs/roadmap.md
git commit -m "docs: add sprint governance artifacts to Sprint 3 plan; correct roadmap to Awaiting Verification"
```

---

## Task 5: Sprint 3 Operational Verification [MANUAL — requires hands-on]

**Files (conditional):**
- Modify: `docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md` (fill in Verification Record)
- Modify: `docs/roadmap.md` (update Sprint 3 to Complete or document failure)
- Modify: `docs/status.md` (update deployment table)
- Modify: `lib/projects.ts` (conditional: `status: 'live'` only on PASS)

**This task cannot be delegated to an automated subagent. It requires a human to exercise the live deployment.**

- [ ] **Step 5.1: Visit `https://trout.thlabs.dk` in a private browser window**

An unauthenticated browser is required. Use a private/incognito window to ensure no existing session is carried.

- [ ] **Step 5.2: Run through the 8 Verification Checklist items**

For each item, record the actual observed behavior (a short clause, not a test transcript):

1. Does `https://trout.thlabs.dk` redirect to `/login` for anonymous users?
2. Does submitting an email address result in a magic-link email arriving?
3. Does clicking the magic link land on `/` with the header showing email + logout?
4. Does clicking "logout" redirect to `/login`?
5. Does `https://thlabs.dk/projects/sea-trout-log` show "Open project →" linking to `https://trout.thlabs.dk`?
6. Does opening `https://trout.thlabs.dk` in a private window after authenticating to THLabs still require its own STL login?
7. Does directly accessing `https://trout.thlabs.dk/` while unauthenticated redirect to `/login`?
8. Do existing STL features (catches, spots, etc.) work when authenticated?

- [ ] **Step 5.3: Fill in the Verification Record in the Sprint 3 plan**

Fill in all fields: date, verifier identity, environment (`https://trout.thlabs.dk`), result (`PASS` / `PASS WITH CAVEATS` / `FAIL`), and the observed column for each of the 8 rows.

**On PASS:**

- [ ] **Step 5.4a: Update `lib/projects.ts`** — change Sea Trout Log `status: 'development'` → `'live'`

- [ ] **Step 5.4b: Update `docs/status.md`** — change STL deployment status from "Pending confirmation" to "Live"; remove any STL deployment uncertainty from the Known Gaps Drift section if still present

- [ ] **Step 5.4c: Check all Sprint Closure boxes in the Sprint 3 plan** and fill in the Closed date and evidence statement

- [ ] **Step 5.4d: Update `docs/roadmap.md`** — change Sprint 3 from `Awaiting Verification` to `Complete`, move it to `## Completed Milestones`, and add the verification date as the completion evidence

- [ ] **Step 5.4e: Update `docs/status.md` Immediate Technical Priorities** — remove items 1 and 2 (confirm trout.thlabs.dk, update status to 'live')

- [ ] **Step 5.4f: Commit**

```bash
git add lib/projects.ts docs/status.md docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md docs/roadmap.md
git commit -m "feat: verify trout.thlabs.dk live; set Sea Trout Log status to live"
```

**On FAIL:**

- [ ] **Step 5.5a: Document what failed** — fill in the Verification Record with the failures, set Result: FAIL

- [ ] **Step 5.5b: Update `docs/roadmap.md`** — Sprint 3 remains `Awaiting Verification`; add a note naming what failed

- [ ] **Step 5.5c: Create a new entry in `docs/status.md` Known Gaps Drift** for the specific failure (e.g. "trout.thlabs.dk does not redirect anonymous users to /login")

- [ ] **Step 5.5d: Commit**

```bash
git add docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md docs/roadmap.md docs/status.md
git commit -m "docs: Sprint 3 verification — record failure, stay Awaiting Verification"
```

---

## Task 6: Active State Pointer (Gap 1)

**Files:**
- Modify: `docs/status.md`

Adds the `## Active State` section as the first section of `docs/status.md`. Written after Task 5 so Sprint 3's settled state is reflected accurately.

- [ ] **Step 6.1: Add `## Active State` as the first section of `docs/status.md`**

Insert before the current first section (`## Deployment`):

```markdown
## Active State

- **Active sprint:** Sprint 4 — Governance Hardening (`docs/superpowers/specs/2026-05-22-sprint4-governance-hardening-design.md`)
- **Next action:** Complete Sprint 4 Sprint Closure (Task 7 of the plan)
- **Last updated:** 2026-05-22
```

(If Sprint 3 completed in Task 5, the active sprint line should accurately reflect whether Sprint 4 is still in progress or also complete.)

- [ ] **Step 6.2: Verify**

Confirm `## Active State` is the first section in the file, content is accurate, and the existing `## Deployment` section immediately follows it.

- [ ] **Step 6.3: Commit**

```bash
git add docs/status.md
git commit -m "docs: add Active State pointer to status.md"
```

---

## Task 7: THLabs-Native Startsession Profile Documentation

**Files:**
- Create: `docs/startsession-profile.md`

Documents the THLabs-native 7-step read order and rendering profile. This is a reference document — not renderer infrastructure, not a shared abstraction.

- [ ] **Step 7.1: Create `docs/startsession-profile.md`**

```markdown
# THLabs Startsession Profile

This document defines the THLabs-native read order and output format for the `startsession` skill. It replaces the Personal OS default profile for this project.

## Read order (7 steps)

| Step | File | What to extract | Why |
|------|------|----------------|-----|
| 1 | `CLAUDE.md` → `AGENTS.md` | "Read `node_modules/next/dist/docs/` before writing Next.js code" | Establishes the hard procedural gate before any file is read as actionable |
| 2 | `docs/architecture.md` | §1 vision, §2 principles, §3 visibility model, §6 platform structure (note: compare against status.md — drift candidate), §8 glossary | Loads canonical vocabulary; §6 flagged for drift cross-check in step 7 |
| 3 | `docs/roadmap.md` | Active sprint name and status; sprint phase ("Outstanding:", "Awaiting Verification", etc.); next priorities | Identifies which spec+plan pair to open in step 4 |
| 4 | Newest date-prefixed spec + plan in `docs/superpowers/` | Spec H1 (→ `sprint:`); plan `sprint type:`, `sprint status:`, first unchecked task (→ `recommended next task:`) | ADR-005 resume anchor — reconstructs mid-sprint state without chat history |
| 5 | `lib/projects.ts` | `name`, `status`, `externalUrl` per registry entry | Typed deployment ground truth (ADR-001: registry is the sole coupling point) |
| 6 | `docs/status.md` | `## Active State`, `## Deployment` table, `## Authentication`, `## Known Gaps`, `## Immediate Technical Priorities` | Operational present-state; reconcile registry (step 5) against deployment table |
| 7 | `docs/decisions/001–NNN` | Decision + Consequences of each ADR; ADR-005 and ADR-003 read closely | Surfaces standing constraints; performs three-way drift cross-check (architecture.md §6 vs status.md vs lib/projects.ts) |

**Why this order:** Steps 1→2 establish vocabulary and constraints. Step 3 identifies the active sprint, handing the slug to step 4 (the resume anchor). Steps 5→6 move from typed ground truth to prose reconciliation. Step 7 closes with ADR constraints and the drift cross-check, which requires all prior sources loaded.

## Output format

```
project:          THLabs
date:             YYYY-MM-DD
branch:           <git branch>
sprint:           <Sprint name — named, not numbered>
sprint status:    In Progress | Blocked | Awaiting Verification | Complete | Complete (with caveats)
sprint docs:      spec=<path> | plan=<path>

deployment health:
  <project name>:  <live | development | archived> @ <externalUrl>
                   <confirmed live / unconfirmed / etc.>
  (one row per lib/projects.ts registry entry)

auth boundaries:  <one line per independently-authed system — from status.md Authentication>

open questions:   <N — [BLOCKING] for those gating next task>
high risks:       <list or "none">

recommended next task:
  <verbatim from: plan first unchecked task > status.md priorities > roadmap.md next>

detected drift:
  <cross-check findings from step 7 — or "none detected">
```

## Field source mapping

| Field | Source |
|-------|--------|
| `project:` | Constant `THLabs` |
| `date:` | Session date |
| `branch:` | `git branch --show-current` |
| `sprint:` | Active spec H1 heading (step 4); cross-check with roadmap.md (step 3) |
| `sprint status:` | Plan header `sprint status:` field (step 4); confirm against roadmap.md phrasing (step 3) |
| `sprint docs:` | Newest date-prefixed pair in `docs/superpowers/` (step 4) |
| `deployment health:` maturity | `lib/projects.ts` `status` field per entry (step 5) |
| `deployment health:` note | `docs/status.md` Deployment table Status column (step 6); reconcile against step 5 |
| `auth boundaries:` | `docs/status.md` Authentication section (step 6) |
| `open questions:` | `docs/status.md` Known Gaps + roadmap.md Outstanding (steps 6, 3) |
| `high risks:` | Known Gaps Drift items + drift found in cross-check (steps 6, 7) |
| `recommended next task:` | Plan first unchecked task (step 4), else status.md priority 1 (step 6), else roadmap.md next priority (step 3) |
| `detected drift:` | Three-way cross-check: architecture.md §6 vs status.md Deployment vs lib/projects.ts (step 7) |

## Invariants

- Every field has an existing THLabs source. No field requires N/A.
- `deployment health:` has one row per `lib/projects.ts` entry.
- `detected drift:` reports findings from step 7's three-way cross-check; `none detected` is only valid if the cross-check was actually performed.
- `sprint status: Awaiting Verification` means: do not mark the sprint Complete, do not change registry status, next action is to perform and record verification.
```

- [ ] **Step 7.2: Verify**

Confirm the file exists, contains the 7-step read order table, the output format, the field source mapping, and the invariants section.

- [ ] **Step 7.3: Commit**

```bash
git add docs/startsession-profile.md
git commit -m "docs: add THLabs-native startsession profile documentation"
```

---

## Sprint Closure

- [x] All task checkboxes above are checked, or explicitly marked deferred with a reason
- [x] Verification Record — **not applicable**: sprint type is `docs/governance`; ADR-006 deployment verification exit condition does not apply
- [x] Drift reconciliation pass complete — the only drift item (architecture.md §6) was resolved in Task 3
- [x] `docs/status.md` Active State and `docs/roadmap.md` updated
- [x] `Complete (with caveats)` caveats recorded in roadmap deferred or status.md Accepted Limitations — or: n/a

**Closed:** 2026-05-22 — All 7 tasks completed and committed; ADR-006, glossary, drift reconciliation, Sprint 3 governance artifacts, operational verification, Active State pointer, and startsession profile all in place. Task step checkboxes were not marked in real-time by subagents; completion is evidenced by commits 60696a5–0a3c4e3.
**Outstanding at close:** none
