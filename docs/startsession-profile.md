# THLabs Startsession Profile

This document defines the THLabs-native read order and output format for the `startsession` skill. It replaces the Personal OS default profile for this project.

## Personal OS plugin note

`startsession`/`endsession` are provided by the shared Personal OS plugin (delivered via the
machine-level `~/.claude/skills/` directory junction, not a local copy), so the Bootstrap
Precondition (Session Integrity Verification, Personal OS Sprint 0025) runs automatically here
too — this project's read order and output format below only replace what happens *after* that
phase.

This profile predates Sprint 0025. Session Integrity's behavior under this project-specific
profile (in particular whether the checkpoint-consistency check finds a meaningful source, given
that this profile does not read `docs/sessions/`) has not been verified by an actual
`/startsession` run since that phase was introduced. This is a known, deliberate follow-up — not
a defect — to confirm the next time this project is actively worked on.

## Read order (7 steps)

| Step | File | What to extract | Why |
|------|------|----------------|-----|
| 1 | `CLAUDE.md` → `AGENTS.md` | "Read `node_modules/next/dist/docs/` before writing Next.js code" | Establishes the hard procedural gate before any file is read as actionable |
| 2 | `docs/architecture.md` | §1 vision, §2 principles, §3 visibility model, §6 platform structure (compare against status.md — drift candidate), §8 glossary | Loads canonical vocabulary; §6 flagged for drift cross-check in step 7 |
| 3 | `docs/roadmap.md` | Active sprint name and status; "Outstanding:" or `Awaiting Verification` lines; next priorities | Identifies which spec+plan pair to open in step 4 |
| 4 | Newest date-prefixed spec + plan in `docs/superpowers/` | Spec H1 heading (→ `sprint:`); plan `sprint type:`, `sprint status:`, first unchecked task (→ `recommended next task:`) | ADR-005 resume anchor — reconstructs mid-sprint state without chat history |
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
| `sprint:` | Active spec H1 heading (step 4); cross-check with roadmap.md sprint name (step 3) |
| `sprint status:` | Plan header `**Sprint status:**` field (step 4); confirm against roadmap.md phrasing (step 3) |
| `sprint docs:` | Newest date-prefixed pair in `docs/superpowers/` (step 4) |
| `deployment health:` maturity | `lib/projects.ts` `status` field per entry (step 5) |
| `deployment health:` operational note | `docs/status.md` Deployment table Status column (step 6); reconcile against step 5 |
| `auth boundaries:` | `docs/status.md` Authentication section (step 6) |
| `open questions:` | `docs/status.md` Known Gaps + roadmap.md Outstanding lines (steps 6, 3) |
| `high risks:` | Known Gaps Drift items + drift found in step 7 cross-check |
| `recommended next task:` | Plan first unchecked task (step 4), else status.md priority 1 (step 6), else roadmap.md next priority (step 3) |
| `detected drift:` | Three-way cross-check: architecture.md §6 vs status.md Deployment vs lib/projects.ts (step 7) |

## Field completeness criteria

Every field has an existing THLabs source. No field requires N/A for a normal THLabs session.

| Field | Degraded (source missing or stale) | Handling |
|-------|------------------------------------|----------|
| `sprint:` | Name derived from filename only; disagreement with roadmap | Flag as detected drift |
| `sprint status:` | Plan and roadmap imply different phases | Flag as detected drift |
| `sprint docs:` | Only one of the spec/plan pair exists | Flag as detected drift — ADR-005 requires both |
| `deployment health:` | Registry and status.md disagree | Appear in note field AND detected drift |
| `auth boundaries:` | Private project missing from status.md Authentication | Flag as detected drift — ADR-003 requires boundary documentation |
| `open questions:` | `none` while Known Gaps lists open items | Flag as detected drift |
| `detected drift:` | `none detected` without performing step 7 cross-check | Invalid — cross-check is required |

## Invariants

- `deployment health:` has one row per `lib/projects.ts` entry — no entries omitted, no entries invented.
- `sprint status: Awaiting Verification` means: do not mark the sprint Complete, do not promote registry `status` to `'live'`, next action is to perform and record the Verification Record (see ADR-006).
- `detected drift: none detected` is only valid if step 7's three-way cross-check was actually performed.
- The sprint state vocabulary (`In Progress`, `Blocked`, `Awaiting Verification`, `Complete`, `Complete (with caveats)`) is defined in ADR-006.

## Worked example

Output for the THLabs session state as of 2026-05-22:

```
project:          THLabs
date:             2026-05-22
branch:           main

sprint:           Sprint 3 — Sea Trout Log Deployment
sprint status:    Awaiting Verification
                  (code complete; post-deploy verification not yet performed)
sprint docs:      spec=docs/superpowers/specs/2026-05-17-sprint3-sea-trout-log-deployment-design.md
                  plan=docs/superpowers/plans/2026-05-17-sprint3-sea-trout-log-deployment.md

deployment health:
  THLabs:         live @ https://thlabs.dk
                  confirmed live
  Sea Trout Log:  development @ https://trout.thlabs.dk
                  unconfirmed — registry status:'development'; Verification Record not yet filled

auth boundaries:
  thlabs:         Supabase magic-link OTP, SSR cookie session (@supabase/ssr);
                  no global middleware — private routes gated by inline getUser() check. Live.
  havorred-log:   separate Supabase project (no session sharing with thlabs);
                  magic-link OTP, shouldCreateUser:false, global middleware gating all routes
                  except /login + /auth/callback. Deployment unconfirmed.

open questions:   1 unresolved
                  [BLOCKING] Is trout.thlabs.dk live and operational?
                  — gates Verification Record completion and Sprint 3 closure.

high risks:
  - Sprint 3 deploy may have failed silently; no health checks or uptime monitoring (Accepted Limitation).
  - lib/projects.ts Sea Trout Log status:'development' will remain stale until verification passes.

recommended next task:
  Verify trout.thlabs.dk is live: visit in a private window, run the 8-item Verification
  Checklist in the Sprint 3 plan, fill in the Verification Record. On PASS, update
  lib/projects.ts STL status to 'live'.
  (Source: Sprint 3 plan Verification Checklist; status.md Immediate Technical Priorities #1–2)

detected drift:
  none detected
  (architecture.md §6 now lists both repos; status.md Known Gaps Drift section is empty;
  lib/projects.ts correctly shows STL status:'development' pending verification)
```
