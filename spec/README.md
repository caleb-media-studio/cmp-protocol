# CMP Core v1: HTTP repository contract

Status: pre-alpha working contract, subject to interoperability testing.
CMP repositories are versioned knowledge containers, not Git source repositories.

## Minimum transport and discovery

- Baseline transport: HTTPS JSON. Development on loopback may use HTTP.
- GET /.well-known/context-management provides implementation, API transport,
  supported method families and capability discovery.
- GET /v1/capabilities returns explicit boolean capabilities for repository
  operations. It is not an authorization grant.
- Sensitive operations must be protected by a deployment-appropriate access
  control even if the self-hosted reference has no Cloud OAuth system.
- POST /v1/rpc accepts {method,params} and returns {result}. Unsupported methods
  return an explicit error. A Core endpoint does not implement agent, session
  or Cloud Connect method families.

## Core operations

| HTTP | Endpoint | Purpose |
| --- | --- | --- |
| GET | /v1/repos | List repositories |
| POST | /v1/repos | Create a repository |
| GET | /v1/repos/:repo | Repository metadata and heads |
| GET | /v1/repos/:repo/records?ref=main | Context snapshot |
| GET | /v1/repos/:repo/head?branch=main | Branch revision |
| GET | /v1/repos/:repo/branches | Branch pointers |
| POST | /v1/repos/:repo/branches | Create branch from ref |
| POST | /v1/repos/:repo/commits | Conditional versioned commit |
| POST | /v1/repos/:repo/merge | Merge context branches |
| GET | /v1/repos/:repo/diff?from=...&to=... | Record-level difference |
| GET | /v1/repos/:repo/events?cursor=0 | Historical repository mutation log, not a live stream |

Canonical client-facing identity uses owner/name; the reference Core supports local/name.
Core REST encodes local/name as a single parameter local%2Fname; flat SQLite keys
remain unchanged. See docs/canonical-repository-identity.md and spec/identity.schema.json.
Neither a local path nor an external Git URL grants access.

## Commit request and records

A commit request has branch, expectedHead, message, authorId and changes.
Changes are put(record) or delete(id). Compare the current branch revision
with expectedHead atomically; stale heads fail with HTTP 409 and no partial
commit. A successful commit is immutable and has parents, branch, author,
message, createdAt, changes and ID.

A knowledge record includes immutable record id, kind (fact, decision, episode,
instruction, evidence), Markdown content, status, sourceRefs, authorId and
updatedAt. Evidence references are descriptive, not an automatic permission
to fetch a private remote resource.

## Out of Core

CMP Cloud exclusively operates managed OAuth and organizations, CMP Connect
and external source credentials/indexing, WSS streaming, agent coordination,
and session archiving. These may have documented optional client APIs but
must not be required of a Core implementation or quietly included in Core.

## Schema and stability

Machine-readable contracts: wire.schema.json, repository.schema.json and identity.schema.json.
They are provisional until independent compatibility fixtures confirm matching
behavior across CMP Server, CMP Cloud and CMP Client.
