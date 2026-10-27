# Who does what: dividing the build between Naya and Nikema

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Drafted by a planning subagent from docs 02, 03, 04, 11 and 14, then edited. Voice reporting is not part of the plan; incidents come from the report form. Treat this as a proposal to settle in the first 15 minutes.

## The key idea

The Replit Agent is one builder in one project. The real risk is two people steering one agent and one set of files. So the split is by **file ownership**: one person drives the Agent, the other works against a fixed contract and brings code in through GitHub.

## 1. Ownership (default split)

| Area | Owner | Files | Covers |
|---|---|---|---|
| Server brain | Naya | `server.js`, `lib/state.js`, `lib/inbound.js`, `lib/twilio.js` | State, endpoints, expiry timer, keyword logic, Twilio send, F3 F4 F5 F6 |
| Glass | Nikema | `public/index.html`, `public/app.js`, `public/styles.css` | Dashboard, report form, demo panel, celebration, tone copy, F1 F2 F7 F8 |
| Twilio console and ops | Nikema | none (console and Replit Secrets) | Number, verified recipients, webhook URL, Secrets |
| Stretch | Whoever finishes first | `lib/elevenlabs.js` | F9 only after P0 passes |
| Demo script and rehearsal | Both | `docs/` | Final 30 minutes |

Rule: if you need a change in a file you do not own, ask the owner. Do not edit it.

Note: `04-build-plan.md` proposes the opposite shape (Naya on dashboard, Nikema on Twilio and the report endpoint). Either works. Pick the one that matches who is faster at CSS vs Express after a two-minute chat. The reversed version is in section 7.

## 2. Shared contract (agree in the first 15 minutes, pin it)

Naming: the **prompt pack names win** (`assignments`, `open`, `resolved`). Where doc 03 says `claims`, `urgent`, `rescued`, use the pack names.

| Field | Values |
|---|---|
| `partners[]` | `{ id, name, phone, optedIn }` |
| `incident` | `null` or `{ id, item, quantity, location, deadline (ISO), status, assignments[] }` |
| `incident.status` | `open`, `in_progress`, `resolved`, `expired`, `cancelled` |
| `assignments[]` | `{ id, volunteerId, quantity, status: claimed / picked_up / cancelled / failed, claimedAt, pickedUpAt }` |
| `feed[]` | `{ id, at, text }`, newest first |
| `derived` | `{ total, claimed, rescued, unclaimed }`, computed server-side and sent in the payload |

Dashboard labels: `open` = Urgent, `in_progress` = Rescuing, `resolved` = Rescued, `expired` = Expired, no incident = Idle.

| Endpoint | Request | Response |
|---|---|---|
| GET `/api/state` | none | State plus `derived` |
| GET `/api/stream` | none | SSE, event `state`, same payload |
| POST `/api/incidents` | `{ quantity, item, location, minutes }` | Incident, `400 { error, field }` on bad input, `409` if one is open |
| POST `/api/simulate` | `{ phone, body }` | `{ reply }` |
| POST `/api/demo/fast-forward` | none | State |
| POST `/api/reset` | none | State |
| POST `/webhooks/twilio` | form `From`, `Body` | TwiML |

Keywords (case-insensitive, trimmed): `JOIN`, `CLAIM`, `CLAIM n`, `PICKED UP`, `STOP`, `HELP`. Demo buttons send exactly `CLAIM 150`, `CLAIM 250`, `PICKED UP`.

Mock rule: the person on `public/` develops against a canned JSON sample of `/api/state` until the real endpoint exists, so nobody waits.

## 3. Hour by hour

| Time | Naya (server) | Nikema (glass and ops) | Milestone check |
|---|---|---|---|
| Planning, 30 min | Agree contract and cut line, create the project and repo | Confirm the Twilio account, pick the number, list 3 demo phones, verify recipients | Contract pinned, project URL shared |
| Hour 1 | Server half of Prompt 1: state, stream, incidents, reset, fast-forward, timer | Page against canned JSON: counters, countdown, table, feed, report form, demo panel | Click "Create sample incident": Urgent, ticking clock, 400 unclaimed |
| Hour 2 | `inbound.js`, `twilio.js`, webhook, `/api/simulate`, rescue and expiry transitions | Secrets, webhook URL in Twilio, text-test with 2 real phones, simulate buttons | 2 phones claim, dashboard moves in under 5 seconds |
| Hour 3 | Failure paths (send fails, unverified number, webhook down), restart persistence | Theatrical copy, escalating labels, phone-width layout | Full run once with phones, once with demo controls only |
| Hour 4 | Final reset, keep-awake, ElevenLabs only if P0 is clean | Celebration state, visual pass, demo script | Two clean rehearsals plus one zero-phone drill |

Hard rule: at the end of every hour the demo runs end to end, even if ugly. Freeze at 3:30. After that, only bug fixes by the file's owner.

## 4. Sharing code with the Replit Agent

- **One project is the source of truth**, connected to the GitHub repo. Do not run two Agent sessions in it at once.
- **One Agent driver: Naya.** Nikema does not prompt the Agent in the shared project.
- **Nikema works in `public/`** locally (or in a fork if local setup is slow), pushes to a branch named `ui`, and Naya merges. Because only Nikema touches `public/`, merges are trivial.
- **Edit Prompt 1** so the Agent only creates `server.js`, `lib/state.js` and a placeholder `public/index.html`, and never touches `public/` after that.
- **Cadence:** pull before a block, push when a milestone works, say "pushed" in chat. Commit in Replit before pulling.
- **Secrets** only in Replit Secrets. Nikema enters the values. Nobody pastes keys into chat or prompts.
- **Fallback if Git gets painful:** Nikema pastes the finished three `public/` files into the project editor directly.

## 5. Agent vs by hand, and who reviews

| Agent (Naya runs) | By hand | Reviewer |
|---|---|---|
| Express boilerplate, static serving | `lib/inbound.js` keyword logic, tested through `/api/simulate` | Nikema checks it against the F5 table |
| `state.js` persistence, SSE endpoint | Contract and state transitions | Naya |
| Dashboard layout and CSS (a first draft) | Report form validation, copy, demo script | Naya checks it in a browser |
| Celebration CSS, phone-width fixes | Twilio console, webhook URL, number verification | Whoever did not do it |

Review rule: the person who did not write or prompt the code runs it against the milestone check before the next prompt goes in.

## 6. Top three coordination risks

| Risk | Mitigation |
|---|---|
| Contract drift (docs disagreed on names) | One pinned contract, prompts quote it verbatim, totals computed server-side, a check at minute 40 that the page renders real data |
| Overwritten work (Agent regenerates files over teammate edits) | File ownership, Prompt 1 edited, one Agent driver, pull and commit before every Agent run, checkpoint before each prompt |
| Twilio blocks nobody noticed | Start console work in planning, verified number by minute 45, if not working 15 minutes into hour 2 go simulate-only and keep building |

## 7. Reversed split (Nikema stronger at backend)

| Area | Owner |
|---|---|
| Server brain and Twilio | Nikema |
| Glass (`public/`) | Naya |
| Twilio console, Secrets, webhook | Nikema |
| Agent driver | Nikema |
| Demo script, copy, celebration | Naya |

The schedule columns swap names. Everything else stays the same.

## Decide in the first 15 minutes

- [ ] Pick the split (default or reversed)
- [ ] Pin the contract from section 2
- [ ] Name one Agent driver
- [ ] Edit Prompt 1 so the Agent does not overwrite `public/`
- [ ] Confirm the Twilio number and the three demo phones
