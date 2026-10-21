# Small parent trial

Start with 3–5 adults and sample drawings. Each parent and recipient needs their own Solid account. No real child names, faces or location details for the first pass. The app does not redact visible writing in a photo.

## Before inviting anyone

- Review and approve the candidate build for release; the existing public app has not been replaced by this branch.
- On the candidate release, verify a fresh-browser recovery against Private Data Pod with the existing owner collection. Reconnect as the parent, not the test recipient. Confirm the same three drawings and no new folder.
- Repeat the hosted share/revoke check on the candidate. The earlier hosted build passed this; the revised build has real local CSS checks, not a fresh hosted acceptance yet.
- Check phone layout on a real phone and note provider/browser versions. Other hosted providers remain unverified.
- Keep the previous deployment available for rollback. Send no invitations until these gates pass.

## Give the parent this task

“Save a sample drawing privately. Share it with one adult, then make it private again. Come back from another browser and find the drawing.”

They should be able to:

1. Create/verify a Pod account if needed, return and choose Connect my Pod. Review the provider's permission screen. Family Art asks to know the WebID and work with app data in the Pod.
2. Use the recovered artwork folder, or create one if this is their first visit. If several existing app folders are found, choose one. A provider that does not declare storage needs its storage address copied from its account page.
3. Choose one JPEG, PNG or WebP up to 10 MB. Confirm it appears private.
4. Ask the recipient for their WebID (Copy WebID in their Pod account). Paste it beside the drawing and select Share drawing.
5. Copy the invitation and send it themselves. The recipient connects their invited account, opens the drawing, and confirms it is visible.
6. Select Make private. The recipient's viewer removes the drawing on its next access check; reopening should be denied. Previously downloaded copies remain with the recipient.
7. Reconnect from a fresh browser. The app discovers the collection from the Pod; it does not need this browser's old folder cache.

## Record only what helps improve the app

Use participant codes (P1–P5), task completion, time, where help was needed, device/browser/provider and exact error wording with private URLs removed. Do not collect passwords, tokens, child photos or full WebIDs in shared notes. Do not add analytics just for this trial.

Success: each participant completes save/share/revoke/recovery without a live walkthrough; unselected work remains inaccessible. A privacy-boundary failure pauses the trial. Confusion is a product finding, not a participant failure.

## Limits to explain

One recipient per drawing; sharing with another replaces the earlier recipient. WAC only; ACP-only upload is blocked. Provider operators remain trusted; this is not end-to-end encryption. No payment, auction or public gallery. Folder discovery covers direct `family-art-UUID/` folders with private owner-controlled ACLs, including the original app's folders. Renamed/moved folders, inaccessible listings or externally changed ACLs can require help. The app never repairs root or unrelated folder permissions during recovery.
