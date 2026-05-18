# 005 — AI-Assisted Development Workflow

## Context

THLabs development is conducted primarily with AI-assisted tooling (Claude Code). AI sessions start without prior context and must reconstruct intent from repository state. Without structured context, sessions lose continuity across work intervals and make inconsistent architectural decisions.

## Decision

Each sprint follows a two-document pattern stored in `docs/superpowers/`:

1. **Design spec** (`docs/superpowers/specs/`) — captures architectural decisions, UI design, scope constraints, and rationale before implementation begins. Human-authored or human-approved. The authoritative statement of intent for the sprint.
2. **Implementation plan** (`docs/superpowers/plans/`) — task-by-task breakdown with verification steps, suitable for agentic execution. Derived from the spec. Each task is independently committable.

Specs are written and approved before implementation. Plans are derived from specs, not the other way around. Architecture decisions made during implementation belong in a new ADR, not silently embedded in code.

## Consequences

- AI sessions can resume mid-sprint by reading the relevant spec and plan without requiring chat history.
- Architectural intent is captured in documents, not only in git history or commit messages.
- Implementation plans may diverge from actual code as work proceeds — the spec is the authoritative record of intent; actual implementation details belong in code and commit messages.
- This workflow enforces small, focused sprints. Vague multi-feature prompts are a process failure, not a starting point.
