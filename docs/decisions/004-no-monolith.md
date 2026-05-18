# 004 — No Monolith

## Context

As more projects are added to THLabs, there is natural pressure to consolidate: shared UI components, shared API routes, shared data access patterns, or a shared runtime that hosts project applications behind THLabs routing.

## Decision

THLabs does not host project applications, proxy project routes, or import project-specific logic. The `thlabs` codebase is permanently scoped to: shell, auth gateway, project index.

Projects are linked from THLabs, not embedded in it. The `externalUrl` field in the project registry is the handoff mechanism — a link, nothing more.

## Consequences

- THLabs remains a narrow system with a legible, bounded scope.
- Each project evolves independently — stack choices, data models, and UI patterns are not constrained by THLabs conventions.
- There is no shared routing layer, shared component library, or shared runtime to maintain.
- The temptation to consolidate will increase as the ecosystem grows. This decision should be actively maintained, not passively assumed.
