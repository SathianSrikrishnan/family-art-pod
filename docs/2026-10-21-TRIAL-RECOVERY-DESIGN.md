# Parent trial recovery and onboarding

Owner requested steps 1 and 2 of the roadmap: make the flow understandable, recover existing artwork independently of browser storage, test privacy and failure paths, prepare a small parent trial.

Chosen approach: read-only discovery of dedicated app folders under declared Pod roots. A browser cache is a hint only. Exact direct-child UUID naming plus owner Control and private inheritance checks exclude unrelated/shared folders. A sole verified folder opens automatically; multiple folders require a choice. Discovery failure disables creation/upload rather than treating the Pod as empty. No app database or profile-write registry is introduced. Alternative approaches (local cache only, writing an index into profiles) respectively fail fresh-browser recovery or expand writes beyond the app folder boundary.

The parent sees connect, add, share, invitation, make private. Recipient identity instructions use the provider's Copy WebID control. Invitations expose a copyable fallback if clipboard access fails. Failed batches report how many photos were saved; upload remains disabled without a verified collection. Recipient opening remains disabled until signed in.

Validation: Node DOM tests cover fresh storage, stale foreign cache, multiple folders, offline/retry, first-time setup, sign-in failure, invitation handling, denied access, invalid upload, and missing storage declarations. The optional real local CSS verifier uses distinct synthetic identities and current core modules to exercise recovery, private upload, selected/unselected read, write/ACL denial, upload failure, revocation and owner preservation.

No claim of broad hosted compatibility. A new hosted recovery acceptance and candidate hosted share/revoke remain release gates. See PARENT-TRIAL.md.

## Hosted acceptance finding and repair

The first candidate authenticated successfully against Private Data Pod, but its root returned text/html despite a Turtle request. Root-listing discovery therefore cannot recover older folders on that provider. It failed closed and created no duplicate.

The revised candidate saves folder references in `family-art-library-v1/index.json` inside a dedicated owner-only app collection. The library ACL and private inheritance are verified before any folder address is written. The index records schema version, owner WebID and validated app-folder URLs; it has no image bytes, tokens or credentials. It is read before attempting a root listing, and conditional writes prevent simultaneous tabs losing each other's entries. No Pod-root/profile ACL changes.

Older UUID folders on a provider with an HTML root require a one-time restore using the existing folder address, validated against the declared Pod root and owner-only collection permissions. That creates the private index for later cache-free recovery. New parents create their artwork folder and index together. No fallback treats a failed request as an empty Pod. The HTML-root path offers explicit restore or explicit new-folder creation.

Real CSS verification now has eight checks including index privacy and simultaneous index updates. DOM/unit coverage now has 23 checks including bypassing an HTML root after index registration. The updated hosted candidate still needs owner consent and its one-time restore check.
