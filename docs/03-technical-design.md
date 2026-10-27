# Food Rescue HQ: Technical Design

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Optimized for a 4-hour build on Replit. Fewest moving parts wins.

## 1. Stack

| Layer | Choice | Reason |
|---|---|---|
| Host | Replit (one Repl, one public URL) | Required, gives the Twilio webhook a public URL instantly |
| Server | Node.js + Express | Smallest path to webhooks, static page, and SSE |
| Frontend | Single static HTML + vanilla JS + CSS (no framework) | No build step, nothing to break |
| Live updates | Server-Sent Events at `/api/stream` | Simpler than WebSockets, one-way is enough |
| State | In-memory objects, written to `data/state.json` on every change | Survives a Repl restart, no database setup |
| SMS | Twilio Messages API (outbound), webhook with TwiML (inbound) | Required |
| Text to speech | ElevenLabs TTS (optional) | P2 |

Verify current SDK package names and call signatures in each vendor's docs before coding (the Twilio SDK has changed major versions in the past).

## 2. Architecture

```
Browser (dashboard + report form)
   |  POST report                        ^ live updates (SSE)
   v                                     |
Replit: Express server  <---- POST /webhooks/twilio ----  Partner phone (SMS)
   |                                                            ^
   +---------- Twilio Messages API (alerts, confirmations) -----+
   +---------- ElevenLabs (optional announcement audio)
```

> Naming note: the prompt pack and `15-work-split.md` use `assignments`, and incident statuses `open`, `in_progress`, `resolved`, `expired`, `cancelled`. Where this doc says `claims`, `urgent` or `rescued`, use those names.

## 3. Data model

```ts
type Partner = {
  id: string;            // uuid
  phone: string;         // E.164
  name: string;          // optional, default "Partner N"
  optedIn: boolean;
};

type Claim = {
  id: string;
  volunteerId: string;
  quantity: number;
  status: "claimed" | "picked_up";
  claimedAt: string;     // ISO
  pickedUpAt?: string;
};

type Incident = {
  id: string;
  item: string;          // "meals"
  quantity: number;      // total
  location: string;
  deadline: string;      // ISO
  status: "urgent" | "rescued" | "expired";
  source: "form" | "demo";
  claims: Claim[];
  createdAt: string;
};

type FeedEvent = { id: string; ts: string; text: string };

type State = {
  volunteers: Partner[];
  incident: Incident | null;
  feed: FeedEvent[];
};
```

Derived values (computed, never stored): `claimed = sum(claims.quantity)`, `rescued = sum(claims where picked_up)`, `unclaimed = quantity - claimed`.

## 4. Endpoints

| Method | Path | Request | Response | Notes |
|---|---|---|---|---|
| GET | `/` | none | dashboard HTML | static |
| GET | `/api/state` | none | `State` plus derived counters | initial load |
| GET | `/api/stream` | none | SSE, one `state` event per change | dashboard subscribes |
| POST | `/api/incidents` | `{ quantity, item, location, minutes, source }` | `Incident` | creates, then triggers broadcast |
| POST | `/api/broadcast` | `{ incidentId }` | `{ sent, failed }` | also called internally |
| POST | `/api/simulate` | `{ phone, body }` | same as inbound handling | demo control, bypasses Twilio |
| POST | `/api/demo/fast-forward` | none | State | sets deadline to now + 60s |
| POST | `/api/reset` | none | State | clears incident and feed, keeps partners |
| POST | `/api/partners` | `{ phone, name }` | `Partner` | seed the demo partners |
| POST | `/webhooks/twilio` | form-encoded `From`, `Body` | TwiML `<Response><Message>` | shares one handler with `/api/simulate` |
| POST | `/api/announce` | `{ text }` | audio/mpeg | ElevenLabs, P2 |

Implementation note: put keyword handling in one function `handleInbound(phone, body)` that both `/webhooks/twilio` and `/api/simulate` call. That keeps the demo controls honest.

## 5. Validation rules (report form)

- quantity: integer, 1 or more. item: non-empty, default "meals". location: non-empty, default "main hall". minutes: integer, 1 or more, default 45.
- Defaults are prefilled in the form, so the demo can create an incident with one click.

## 6. Twilio inbound handling (pseudo)

```
handleInbound(phone, body):
  text = body.trim().toUpperCase()
  partner = findOrCreate(phone)
  if text == "JOIN": optIn; return "You're in..."
  if text == "STOP": optOut; return ""
  if no active incident: return "No food needs rescuing right now."
  if text starts with "CLAIM": n = parse or 100; n = min(n, unclaimed)
       if n <= 0: return "All food is claimed. Thank you!"
       add claim; feed("{name} claimed {n} {item}"); return confirmation
  if text == "PICKED UP": mark that partner's oldest claimed claim picked_up
       feed(...); if rescued == quantity: incident.status = "rescued"; return thanks
  else: return help
  after any change: persist(), broadcastState()
```

Validate the Twilio request signature in production use. For the hackathon it is acceptable to skip it if time is short, but note it as a known gap.

## 7. Timer

Store `deadline` as an ISO timestamp. The browser computes the countdown from it, so the server does not tick. The server runs one `setInterval` (1 s) that flips status to `expired` when `now > deadline` and food remains, then pushes state.

## 8. Environment variables (Replit Secrets)

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
PUBLIC_BASE_URL=        # the Repl URL, used for the Twilio webhook config
DEMO_MODE=true          # shows demo controls
```

Add a matching `.env.example` with placeholders. Never hardcode any of these.

## 9. File layout

```
/
  server.js            # express app, routes, SSE, timer
  lib/state.js         # load, save, derive counters, feed
  lib/inbound.js       # handleInbound keyword logic
  lib/twilio.js        # send alerts
  lib/elevenlabs.js    # optional TTS
  public/index.html    # dashboard
  public/app.js        # SSE client, report form, controls
  public/styles.css
  data/state.json
  .env.example
```

## 10. UI styling (from the design rules)

- Page `#F7F6F3`, cards `#FFFFFF`, text `#1C1C1A`, muted `#787774`, accent Sage `#40745C`
- No borders, no box-shadows, no gradients, no dividers, no pill-shaped cards, card radius 12px
- Sections separated by whitespace only
- Buttons: sage background, white text, 6px radius, no border. Secondary buttons: neutral `#F5F5F5` background.
- Tables: one value per cell, each datum gets its own column
- Urgency is shown with text and the state pill, not with borders or gradients

## 11. Failure modes and fallbacks

| Failure | Fallback |
|---|---|
| Twilio send blocked or number unregistered | Demo controls simulate replies, feed still tells the story |
| SSE drops | Dashboard polls `/api/state` every 3 s as backup |
| Repl sleeps or restarts | State reloads from `data/state.json`, keep the Repl awake before the demo |
| ElevenLabs fails | Silent or browser speech synthesis |
