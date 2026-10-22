# Verification — October 21, 2026

## Parent trial candidate (codex/parent-trial-recovery)

Hosted acceptance exposed a text/html Pod root; the revised candidate adds an owner-only Pod index plus a one-time legacy-folder restore. This supersedes the earlier assumption that root listings alone suffice. Private index reads/writes and simultaneous updates passed real local CSS checks.

Updated candidate hosted acceptance now passed: owner restored the original three-drawing folder once, shared one sample with the separate test recipient, revoked it, then reloaded/reconnected and recovered the original folder from the Pod index. All three drawings remain private and loaded for the owner. Recipient index/unselected reads were denied 403; signed-out library/index/photo reads were denied 401. This was a same-browser hosted reconnect; browser cache removal was blocked by browser policy and not bypassed. Empty-cache behavior is covered by automated tests. Recipient readback used its existing public viewer session; parent permission changes used the candidate.

- 23 automated tests pass: cache-free recovery, stale/foreign cache rejection, multiple-folder selection, failed listing and retry, first-time setup, signed-out recipient gating, callback invitation handling, denied reads, invalid uploads, missing storage declarations, URL validation, and blocking photo transmission without editable WAC permissions.
- Current core plus recovery passed eight real local CSS checks with distinct synthetic identities: recover existing collection, private upload, selected-only exact-byte read, photo-write and ACL-write denial, failed upload, revoked GET/HEAD, intact owner access.
- Actual browser preview at localhost:8775 connected to the existing synthetic CSS account, discovered existing folders without an app collection cache, opened a recovered folder and uploaded a sample privately. Local CSS does not declare pim:storage in this lab's profile; the explicit storage-address fallback was exercised.
- Build succeeds; npm audit reports no known vulnerabilities. jsdom is development-only and is not bundled into the browser app.
- Earlier public hosted release was tested with two distinct Private Data Pod identities: selected drawing visible, two unselected drawings denied, revocation automatically removes the image, reopening returns 403, owner retains all three. Exact private locators and screenshots remain in the local lab evidence, not this repository.
- Remaining release gate: check a real phone. A truly fresh hosted browser is an additional useful acceptance pass; only automated empty-cache behavior and same-browser hosted reconnection have passed. A second hosted provider is not verified. The trial guide deliberately limits provider claims.

See [parent trial](PARENT-TRIAL.md). Historical initial-publication notes below describe the preceding release, not the candidate's verification gaps.

## Historical initial release

- Public parent and community routes serve browser assets over HTTPS, with no app-side family database or server-held Pod credentials.
- Owner completed free Pod signup and app consent at Private Data Pod. Provider sign-in, storage discovery, a dedicated owner-only WAC collection and a sample-art JPEG upload succeeded through the public app.
- The same collection and uploaded file appear in the provider's own authenticated file browser. This is evidence of provider-side storage outside the artwork app, not a general third-party-client interoperability claim.
- An independent unauthenticated request to the uploaded sample returned HTTP401. The sample remains private. No real child photo or public Pod locator is included in this repository.
- The originating local Community Solid Server lab separately passed six checks covering selected read-only sharing, write denial, unselected artwork denial and revocation. These are not yet a hosted two-person community-sharing acceptance test.
- Standalone source: npm test and npm run build pass; npm audit reports0vulnerabilities at initial publication. GitHub Check browser app passed on86d0173.
- Owner reported a transient OIDC-consent error; subsequent browser readback confirmed successful sign-in and storage operations. No certificate, authentication, origin or authorization checks were disabled.

Still to verify: a second real community identity, more providers, collection recovery after browser-storage loss, and independent apps using the artwork representation.
