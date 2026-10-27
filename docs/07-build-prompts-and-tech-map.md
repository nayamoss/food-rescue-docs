# Build prompts and technology map

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Replit Agent cannot see this repo or these docs, so nothing here is read from files. The paste-ready, self-contained versions of these prompts are in `14-replit-prompt-pack.md`. Use that file when you build.

## 1. Project instructions for the agent

Put this in the Repl as `replit.md` (Replit Agent reads it) or at the top of your first prompt:

```markdown
# Food Rescue HQ

Hackathon app: report -> incident -> SMS partners -> CLAIM / PICKED UP -> live dashboard.
Stack: Node.js + Express on Replit, vanilla JS dashboard, Twilio SMS, ElevenLabs TTS (optional).

## Rules
- No frameworks, no build step. Plain Express + static files in public/.
- State is in memory and persisted to data/state.json. No database.
- Keep all keyword handling in lib/inbound.js. /webhooks/twilio and /api/simulate both call handleInbound().
- Never hardcode secrets. Read from process.env. Keep .env.example in sync.
- UI: no borders, no box-shadows, no gradients, no dividers. Whitespace separation only.
  Page #F7F6F3, cards #FFFFFF, text #1C1C1A, muted #787774, accent #40745C, card radius 12px.
  Buttons: accent bg, white text, 6px radius, no border. Never blue.
- Tables: one value per cell.
- Every external call (Twilio, ElevenLabs) must fail soft: log it, push a feed event, keep running.

## Commands
- Run: npm start
- The app serves on the port from process.env.PORT

## Docs
- Product and feature spec: docs/01-prd.md, docs/02-features.md
- Technical design: docs/03-technical-design.md
- Do not add features outside the P0 list unless docs/04-build-plan.md says the cut line is cleared.
```



## 2. Prompt playbook (one per hour)

**Hour 1: skeleton**

```
Read the project instructions and docs/03-technical-design.md. Build Express server.js, lib/state.js
(data model from section 3, persisted to data/state.json), GET /api/state, GET /api/stream (SSE),
POST /api/incidents, POST /api/reset, and public/index.html + app.js + styles.css for the dashboard
per docs/02-features.md F1 and F8. Include a "Create sample incident" button. No Twilio yet.
```

**Hour 2: Twilio**

```
Add lib/twilio.js to send alerts to all opted-in partners when an incident is created, and
lib/inbound.js with handleInbound(phone, body) implementing JOIN, CLAIM [n], PICKED UP, STOP, HELP
per docs/02-features.md F5. Add POST /webhooks/twilio (form-encoded From and Body, reply with TwiML)
and POST /api/simulate. Add rescued/expired transitions per F6 and a 1s expiry tick.
Read credentials from process.env and update .env.example.
```

**Hour 3: tone and hardening**
```
Make the alert text and dashboard copy theatrical, like an over-the-top emergency broadcast, keeping
the keywords working exactly the same. Add escalating urgency labels based on time remaining.
Verify fast-forward and reset. Make sure every external call fails soft.
```

**Hour 4: polish**

```
Add the rescued celebration state (F7). If ELEVENLABS_API_KEY is set, add POST /api/announce and
play the announcement when an incident is created and when it is fully rescued, with silent fallback.
Then audit public/styles.css against the UI rules and remove any border, box-shadow or gradient.
Do not add new features.
```



## 3. Guardrails when an agent writes the code

- Make the agent read the vendor docs for current SDK signatures instead of guessing (the Twilio SDK major has changed before). Paste the doc URL into the prompt if it hallucinates.
- Commit or checkpoint after each milestone so a bad edit can be rolled back.
- Run the app after every prompt. If a prompt takes the app down, roll back first, then re-prompt smaller.
- Keys live in Replit Secrets only. Never paste them into prompts.
- Stop asking for improvements at the start of hour 4. Only fix breakage.
- One person drives the agent per Repl at a time, and you split work by directory (see 04-build-plan.md).



## 4. Full technology map


| Tech              | Role                                       | Required?            | Pre-build proof                                           |
| ----------------- | ------------------------------------------ | -------------------- | --------------------------------------------------------- |
| Replit            | Hosting, public URL, Secrets, live demo    | Yes (per your notes) | Hello-world Repl reachable from a phone                   |
| Twilio            | SMS out, SMS in via webhook, TwiML replies | Yes                  | Inbound text visible in Repl logs, outbound text received |
| ElevenLabs        | Spoken announcement                        | Possibly             | One TTS call returns audio                                |
| Node.js + Express | Server                                     | Our choice           | Runs on Replit                                            |
| SSE               | Live dashboard updates                     | Our choice           | Dashboard updates with no refresh                         |
| GitHub            | Source repo, likely needed for submission  | Likely               | Repo exists, see 08 for visibility                        |


