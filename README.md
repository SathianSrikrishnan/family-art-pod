# Family Art Pod

An early browser app by Sathian: keep artwork in your own Solid Pod, choose a community WebID that may read one drawing, and revoke that permission later.

- [Try the app](https://family-art-pod-sathiansrikrishnans-projects.vercel.app/)
- [Why this exists](https://sathian.ai/writings/keep-the-internet-open)
- [Project and evidence](https://sathian.ai/projects/family-art-pod)
- [Get a Pod](https://solidproject.org/get_a_pod)

## Try with sample artwork first

Connect your provider's sign-in URL, confirm the Pod storage root, create a private collection, then upload a JPEG, PNG or WebP up to10MB. The browser resizes and re-encodes it before sending it directly to the Pod, without an application storage backend. Visible names/writing in a drawing are not redacted.

Enter a community's WebID on a drawing and share it read-only. One selected community per drawing in this pilot; a new selection replaces the old grant. Copy the gallery link; the recipient must sign in as that WebID. A link contains a resource address, not a token or permission. Make private removes community grants on that app-managed drawing. Revocation cannot recall downloaded copies. The viewer checks access every five seconds.

The app creates a new dedicated collection and verifies owner-only WAC inheritance before any photo is uploaded. It does not change root-folder permissions. ACP-only Pods stop before upload. Permissions edited in another app on these app-managed resources may be overwritten here.

## Build

Requires Node22+ and npm. Run npm ci, npm test, npm run build. The dist folder contains only browser assets and static-host headers. npm run dev serves a local build at http://localhost:8775. For Vercel, deploy dist; no database, server-side family credentials, analytics or wallet is required.

## Evidence and limits

Six real Community Solid Server checks in the originating local lab verified private uploads, anonymous denial, selected read-only access, unselected work remaining private and revocation with owner access preserved. Browser sign-in/upload/share/revoke also worked against that local server. Public HTTPS app routes and headers are verified. Hosted-provider end-to-end testing and independent-client interoperability are still in progress; this is not a broad compatibility claim.

Reconnect after a page reload. Collection location is remembered per WebID in your browser; clearing browser storage removes that pointer, not Pod files. Recovery/browsing is future work. This is access control, not end-to-end encryption: the Pod host remains part of the trust model. No auctions, gifts, payments or returns are implemented. Not affiliated with or endorsed by Solid.

## Contribute

Useful contributions: reproducible provider compatibility reports using synthetic data, accessible onboarding, collection recovery, and an independent Solid client reading an intentionally shared sample. Do not put private Pod URLs, tokens, real child photos or account details in issues. Open an issue or propose a small pull request. MIT license; dependency licenses remain their own.
