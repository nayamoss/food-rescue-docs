# Replit prompt pack (copy and paste, no file access needed)

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Replit Agent cannot see this repo or these docs. Every prompt below is self-contained: copy the whole block, paste it as a message, wait for the result, test it, then move to the next.

Order: Prompt 0 (plan, in `13-replit-initial-prompt.md`) then 1, 1.5, 2, 3. Fix prompts are at the bottom.

Rule: test after each prompt. Do not send the next one until the current milestone works.

---

## Prompt 1: skeleton, state and dashboard (hour 1)

```
Continue the Food Rescue HQ app (Node.js + Express, plain HTML/CSS/JS in public/, no framework, no database, state in memory saved to data/state.json). Build milestone 1 only. Do NOT add Twilio yet.

BUILD:
1. server.js with Express serving public/.
2. lib/state.js holding this state, persisted to data/state.json on every change and loaded on start:
   - volunteers: [{ id, name, phone, optedIn }]
   - incident: null or { id, item, quantity, location, deadline (ISO), status: open|in_progress|resolved|expired|cancelled, assignments: [{ id, volunteerId, quantity, status: claimed|picked_up|cancelled|failed, claimedAt, pickedUpAt }] }
   - feed: [{ id, at, text }] newest first
   Derived, never stored: claimed = sum of active assignment quantities, rescued = sum of picked_up, unclaimed = quantity - claimed.
3. Endpoints: GET /api/state, GET /api/stream (server-sent events, one "state" event per change), POST /api/incidents { quantity, item, location, minutes }, POST /api/reset (clears incident and feed, keeps partners), POST /api/demo/fast-forward (sets deadline to 60 seconds from now).
4. A 1 second timer on the server: if the deadline has passed and food remains, set status to expired and push state.
5. Seed three volunteers: Partner shelter A, Partner shelter B, Community kitchen with placeholder phone numbers.
6. public/index.html, app.js, styles.css: ONE page at "/" with:
   - a state label (Idle, Urgent, Rescuing, Rescued, Expired) shown as a small colored dot plus text
   - a large mm:ss countdown computed in the browser from the deadline
   - four counters: Total, Unclaimed, Claimed, Rescued, and a progress bar
   - a partners table (Name, Claimed, Picked up, Status), one value per cell
   - an activity feed
   - a demo controls panel: "Create sample incident" (400 meals, main hall, 45 minutes), "Fast-forward", "Reset"
   - empty state text: "All clear. No surplus food reported."
   The page subscribes to /api/stream and also polls /api/state every 3 seconds as a backup.

UI RULES: light grey page, white cards, one green accent #2F6B50. No borders, no box-shadows, no gradients, no blue, card radius 12px max.

DO NOT: add a database, a framework, login, extra pages, or any feature not listed.

DONE WHEN: I click "Create sample incident" and the dashboard goes Urgent with a ticking 45:00 countdown and 400 unclaimed, "Fast-forward" brings it to 1 minute and then Expired, and "Reset" returns to Idle. Tell me exactly how to run and test it.
```

---

## Prompt 1.5: reframe to event food waste (run right after Prompt 1)

```
Reframe the Food Rescue HQ app. Change wording and sample data only. Do NOT change behavior, endpoints, file names, or the data model.

THE NEW CONCEPT: this is a food waste management app for events and conferences. After an event, an organizer reports leftover food. The app alerts nearby shelters and partner organizations, who claim what they can take and confirm pickup, so the surplus goes to the right places instead of the bin. It is not a taco app and not a crisis game.

CHANGE:
1. Every user-facing word "volunteer" becomes "partner" (headings, table headers, feed lines, call script). Keep the internal field and route names as they are.
2. Seed partners: "Partner shelter A", "Partner shelter B", "Community kitchen", keeping the same placeholder phone numbers.
3. Sample incident button: label "Create sample incident", item "meals", quantity 400, location "Main hall", 45 minutes. Remove every mention of tacos anywhere (UI, feed text, comments, README).
4. Page header: "Food Rescue HQ" with the subtitle "Event food waste, routed to the right places."
5. Empty state: "All clear. No surplus food reported."
6. Feed lines read like: "Partner shelter A claimed 150 meals" and "Calling 3 partners".
7. Clear data/state.json so old data is gone, then restart.

DO NOT: add features, a database, login, or new pages. Keep the existing UI rules (no borders, shadows, gradients or blue; green accent).

DONE WHEN: I click "Create sample incident" and see 400 meals, the partners listed, and no mention of tacos or volunteers anywhere. Tell me what you changed.
```

---

## Prompt 2: Twilio voice calls and claim buttons (hour 2)

Changed from SMS to voice calls (see `00-current-plan.md`). No SMS, no Dev Phone, no Conversations.

```
Continue the Food Rescue HQ app. Add Twilio VOICE calls. Do NOT add SMS. Do NOT install the Twilio CLI or Dev Phone, and do NOT use the Replit Twilio connection. Use the twilio npm package and Replit Secrets only. Do not change the dashboard layout.

BUILD:
1. lib/twilio.js using the twilio npm package. Read TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER and PUBLIC_BASE_URL from environment variables only, and add them to .env.example with placeholders. If any are missing, log one clear message and skip calling (do not crash). The app must run fully without them.
2. When an incident is created, place a call to every opted-in partner with url = {PUBLIC_BASE_URL}/voice/alert?partnerId={id}. Add a feed entry "Calling N partners". If a call fails, log it, add a feed entry for that partner, and keep going. If credentials are missing, add the feed entry "Calls not configured, skipped".
3. POST /voice/alert: respond with TwiML. Say: "Food rescue. {quantity} {item} at {location}. Pick up within {minutes} minutes. Press 1 to claim 100. Press 2 to pass." wrapped in <Gather numDigits="1" action="/voice/claim?partnerId={id}" timeout="8">. If no key is pressed, say "No response. Goodbye." and hang up.
4. POST /voice/claim: read Digits. 1 = call the existing claim logic for that partner with 100 portions (capped at the unclaimed amount) and say "Got it. {n} {item} claimed. Please pick up by {time}. Thank you." 2 = say "Understood. Thank you." and hang up. If nothing is unclaimed or there is no active incident, say so and hang up. Add a feed entry such as "Partner shelter A claimed 100 meals" or "Partner shelter A passed".
5. Dashboard: add a "Mark picked up" button on each partner row that has a claim. It marks that partner's oldest claim picked_up, adds a feed entry, and when rescued equals the total sets the state to Rescued with a feed entry "All {quantity} {item} rescued."
6. POST /api/simulate { partnerId, action: "claim" | "pass" | "pickup", quantity? } uses the same logic, and add demo buttons "Claim 150", "Claim 250", "Pass", "Picked up" with a partner dropdown, so the demo works without any real calls.
7. After every state change, push to the SSE stream.

DO NOT: add SMS, a database, login, new pages, or other integrations.

DONE WHEN: with the demo buttons only (no Twilio credentials), Partner shelter A claims 150, Partner shelter B claims 250, both are marked picked up, the dashboard shows 400 rescued and the state becomes Rescued. Then tell me the exact URL for the voice webhooks and list the four Secrets I need to add.
```

---

## Prompt 3: absurd wording, celebration, polish (hours 3 and 4)

```
Continue the Food Rescue HQ app. Polish only. No new features beyond what is listed.

BUILD:
1. Make the tone theatrical and absurd, like an over-the-top emergency broadcast. Change the dashboard copy and the alert text (keep CLAIM, PICKED UP, STOP, HELP working exactly the same). Example alert: "CODE RED: 400 meals stranded at the main hall with zero guests. You have 45 minutes. Reply CLAIM to take 100."
2. A celebration state when the incident is Rescued: a big "400 MEALS RESCUED" message and a short, funny mission-complete line. Use plain CSS only, no gradients, no shadows.
3. Escalating urgency: show a different label and wording when more than 50% of time remains, under 50%, and under 10 minutes.
4. Audit public/styles.css and remove any border, box-shadow, gradient or blue color. Keep the one green accent #2F6B50.
5. Make sure the page works on a phone-width screen.

DO NOT: add features, change the data model, or refactor.

DONE WHEN: a full run (create sample incident, two simulated claims, two pickups) shows the escalating labels and ends on the celebration state with no layout problems.
```

---

## Fix prompt template

```
When I {what you did}, I expected {what should happen} but {what happened}.
The exact error is: {paste the error text from the browser console or server log}.
Fix only this problem. Do not change anything else. Tell me which files you changed.
```

If two fixes fail:

```
Do not change any code. Explain in plain words what you think is wrong and list two possible causes, then wait.
```

## Keep this in mind

- Keys go in Replit Secrets by you, never in a prompt.
- If the agent adds something you did not ask for, say: "Stop. Only do what I listed. Remove anything else."
- Checkpoint or note what works after each prompt before sending the next one.
