# Food Rescue HQ: Features

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Priority: **P0** must ship, **P1** ships if P0 is done by the cut line, **P2** only if there is time left.

## F1. Live dashboard (P0)

Single page at `GET /`. Updates live without refresh.

**Elements**
- Header: "Food Rescue HQ", current state pill (IDLE, URGENT, RESCUING, RESCUED, EXPIRED)
- Countdown: large mm:ss to pickup deadline
- Counters: Total, Unclaimed, Claimed, Rescued (meal counts)
- Progress bar: rescued over total
- Partners list: one row per partner, columns Name, Phone (masked), Claimed, Picked up, Status. One value per cell.
- Activity feed: newest first, timestamp plus plain-language line ("Partner shelter A claimed 100 meals")
- Report panel: quick report form (quantity, item, location, minutes) with a confirm step
- Demo controls panel: see F8
- Empty state (no incident): "All clear. No surplus food reported." with the report form prominent

**Acceptance**
- A new reply by SMS changes the counters on screen within 5 seconds, no manual refresh
- Page loads cleanly with zero incidents and with a finished incident
- Matches the design rules: no borders, no shadows, no gradients, whitespace separation, sage accent (#40745C), page #F7F6F3, cards #FFFFFF, radius 12px

## F2. Quick report form (P0)

A short form on the dashboard: quantity, item, location, minutes. Prefilled with defaults (400, meals, main hall, 45). A confirm step, then F3 creates the incident.

**Acceptance**
- Submitting the form with the defaults creates a 400-meal incident with a 45 minute deadline
- Invalid values (quantity or minutes below 1, empty item or location) show an inline message and create nothing
- The "Create sample incident" demo button uses the same path

## F3. Incident creation (P0)

Created from F2, from the manual form, or from the demo control. Only one active incident at a time. Creating a new one while one is open asks to replace it.

**Acceptance**
- Incident has quantity, item, location, deadline timestamp, status
- Creation triggers F4 automatically

## F4. SMS broadcast with Twilio (P0)

On incident creation, send an alert to every opted-in partner.

**Message template**
```
FOOD RESCUE: {quantity} {item} at {location}. Pick up within {minutes} min.
Reply CLAIM {n} to take n portions, or CLAIM to take 100.
```

**Acceptance**
- Every opted-in partner receives exactly one alert per incident
- A send failure for one number does not stop the others, and is logged in the feed

## F5. Inbound keyword handling (P0)

`POST /webhooks/twilio` reads `From` and `Body`, matches keywords (case-insensitive, trimmed), updates state, replies with TwiML.

| Keyword | Effect | Reply |
|---|---|---|
| `JOIN` | Add or re-enable partner | "You're in. We'll text when food needs rescuing." |
| `CLAIM` or `CLAIM <n>` | Claim n portions (default 100, capped at unclaimed) | "Got it: {n} {item} at {location}. Pick up by {time}. Reply PICKED UP when done." |
| `PICKED UP` | Mark that partner's claim picked up, add to rescued | "Thank you. {n} {item} rescued." |
| `STOP` | Opt out (Twilio also handles this) | none or confirmation |
| `HELP` or anything else | Show commands | "Reply CLAIM, PICKED UP, or STOP." |

**Edge cases**
- CLAIM with nothing unclaimed: "All food is claimed. Thank you!"
- CLAIM with no active incident: "No food needs rescuing right now."
- PICKED UP with no claim: "You haven't claimed any food. Reply CLAIM first."
- Unknown number sending CLAIM: auto-add as a partner, then process

## F6. Rescue complete and expiry (P0)

- When rescued equals total: status RESCUED, dashboard celebration (F7), feed entry, incident closes
- When the countdown hits zero with food remaining: status EXPIRED, remaining quantity shown as not rescued, feed entry
- Claimed but not picked up at expiry counts as not rescued

## F7. Celebration moment (P1)

Meal counter animation and a big "400 MEALS RESCUED" state. If F9 is enabled, play the ElevenLabs announcement.

## F8. Demo controls (P0, this is the safety net)

Panel on the dashboard, clearly labeled as demo only.

- "Create sample incident" (400 meals, main hall, 45 min)
- "Simulate reply" with partner dropdown and keyword buttons (CLAIM 100, PICKED UP)
- "Fast-forward timer" to 1 minute remaining
- "Reset" to clear state and return to IDLE

**Acceptance:** the entire demo can be run with zero phones, and look identical.

## F9. ElevenLabs announcement (P2)

When an incident is created and when it is fully rescued, generate speech and play it in the browser. Example lines: "Attention. Four hundred meals need rescuing. You have forty five minutes." and "Four hundred meals rescued. Nobody goes hungry."

**Acceptance:** if the API fails or the key is missing, the dashboard continues and falls back to the browser's built-in speech or silence.

## F10. Phone-call reporting (P2 stretch)

Organizer dials the Twilio number and reports by phone using Twilio Voice. Build only after F1 to F8 are solid, and only if the advisors expect it.

## F11. WhatsApp (P2 stretch)

Only if the team sender is WhatsApp-enabled. Same webhook, same keywords.

## Priority summary

| ID | Feature | Priority | Owner |
|---|---|---|---|
| F1 | Live dashboard | P0 | see 04-build-plan.md |
| F2 | Quick report form | P0 | |
| F3 | Incident creation | P0 | |
| F4 | SMS broadcast | P0 | |
| F5 | Inbound keywords | P0 | |
| F6 | Rescue complete and expiry | P0 | |
| F8 | Demo controls | P0 | |
| F7 | Celebration | P1 | |
| F9 | ElevenLabs | P2 | |
| F10 | Phone-call reporting | P2 | |
| F11 | WhatsApp | P2 | |
