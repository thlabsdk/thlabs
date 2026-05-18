# 002 — Independent Deployments

## Context

THLabs and its projects share a domain namespace (`thlabs.dk`, `trout.thlabs.dk`) but have distinct operational needs. Questions arise about whether to share a Vercel project, a monorepo build, or any deployment infrastructure.

## Decision

Each system is deployed as a separate Vercel project with its own build pipeline, environment variables, and deployment lifecycle. No shared build tooling. No monorepo deployment coordination.

The handoff from THLabs to an external project is a URL. THLabs renders an "Open project →" link to `externalUrl`. Nothing is proxied, server-rendered cross-deployment, or framed.

## Consequences

- A deploy to `havorred-log` cannot affect `thlabs.dk`. A broken THLabs deploy cannot take down Sea Trout Log.
- Each system can be rolled back, scaled, or retired without coordinating with the other.
- Environment variables, secrets, and infrastructure configuration are isolated per deployment.
- There is no shared deployment state to lock or coordinate.
