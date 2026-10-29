# LP1 development log

## 2026-10-29 — Redirect saved requests to Google Play

- User instruction: WhatsApp is blocked; redirect parents to `https://play.google.com/store/apps/details?id=com.revizyapp` after entering their information. Commit and push this scoped landing-page change. Recorded in workspace `USER_PREFERENCES.md`; supersedes the WhatsApp draft and thank-you handoff.
- Keep the existing Worker/D1 lead capture, payload, plans, Moroccan phone validation, Turnstile and honeypot. Redirect only after HTTP success and `{ "ok": true }`; keep failed requests available for retry. Preserve the saved-lead analytics event without personal details.
- Replace WhatsApp instructions and the form icon with download guidance. The legacy thank-you page automatically opens Google Play and offers a download link. Increment the service-worker cache version for the updated app shell.
- Verification: 30 tests pass on the exact scoped source, including successful saves, pending responses, missing security token, server/network/JSON failures, unavailable browser storage and existing Worker notification tests. Full-page DOM verification covers validation, switching to three children, normalized phone, unchanged lead payload and the Play Store destination. Update the stale header-animation assertion to match the already-present, user-approved arrow video.
- Preserve unrelated local formatting, assets and the four pending website commits; push only the LP1 change. No database or Worker deployment is required.
