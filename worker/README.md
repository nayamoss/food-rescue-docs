# Food Rescue HQ on Cloudflare Workers

Runs the same app as `artifacts/api-server/server.js`, without the Mac. State lives in D1.

- `index.js`: the Worker. Same routes as server.js, mounted on `express-shim.js` (wrangler aliases `express` to it, so the shared lib modules load unchanged).
- Each request loads the state document from D1 (`core.hydrate()`), runs the normal synchronous core logic, then saves once (`core.persist()`). A version check stops lost updates: if another instance saved in between, the request returns 409 and the page can retry.
- Outbound calls start after the save, through `ctx.waitUntil`.
- The cron (every minute) closes incidents whose safety window has ended.
- `/api/stream` returns 204. The page already polls `/api/state` every 3 seconds.
- `public/` is served as static assets with `Cache-Control: no-store`; `index.html`, `v.html` and `main.js` get versioned URLs per deploy, like the Node server.

## Deploy

```sh
cd worker
npx wrangler login
npx wrangler d1 migrations apply foodhq --remote   # first time, or after a new migration
npx wrangler deploy
bash smoke.sh https://<deployed foodhq URL>   # never places calls
```

D1 database: `foodhq` (id in `wrangler.jsonc`). Tables: `app_state` (the whole state document, phones included) and `activity_log` (feed copy, phone-like text hidden).

## Secrets

Set once per secret. The value is read from stdin, so it never appears in shell history:

```sh
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM_NUMBER
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put OPENAI_VISION_MODEL
npx wrangler secret put OPENAI_AGENT_MODEL
```

`SMS_ENABLED` and `PUBLIC_BASE_URL` are plain vars in `wrangler.jsonc`. `PUBLIC_BASE_URL` is the URL Twilio calls back on; when empty the Worker uses the hostname the request arrived on.

## Local run

```sh
npx wrangler d1 migrations apply foodhq --local
npx wrangler dev --port 8787
```

## Moving foodhq.namosdemos.site to the Worker

That hostname currently points at the Mac tunnel. When ready:

1. In the Cloudflare dashboard, DNS for `namosdemos.site`: delete the `foodhq` record (the tunnel CNAME).
2. Add to `wrangler.jsonc`: `"routes": [{ "pattern": "foodhq.namosdemos.site", "custom_domain": true }]`, and set `PUBLIC_BASE_URL` to `https://foodhq.namosdemos.site`.
3. `npx wrangler deploy`. Outbound calls pass their webhook URL from `PUBLIC_BASE_URL`, so nothing changes in Twilio unless its incoming messaging webhook is set to another host (then point it at `/sms/inbound`).
