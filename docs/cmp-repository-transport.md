# CMP repository URL transport (`.cmp`), version 1

An address such as `https://cloud.cmp.chat/owner/repository.cmp` identifies a **CMP context repository**. It is **not Git or a bare Git repository**, and must never claim compatibility with Git smart HTTP, packfiles, Git refs, or Git tooling. Git remains optional and independent.

Every `.cmp` request uses the same identity, tenant authorization, and compare-and-swap commit semantics as Core `/v1/repos/{encoded-owner%2Frepository}`. Public context must never be served through unauthenticated discovery just because a repository is marked public; the serving edition must explicitly support public-read authorization.

## HTTP resources

| Request | Response |
| --- | --- |
| `GET /owner/repository.cmp` | `manifest` (transportVersion, name, default branch, current head, capabilities, links) |
| `GET /owner/repository.cmp?view=refs` | `refs` containing repository branch heads |
| `GET /owner/repository.cmp?view=snapshot&ref=main` | Snapshot records, resolved revision hash and ref |
| `POST /owner/repository.cmp` | A Core commit request with `branch`, `expectedHead`, `authorId`, `message`, and `changes`; returns Core commit result |

Requests and results use `application/json`, require appropriate bearer authentication, and return `Cache-Control: no-store`. Unknown `view` values return 400. Write requests keep the server's Core record limits and return HTTP 409 on stale branch heads. All values in query strings are percent encoded. The `.cmp` suffix is a transport address, not a local file format.

Self-hosted CMP Core v1 supports `/local/<name>.cmp` for the canonical
`local/name` identity, while its persisted SQLite repository key remains the
unchanged flat `name`. The same external ID is returned by Core REST and
`.cmp` manifests. CMP Cloud uses `/owner/name.cmp` and independently
enforces tenant-specific access. See `docs/canonical-repository-identity.md`.

## Clone and security

A client can resolve the manifest, refs and a branch snapshot to materialize a local `.cmp/state` repository. Branch-specific history may not be available from snapshot-only clones; clients must clearly label these clones as snapshot imports, not complete history mirroring. A remote transport origin should remain recorded separately from local records. A clone must not silently enable streaming or write operations.

Cross-origin redirects must not be allowed to forward bearer credentials to untrusted hosts. Ref, repository and branch identifiers must be validated before constructing network paths. Native local/offline mode never makes network calls unless the user explicitly requests a remote command or enables streaming.

## Future capabilities

The first version is a JSON-based, bounded snapshot and CAS commit transport. Incremental history exchange, binary bundles, partial clone, resumable transfer, signatures, collection negotiation, content-addressed compression and push mirroring require separate capability negotiation and protocol versions.
