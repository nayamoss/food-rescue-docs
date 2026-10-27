# Food Rescue HQ: Build Plan

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Window: 30 min planning + 4 hr build. Rule: **at the end of every hour, the demo must run end to end in its current form.** Never leave an hour with a half-built loop.

## Ownership (proposal, confirm with Nikema)

| Area | Owner | Notes |
|---|---|---|
| Dashboard UI, SSE, state, demo controls | Naya | Spend time in Replit, learn the Repl, Secrets, and webhook URL early |
| Twilio send and webhook, keyword logic | Nikema | Owns the number and the Twilio console |
| Report form, incident endpoint, expiry timer | Nikema, then pair | Starts once the webhook works |
| ElevenLabs, celebration, demo script | Naya | Only after P0 passes |
| Demo rehearsal | Both | Last 30 minutes, twice through |

Swap the split if Nikema is stronger on frontend. What matters is one person per area and a shared Repl.

## Timeline

### Planning (30 min)
- [ ] Confirm concept and ownership
- [ ] Read the official brief, check required vs optional tech and judging criteria
- [ ] Agree on the cut line (below)
- [ ] Agree on the three demo phone numbers

### Hour 1: skeleton and state (milestone: dashboard shows a manually created incident)
- [ ] Repl created, Express running, public URL works
- [ ] `lib/state.js` with the data model and persistence
- [ ] `GET /`, `GET /api/state`, `GET /api/stream`
- [ ] Dashboard renders counters, countdown, partners, feed, empty state
- [ ] `POST /api/incidents` and "Create sample incident" button
- [ ] **Milestone check:** click the button, dashboard goes URGENT with a ticking clock

### Hour 2: Twilio voice loop (milestone: two real phones can claim and the dashboard moves)
- [ ] Secrets added, `lib/twilio.js` places a call to each partner on incident creation
- [ ] `POST /voice/alert` and `POST /voice/claim` return TwiML (press 1 to claim, 2 to pass)
- [ ] "Mark picked up" button on each partner row
- [ ] `POST /api/simulate` shares the same claim logic
- [ ] Rescue complete and expiry transitions
- [ ] **Milestone check:** a real phone gets the call, presses 1, and the dashboard updates within 5 seconds (or use the simulate buttons if no number yet)

### Hour 3: absurd tone and hardening (milestone: full loop runs on phones and on demo controls)
- [ ] Clear, warm alert and dashboard wording, call script unchanged
- [ ] Escalating urgency labels as time runs down
- [ ] Fast-forward and reset verified
- [ ] Failure paths: call fails, number not verified, webhook down
- [ ] **Milestone check:** full loop once with real phones and once with demo controls only

### Hour 4: polish and rehearse (milestone: clean run, twice, with a fallback drill)
- [ ] Celebration state (F7)
- [ ] ElevenLabs announcement if time allows (F9)
- [ ] Visual pass against design rules: no borders, shadows, gradients
- [ ] Rehearse the full script twice
- [ ] Rehearse the fallback: demo it once with zero phones and zero mic
- [ ] Keep-awake and a final reset before going live

## Cut line

If behind, cut in this order:

1. ElevenLabs (F9)
2. Celebration animation (F7), keep a plain "RESCUED" state
3. Phone-call reporting and WhatsApp (F10, F11), these should never start
4. Escalating urgency labels
5. Never cut: dashboard, Twilio loop, report form, demo controls

## Task checklist by feature

| Feature | Tasks | Done |
|---|---|---|
| F1 Dashboard | HTML structure, CSS, SSE client, counters, countdown, feed, partners table | [ ] |
| F2 Report form | Form, defaults, validation, confirm step | [ ] |
| F3 Incidents | Create endpoint, single active incident rule, replace prompt | [ ] |
| F4 Broadcast | Send loop, failure handling, feed entries | [ ] |
| F5 Inbound | Webhook, keyword handler, TwiML reply, edge cases | [ ] |
| F6 Complete/expire | Rescued transition, 1 s expiry tick | [ ] |
| F8 Demo controls | Sample incident, simulate reply, fast-forward, reset | [ ] |
| F7 Celebration | Rescued state visual | [ ] |
| F9 ElevenLabs | TTS endpoint, playback, fallback | [ ] |

## Working agreements

- One Repl, both people editing. Commit to a short list: who touches `server.js` and who touches `public/`.
- Test with real phones from hour 2 onward. Do not save Twilio testing for hour 4.
- If anything blocks for more than 15 minutes, switch to the fallback and move on.
