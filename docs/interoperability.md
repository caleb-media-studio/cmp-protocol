# Core interoperability

The required Core conformance workflow uses HTTP to create a repository,
commit a record conditionally, read the snapshot at an older revision,
create and compare branches, merge without data loss, and reject stale writes.

A local server must reject unknown Cloud-only method families and declare
connect=false, websocket=false, agentCoordination=false and
sessionArchive=false. Cloud implements the same Core methods with its own
managed identity and tenant isolation. Cloud feature extensions are tested
separately; their server implementation is not in the public repositories.
