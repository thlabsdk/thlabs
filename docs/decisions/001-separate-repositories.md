# 001 — Separate Repositories

## Context

THLabs is a project hub that indexes experimental systems. As projects accumulate, there is recurring pressure to consolidate code — shared UI, shared utilities, shared data access — into the `thlabs` repository.

## Decision

Each project under THLabs lives in its own dedicated repository. No project code is merged into `thlabs`. The `thlabs` repository contains only the shell, auth gateway, and project index.

THLabs's project registry (`lib/projects.ts`) is the only coupling point between THLabs and its projects: it stores metadata and links, not code. Adding a project means adding a registry entry and deploying the project independently.

If logic appears to be shared across projects, the default resolution is duplication. If duplication becomes genuinely untenable, the resolution is an extracted standalone package — not merging into `thlabs`.

## Consequences

- Each project has an isolated git history, CI pipeline, and release cadence.
- The `thlabs` codebase stays narrow and its scope stays legible.
- Projects can use different frameworks, runtimes, or infrastructure without affecting THLabs.
- Onboarding a new project is a registry entry change — no structural changes to `thlabs`.
