# CMP Protocol

**Enterprise Self-Hosted is planned:** Paid proprietary modules will require CMP-issued signed licenses and will not relicense or gate Apache-2.0 Core. [Enterprise edition](docs/enterprise-self-hosted.md). Cloud-only managed Connect, WSS agents and archives remain Cloud-only.


## Public source versus proprietary CMP Cloud

The Core protocol, self-hosted Core server, and CMP client SDKs are
Apache-2.0 licensed. **CMP Connect, managed authentication, WebSocket
streaming, agent coordination, and session archives are proprietary CMP Cloud
services, not part of the self-hosted server.** The CMP Web source repository
is private. See [Public vs. proprietary](docs/public-vs-proprietary.md),
[LICENSE](LICENSE), and [Security](SECURITY.md).


CMP (Context Management Protocol) is an interoperable standard for persistent,
versioned context repositories. The public Core specification covers knowledge
records, immutable context commits, branches, snapshots, diffs, merges and
conditional writes. It is not source-code hosting.

This codebase is public-source, in pre-alpha, and not production-certified.

## What Core includes

- JSON over HTTP, capability discovery and an optional constrained MCP bridge.
- Context repository creation and listing, records, snapshots and commit heads.
- Compare-and-swap writes, branches, diffs, merge/conflict semantics and history.
- References to evidence the author or agent can supply, without remote source
  ingestion, provider credentials or external service management.
- An implementation-neutral Core specification and sample TypeScript library.

## What Core does not include

CMP Connect, Cloud-managed authentication, organizations, WebSocket streaming,
agent presence/messages, work coordination, session archiving and context
intelligence are CMP Cloud services, not self-hosted Core requirements.

The public CMP Client may still include optional API callers for these Cloud
services. Publishing a client API is not publishing the private backend.

See spec/README.md for the HTTP contract, docs/mvp.md for release gates,
and docs/product-editions-and-source-ownership.md for ownership.

## Development

Requirements: Node.js 24+, pnpm.

    pnpm install --frozen-lockfile
    pnpm build
    pnpm test

Project family: cmp-protocol (Core specification), cmp-server (Core
self-hosting), cmp-client (public Core and Cloud API clients), cmp-cloud
(private hosted platform) and cmp-web (private website source).

Status: pre-alpha protocol. No published package or production certification.
