# Sprint 4 — THLabs Governance Hardening

**Date:** 2026-05-22
**Status:** Approved

## Goal

Harden the existing cognition-governance primitives in THLabs so that operational truth becomes harder to misstate. Five targeted document and process changes close real operational gaps identified by a portability assessment. This is a governance-discipline sprint — not a migration, infrastructure, or feature sprint.

## Success condition

Operational truth becomes harder to misstate, specifically around:
- Deployment verification — a deployment sprint can only close when the URL is verified live
- Sprint closure evidence — closure is backed by a filled-in record, not an assertion
- Drift reconciliation — drift is categorized and cleared at sprint close, not passively logged
- Active operational state — there is always a single "you are here" pointer

## Scope

All changes are document and process discipline only. The only permitted code change is the STL `status` field in `lib/projects.ts` — conditional on Sprint 3 deployment verification passing.

| File | Change |
|------|--------|
| `docs/architecture.md` | Add §8 Glossary; fix §6 (add STL to platform table) |
| `docs/decisions/006-sprint-operational-verification.md` | New ADR |
| `docs/status.md` | Restructure Known Gaps; add Active State section |
| `docs/roadmap.md` | Correct Sprint 3 status |
| `docs/superpowers/plans/2026-05-17-sprint3-*.md` | Add Sprint Closure template + Verification Record stub |
| `lib/projects.ts` | Conditional: STL status 'development' → 'live' only if verification passes |

## What this sprint is NOT

- Not a Personal OS migration sprint
- Not a cognition infrastructure sprint — no checkpoints, session files, or governance DB
- Not a renderer portability framework sprint — no shared abstractions, no profile systems
- Not an automation sprint — the verification discipline is manual by design

---

## The 5 gaps and their resolutions

### Gap 5 — Canonical glossary

**Problem:** THLabs-specific terms (sprint, ADR, spec, plan, registry, `ProjectStatus` values, drift, Active State) have no written definitions, causing cold-start ambiguity for AI sessions.

**Resolution:** Add `## 8. Glossary` section to `docs/architecture.md`. A term-definition table covering 8 terms. Updated only when new governance vocabulary is introduced.

**Sequenced first** because every other gap references defined terms.

---

### Gap 3 — Deployment verification exit condition

**Problem:** A deployment sprint can be declared "completed" before the deployment is verified. Sprint 3 was declared completed in `roadmap.md` while its post-deploy checklist is entirely unchecked.

**Resolution:** New ADR-006 establishing deployment verification as a sprint exit condition.

Five sprint states:

| State | Meaning |
|-------|---------|
| `In Progress` | Implementation tasks executing |
| `Blocked` | Cannot proceed; blocker is named |
| `Awaiting Verification` | Code done; operational verification not yet recorded |
| `Complete` | Implementation done AND verification passed |
| `Complete (with caveats)` | Verification performed but with named failures/deferrals |

**Carry-forward rule:** Any sprint closed as `Complete (with caveats)` MUST record all unresolved caveats in either `roadmap.md` deferred work or `docs/status.md` Accepted Limitations before closure is valid. Caveats must become durable operational knowledge, not ephemeral closure notes.

Classification rule: A sprint is a "deployment sprint" if it (a) creates or changes an external deployment, (b) changes a project's auth boundary, or (c) changes registry `status`/`externalUrl`. Non-deployment sprints are exempt from the verification exit condition and state so in their Sprint Closure block.

**Sequenced second** because the closure discipline (Gap 2) references this ADR.

---

### Gap 4 — Drift reconciliation discipline

**Problem:** `docs/status.md` Known Gaps conflates two different things — "the docs lie" (drift, must fix) and "we chose not to build this" (accepted, fine). Currently passively logged forever.

**Resolution:** Split `## Known Gaps` into two labeled subsections:
- `### Drift` — doc disagrees with reality; must be reconciled at sprint close
- `### Accepted Limitations` — no current intent to close

**Drift reconciliation pass (at sprint close):** Every item under `### Drift` is either fixed (and removed) or explicitly re-justified in writing. `### Accepted Limitations` is untouched.

**Also closes the current drift item:** `docs/architecture.md` §6 is updated to list both repos (thlabs + havorred-log/STL), with a note deferring live-status to `status.md`. The item is removed from Drift once fixed.

**Sequenced third** so the Sprint Closure template (Gap 2) can reference the reconciliation pass.

---

### Gap 2 — Evidenced sprint closure

**Problem:** Sprints are declared "completed" by assertion in `roadmap.md`, not by evidence. Sprint 3's verification checklist is entirely unchecked.

**Resolution:** Add `## Sprint Closure` and `## Verification Record` sections to plan files. A sprint may only be called `Complete` in `roadmap.md` once the Sprint Closure block is filled in.

`## Sprint Closure` template:
```
- [ ] All task checkboxes above checked, or marked deferred with a reason
- [ ] Verification Checklist fully checked — or: sprint type is non-deployment (n/a)
- [ ] Drift reconciliation pass complete
- [ ] status.md Active State and roadmap.md updated
- [ ] Complete (with caveats) caveats recorded in roadmap deferred or status.md Accepted Limitations — or: n/a

Closed: <date> — <one-line evidence statement>
Outstanding at close: <none | explicit list>
```

`## Verification Record` (deployment sprints only):
```
Verified: —
Verified by: —
Environment: —
Result: —

| # | Checklist item | Result | Observed |
|---|----------------|--------|----------|
```

The `## Verification Record` stub is pre-allocated at plan authoring time so the artifact's expected location is known from the start.

**Application to Sprint 3:** Correct `roadmap.md` to reflect `Awaiting Verification`. Perform actual verification against `trout.thlabs.dk`. On PASS: flip `lib/projects.ts` STL status to `'live'`, fill in closure block. On FAIL: Sprint 3 stays `Awaiting Verification`.

**Sequenced fourth** as the integration step that exercises all prior changes.

---

### Gap 1 — Active-state pointer

**Problem:** A resuming AI session must cross-read three documents to infer the active sprint. No single "you are here" statement exists.

**Resolution:** Add `## Active State` as the first section in `docs/status.md`:
```
## Active State

- **Active sprint:** Sprint N — <name> (<spec path>)
- **Next action:** <verbatim from plan or priorities>
- **Last updated:** YYYY-MM-DD
```

Written at sprint open and sprint close. A pointer, not a log — holds exactly one current state. Updating it is an explicit checkbox in the Sprint Closure block.

**Sequenced last** so its first real value is accurate — written only after Sprint 3's state is settled by verification.

---

## THLabs-native startsession profile

The portability assessment confirmed that the current `startsession` skill works on document roles, not document paths. A THLabs-native profile is documented (not implemented as a shared abstraction) to guide THLabs-specific session starts.

**7-step read order for THLabs:**

| Step | File | What to extract |
|------|------|----------------|
| 1 | `CLAUDE.md` → `AGENTS.md` | Next.js conventions gate |
| 2 | `docs/architecture.md` | Vision, principles, §6 as drift candidate |
| 3 | `docs/roadmap.md` | Active sprint identification |
| 4 | Active spec + plan in `docs/superpowers/` | Sprint name, status, task ledger |
| 5 | `lib/projects.ts` | Typed deployment ground truth |
| 6 | `docs/status.md` | Operational state, auth boundaries, priorities |
| 7 | `docs/decisions/001–006` | ADR constraints; drift cross-check |

**Profile format:**
```
project:          THLabs
date:             YYYY-MM-DD
branch:           <branch>
sprint:           <Sprint name>
sprint status:    In Progress | Blocked | Awaiting Verification | Complete | Complete (with caveats)
sprint docs:      spec=<path> | plan=<path>

deployment health:
  <project name>:  <live | development | archived> @ <externalUrl>
                   <confirmed live / unconfirmed / etc.>

auth boundaries:  <one line per independently-authed system>

open questions:   <N — [BLOCKING] for those gating next task>
high risks:       <list or "none">

recommended next task:
  <verbatim from plan checklist > status.md priorities > roadmap.md>

detected drift:
  <cross-check findings or "none detected">
```

Documented as a reference file — not renderer infrastructure, not a shared abstraction.
