# Revizy LP1 API Worker

This is the source of truth for `https://revizy-lp1-api.3nizou.workers.dev/`.

## Required Cloudflare Worker secrets

Set these in Cloudflare **Workers & Pages → revizy-lp1-api → Settings → Variables and Secrets** as **Secrets** for Production:

- `TURNSTILE_SECRET_KEY`
- `PUSHOVER_APP_TOKEN`
- `PUSHOVER_USER_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Never add these values to `wrangler.jsonc`, browser code, or Git.

## Deploy

From this folder, after authenticating Wrangler:

```sh
npx wrangler deploy
```

The Worker saves a verified request to D1 first. It queues Pushover only after that successful write, so a notification outage cannot affect the parent-facing success flow.

## Private lead dashboard

Open `https://revizy-lp1-api.3nizou.workers.dev/admin` and enter the `ADMIN_USERNAME` and `ADMIN_PASSWORD` values when the browser prompts you. The dashboard lists LP1 requests newest first and offers a **تواصل عبر واتساب** button with a prefilled Revizy follow-up message.
