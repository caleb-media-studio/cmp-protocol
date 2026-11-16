# Implementation-neutral architecture

CMP Core defines the knowledge/commit API and content model. A context
repository can exist without a source-code repository and can cite external
evidence without installing a connector.

CMP Server is a self-hosted implementation of Core with local persistence.
CMP Cloud is a private implementation of Core with a managed Cloud identity
and an expanded backend. CMP Client is a public interoperable SDK with optional
Cloud-only request adapters. cmp-web is a private-source public website.

No public implementation should import or ship Cloud service source.
The server must not require WSS, Cloud OAuth, agent communication or archives.
