# CMP repository identity contract, Core v1 (M1)

## Canonical identity

All client-facing CMP repository IDs use `owner/name`. An identifier names a
repository but **never grants authorization**. The transport/backend must enforce
access separately. CMP Cloud keeps its real organizational/account owner;
development-only self-hosted CMP Core supports the reserved `local` namespace.
Its embedded/offline client similarly uses `local/name`, independently of the
self-hosted server's SQLite database.

The Core reference implementation retains flat persisted keys `name` under
SQLite. A public `local/name` is translated to the existing `name` key
without migrating database records or event log keys. The `local` namespace
is not a Cloud tenant or authenticated principal.

Core v1 `name` is 2–64 lowercase ASCII letters, numbers, underscore or
hyphen, beginning with a letter or number:
`[a-z0-9][a-z0-9_-]{1,63}`. Other implementations may advertise broader
names but must not interpret an invalid Core name as a different resource.

## HTTP and RPC

- `POST /v1/repos` with `{"id":"local/project"}` creates/reuses the
  existing flat key `project`; the returned `id` is canonical.
- `GET /v1/repos` returns canonical IDs, including existing SQLite rows.
  `GET /v1/repos/local%2Fproject/head?branch=main` treats
  `local%2Fproject` as **one path segment** and decodes **exactly once**.
- The same encoded form applies to repository records, branches, commits,
  diffs, merges and events. Query arguments `branch`, `from`, `to`,
  `ref` and `cursor` are individually URL encoded as query values.
- Unknown owners (`other/project`), raw nested path segments, percent
  encoding ambiguities, double encoding (`local%252Fproject`), malformed
  percent escapes, encoded dot/slash traversal and empty/extra name
  components must fail closed, generally HTTP 400. Unknown valid repositories
  return 404. A valid bearer token is still required.
- `GET /v1/capabilities` reports `repositoryIdentifier:"owner/name"` and
  `repositoryNamespace:"local"` for this Core edition. This is capability
  discovery, not an authentication grant.
- Core RPC/MCP `context.*` repository fields take the same canonical IDs
  and list canonical IDs. The `context.list` result is not permission metadata.

## Legacy compatibility

For backward compatibility, Core MAY accept historical flat names (e.g.
`project`) in existing `POST /v1/repos`, `/v1/repos/:repo/*` and
RPC/MCP `repo` parameters as a **deprecated local-only alias** for
`local/project`. Flat aliases must never imply additional namespaces,
change SQLite keys, or appear in new list/create metadata responses. New
clients must emit the canonical name. The reference Core's legacy aliases
are a temporary compatibility guarantee until an explicit versioned removal
plan and tooling are approved. No automatic destructive migration is allowed.

## CMP transport

The canonical JSON transport URL for self-hosted Core is
`/local/project.cmp` and its manifest and snapshot `repository` field
must read `local/project`. The `.cmp` suffix identifies CMP context
repository transport, **not** a Git smart HTTP repository. CMP Cloud URL
`https://cloud.cmp.chat/owner/name.cmp` remains independently authorized,
with the actual Cloud namespace.

## Verification

The machine-readable `identity.schema.json` and TypeScript validation
fixtures define the canonical `owner/name` format; Core-specific constraints
are additionally checked by the reference server. End-to-end verification
must include existing flat SQLite keys persisting after a restart, canonical
create/list/head/branches/commit/stale-CAS/snapshot/diff/events and the
`.cmp` manifest. In-memory or mock-server tests alone are insufficient.
