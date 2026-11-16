# CMP Core MVP release gates

This is the public Core MVP, not the complete CMP Cloud feature roadmap.

1. Run the self-hosted Core reference in a fresh environment with no Cloud credentials.
2. List/create repositories, read records and immutable snapshots, and commit
   new records through the HTTP API and one public client.
3. Verify compare-and-swap conflict rejection, branch creation, diff, merge,
   and storage survival across a restart.
4. Produce identical public Core request/response semantics from CMP Cloud
   and CMP Server, including unknown-method and unsupported-feature errors.
5. Expose optional core-only MCP methods without any Cloud session headers.
6. Keep sensitive write operations protected by a safe local operator access
   boundary. Production security review is still required before deployment.
7. Publish schema fixtures, cross-version tests, docs, examples and licenses.
8. Validate published Git history and packages contain no Cloud-only backend
   code, private source or secrets.

CMP Connect, managed OAuth, WebSocket agent streaming, coordination and
session archives belong to CMP Cloud and cannot block the public Core MVP.
