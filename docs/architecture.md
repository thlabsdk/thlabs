# THLabs Architecture

This document describes the architectural direction and design principles for THLabs. It is intended as a long-term reference for both human contributors and AI-assisted development sessions. It covers intent and principles, not implementation details.

---

## 1. Project Vision

THLabs is a minimalist experimental software lab and project hub. It exists as a place to build, ship, and index independent projects — each self-contained, each deployable on its own terms.

The goal is not a platform. It is a disciplined space for focused work, kept deliberately small.

---

## 2. Core Architecture Principles

**Separate repositories and deployments.**
Each project under the THLabs umbrella lives in its own repository and is deployed independently. THLabs does not absorb projects — it indexes them.

**THLabs as shell, auth gateway, and project index.**
The THLabs site serves three narrow purposes: present the lab publicly, gate access to private projects, and link out to individual projects. It does nothing else.

**No monolith.**
Projects are never merged into the THLabs codebase. Shared logic is not a reason to merge codebases. If something needs to be shared, extract it as a standalone package.

**Modular, low-coupling systems.**
Components and services should have minimal surface area between them. Dependencies flow in one direction. Nothing should be hard to replace.

**Simple over engineered.**
If a simpler solution exists, use it. Future flexibility is not a reason to add complexity today. Build for the problem at hand.

---

## 3. Project Visibility Model

Projects are either public or private.

**Public projects** are listed and accessible without authentication. Anyone can see them.

**Private projects** are hidden until a user has authenticated. They appear in the project index only after auth.

**Authentication stays lightweight.**
THLabs is not an identity platform. Auth exists only to gate private content. It should be implementable with minimal dependencies, easy to audit, and easy to replace. Avoid building a full user management system unless the requirements clearly demand it.

---

## 4. Design Principles

**Dark mode first.**
All UI is designed for dark mode. Light mode is not a requirement.

**Minimalist, technical aesthetic.**
The visual language should feel precise and considered. It should suggest craft and restraint, not marketing or branding.

**Restrained UI.**
Avoid animations, transitions, and decorative elements unless they serve a functional purpose. Motion should not be used to make things feel "alive" — it should communicate state.

**Typography and spacing over effects.**
Hierarchy is established through type size, weight, and spacing. Not gradients, shadows, or color fills.

**Borders over shadows.**
Use borders to define structure. Shadows add visual noise without improving clarity.

**No startup-marketing aesthetics.**
Avoid hero sections, bold taglines, call-to-action banners, or anything that reads as promotional. This is a lab, not a landing page.

---

## 5. Development Workflow

**Small iterative improvements.**
Features and changes are made in small, focused increments. Avoid large multi-feature branches. Ship one thing, then the next.

**Frequent commits and deploys.**
Committing and deploying often reduces risk, keeps the codebase honest, and surfaces integration issues early. A working deploy is the unit of progress.

**Clean architecture boundaries.**
Each layer of the system has a clear responsibility. Business logic does not leak into UI components. Data access does not live in route handlers. Keep boundaries explicit.

**AI-assisted development.**
When working with AI tools, keep context tight. AI sessions work best when given a well-scoped task, the relevant files, and clear constraints. Avoid vague prompts. This architecture document is an example of the kind of context that should be available to AI sessions — not a setup guide, but a statement of intent.

**Avoid overengineering.**
Do not design for hypothetical future requirements. Three lines of direct code is better than a premature abstraction. If something might be needed later, note it; do not build it now.

---

## 6. Current Platform Structure

| Repo | Purpose | Status |
|------|---------|--------|
| `thlabs` | Public shell, project index, auth gateway | Active |

The `thlabs` repo is a Next.js 16 application. It currently has pages for home, about, projects, and contact. It runs on React 19 with Tailwind CSS 4.

Future projects will be added as separate repositories and linked from the projects index.

---

## 7. Future Direction

These are not commitments — they are the likely shape of how THLabs grows.

**Shared auth layer.**
As more private projects are added, a lightweight shared auth mechanism will be needed. This should remain a thin layer — a token or session that multiple projects can verify — not a full identity service.

**Subdomains per project.**
Projects will likely live at `<project>.thlabs.dk`. THLabs itself stays at the root. Routing and auth checks may need to handle cross-subdomain concerns carefully.

**Growing project ecosystem.**
The projects page will grow to become the primary surface of THLabs. The design and data model for the project index should accommodate a reasonable number of entries with varied visibility states.

**Preserved separation.**
As the ecosystem grows, the temptation to consolidate will increase. The principle of separate repos and deployments should be actively maintained — not as dogma, but because the cost of coupling across projects consistently outweighs the convenience.

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
