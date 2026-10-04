# Revizy LP1 API Worker

This is the source of truth for `https://revizy-lp1-api.3nizou.workers.dev/`.

## Required Cloudflare Worker secrets

Set these in Cloudflare **Workers & Pages → revizy-lp1-api → Settings → Variables and Secrets** as **Secrets** for Production:

- `TURNSTILE_SECRET_KEY`
- `PUSHOVER_APP_TOKEN`
- `PUSHOVER_USER_KEY`

Never add these values to `wrangler.jsonc`, browser code, or Git.

## Deploy

From this folder, after authenticating Wrangler:

```sh
npx wrangler deploy
```

The Worker saves a verified request to D1 first. It queues Pushover only after that successful write, so a notification outage cannot affect the parent-facing success flow.
