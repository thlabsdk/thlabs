# 003 — Lightweight Auth Boundaries

## Context

THLabs gates private project pages. Individual projects (e.g. Sea Trout Log) have their own access control requirements. The question is how much auth infrastructure to build and whether sessions should be shared across subdomains.

## Decision

Each system maintains its own auth boundary using its own Supabase project. There is no cross-system SSO, no shared JWT signing key, no shared session cookies, no cross-subdomain cookie propagation.

THLabs gates its own private project pages with inline `getUser()` checks (no global middleware). Sea Trout Log uses a separate Supabase project with global middleware, magic-link OTP, and `shouldCreateUser: false` — only manually provisioned users can authenticate.

Auth is simple to audit and simple to replace because it is isolated per system.

## Consequences

- A session authenticated to THLabs grants no access to Sea Trout Log, and vice versa. The user authenticates independently to each system.
- Each Supabase project has its own auth schema, JWT keys, and user table.
- Manual user provisioning in STL is intentional — it is not a public-facing product.
- If multiple projects eventually require a shared thin session layer, that is a separate decision requiring new infrastructure, not an extension of the current model.
