# CMP Core and CMP Cloud: Source Ownership

Status: Architectural migration contract, November 16, 2026. Not yet released.

## Core rule

CMP Core is the public versioned context repository protocol. CMP Cloud is the
proprietary managed service implementing that protocol with additional capabilities.
A self-hosted CMP Server provides Core context APIs, not the Cloud services.

| Capability | Core/public candidate | Cloud/private |
| --- | --- | --- |
| Repository, record, evidence reference, commits, branches, history, merge | Yes | Yes |
| HTTP API and capability discovery | Yes | Yes |
| Operator-managed local access restriction | Yes | Optional |
| Managed OAuth, identities, organizations | No | Yes |
| CMP Connect and remote source onboarding/sync/indexing | No | Yes |
| WebSocket event streaming | No | Yes |
| Agent presence, messages, contracts, claims | No | Yes |
| Agent session archives, replay and context intelligence | No | Yes |

Knowledge-only CMP repositories are valid without source-code bindings.
Verified source-code identity is required for Cloud coding-agent coordination.

## Codebase ownership

- cmp-protocol: eventually public. Normative Core wire, records, HTTP methods,
  commits, branches, merges and capability negotiation. Cloud-only services
  must not become mandatory Core conformance requirements.
- cmp-server: eventually public. Headless Core storage and HTTP API, optional
  repository-only MCP compatibility. No Cloud Connect, WSS, agent work
  coordination, Cloud managed identity, or session archive backend.
- cmp-client: eventually public. SDKs and CLI for both Core and Cloud.
  Public client adapters may call proprietary Cloud APIs; they do not
  contain Cloud backend implementations. Optional features require discovery.
- cmp-cloud: private. Managed Core-compatible repository backend, organization
  identities, Connect, WSS, coordination, archives and context intelligence.
- cmp-web: private. Source code for public website and public documentation.

## Required safety and compatibility

- Core HTTP is the baseline transport; Cloud WSS is an optional extension.
- Advertise only capabilities genuinely available on the connected endpoint.
- Unknown Cloud-only methods are rejected on self-hosted Core servers.
- Managed Cloud authorization is not distributed in Core. A local Core server
  still needs sensible operator-controlled access restrictions.
- A Core record may include manually cited evidence; authenticated external
  source discovery/indexing belongs to CMP Connect, not the Core server.
- One public SDK must work against either endpoint for the Core features.
- A Cloud-only SDK method must not assume support because of URL or token shape.

## Release history policy

The current private repositories have mixed-feature Git histories. Ordinary
file removal or rebase does not remove old blobs reachable from earlier commits,
tags, releases or caches. Preserve original private histories, migrate code
first, and publish only audited clean-source histories after review.

## Checkpoints

1. Worktrees, ownership map and preservation of private development work.
2. Cloud service integration and parity tests for relocated private functions.
3. Core-only self-hosted server, no private-feature implementations.
4. Update public protocol specs, schemas and release contract.
5. Public client with Core HTTP and optional Cloud extension APIs.
6. Revise private cmp-web source and public product documentation.
7. Clean-history, dependency, secret and distribution audit.

Earlier v0.1 docs remain transition artifacts until all gates pass.
