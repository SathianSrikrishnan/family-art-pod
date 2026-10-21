# Parent trial recovery and onboarding

Owner requested steps 1 and 2 of the roadmap: make the flow understandable, recover existing artwork independently of browser storage, test privacy and failure paths, prepare a small parent trial.

Chosen approach: read-only discovery of dedicated app folders under declared Pod roots. A browser cache is a hint only. Exact direct-child UUID naming plus owner Control and private inheritance checks exclude unrelated/shared folders. A sole verified folder opens automatically; multiple folders require a choice. Discovery failure disables creation/upload rather than treating the Pod as empty. No app database or profile-write registry is introduced. Alternative approaches (local cache only, writing an index into profiles) respectively fail fresh-browser recovery or expand writes beyond the app folder boundary.

The parent sees connect, add, share, invitation, make private. Recipient identity instructions use the provider's Copy WebID control. Invitations expose a copyable fallback if clipboard access fails. Failed batches report how many photos were saved; upload remains disabled without a verified collection. Recipient opening remains disabled until signed in.

Validation: Node DOM tests cover fresh storage, stale foreign cache, multiple folders, offline/retry, first-time setup, sign-in failure, invitation handling, denied access, invalid upload, and missing storage declarations. The optional real local CSS verifier uses distinct synthetic identities and current core modules to exercise recovery, private upload, selected/unselected read, write/ACL denial, upload failure, revocation and owner preservation.

No claim of broad hosted compatibility. A new hosted recovery acceptance and candidate hosted share/revoke remain release gates. See PARENT-TRIAL.md.
