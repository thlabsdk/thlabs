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

**Carry-forward rule:** Any sprint closed as `Complete (with caveats)` MUST record all unresolved caveats in either `docs/roadmap.md` deferred work or `docs/status.md` Accepted Limitations before closure is valid. Caveats must become durable operational knowledge, not ephemeral closure notes.

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
