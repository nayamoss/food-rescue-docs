# Initial prompt for Replit (plan only)

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Paste everything inside the block into Replit Agent as the first message. It is self-contained, so the agent does not need the repo. It asks for a plan only, so no credits go to a wrong build.

After you read the plan, reply with corrections (see `12-how-to-prompt.md`), then send the hour-1 prompt from `07-build-prompts-and-tech-map.md`.

```
We are two people building a hackathon app in 4 hours. Do NOT write any code yet. First reply with a plan and wait for my approval.

PRODUCT: Food Rescue HQ. A crisis management app for an absurd crisis: 400 meals arrived at a conference, no guests showed up, and the food stays safe for 45 minutes. It has two sides:
- Crisis HQ: a live dashboard (countdown, counters, partners, activity feed).
- Field team: partners who get and reply to text messages. No app to install.

CORE LOOP:
1. Someone creates an incident (quantity, item, location, minutes) through a report form, or with a "Create sample incident" button (400 meals, main hall, 45 minutes).
2. The app texts every opted-in partner through Twilio.
3. Partners reply by text: JOIN, CLAIM or CLAIM 150, PICKED UP, STOP, HELP. An inbound webhook at POST /webhooks/twilio updates the state and replies.
4. The dashboard updates live. When all portions are picked up the incident is RESCUED with a celebration. If the clock hits zero first it is EXPIRED.

STATES: incident = open, in_progress, resolved, expired, cancelled. Assignment (one partner's portion) = claimed, picked_up, cancelled, failed. Multiple partners can claim portions of one incident. Claims are capped at the unclaimed amount.

HARD CONSTRAINTS:
- Node.js + Express. Plain HTML, CSS and vanilla JS in public/. No framework, no build step, no database.
- State in memory, saved to data/state.json on every change.
- Live updates with server-sent events (GET /api/stream). Fall back to polling GET /api/state.
- All keyword handling in ONE function, handleInbound(phone, body), used by both /webhooks/twilio and a POST /api/simulate endpoint (so the demo works without real texts).
- Every external call (Twilio) must fail soft: log it, add an activity feed entry, keep the app running.
- Secrets only from environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER. Keep a .env.example.
- Single page at "/". No login, no settings page.
- UI: light grey page, white cards, one green accent (#2F6B50). No borders, no shadows, no gradients, no blue, no pill-shaped cards (radius 12px max). Tables hold one value per cell.
- Demo controls panel on the dashboard: create sample incident, simulate a reply from a partner, fast-forward the timer to 1 minute, reset.

REPLY WITH:
1. The file list you would create.
2. The data model.
3. The endpoints.
4. A build order in milestones. Milestone 1 must be: dashboard + sample incident + live countdown, no Twilio.
5. Anything that is ambiguous or that you would do differently.
Then stop and wait.
```
