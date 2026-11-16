# Protocol Core testing and release

- Build canonical TypeScript types and run repository unit tests.
- Validate the HTTP envelope and repository schemas using positive/negative fixtures.
- Exercise persistent server commit, branch, merge, conflict and restart behavior.
- Verify all Cloud-only methods are rejected by a Core-only implementation and
  all unsupported capabilities are advertised as false.
- Cross-test the same Core API through CMP Client against self-hosted and Cloud.
- Before publication, create a new history from audited files. Inspect dependencies,
  workflows, committed secrets, binary assets, package tarballs and released tags.
- Do not report Cloud services as shipped until a deployed Cloud endpoint advertises
  them and an authenticated E2E test succeeds.
