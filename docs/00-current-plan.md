# Food Rescue HQ: Current plan (source of truth)

Last updated: 2026-10-14. If another doc disagrees with this one, this one wins.

## What it is

A food waste management app for events and conferences. After an event, an organizer reports leftover food on a quick form. The app alerts nearby shelters and partner organizations, who claim what they can take and confirm pickup, so surplus goes to the right places instead of the bin. A live dashboard tracks where the food goes until it is rescued or the window closes.

Tagline: **Report it, match it, rescue it.**

## What changed from the earlier docs

| Earlier docs | Now |
|---|---|
| 400 tacos crisis game | Event food waste, routed to shelters and partner organizations |
| Volunteers | Partners (shelters, community kitchens, organizations) |
| Alerts and replies by SMS | **Phone calls** with Twilio Voice: "Press 1 to claim, 2 to pass" |
| Deepgram voice report | Removed. The organizer uses a quick report form |
| Dev Phone and Conversations | Not used. Dev Phone needs a paid account and a spare number, and it overwrites that number's webhooks. Conversations adds setup that does not fit 4 hours |
| Pickup confirmed by replying PICKED UP | Pickup confirmed with a "Mark picked up" button on the dashboard |

Older docs (01 to 15) still contain SMS keyword wording in places. Treat voice calls plus dashboard buttons as the real flow.

## Channels, in order

1. Dashboard (in-app): report form, live state, claim and pickup buttons, simulate controls. Always works.
2. Twilio Voice call to each partner. Needs a Twilio number, credentials in Replit Secrets, and `PUBLIC_BASE_URL`.
3. Not now: SMS, Conversations, in-app partner messaging, login.

## Repos

| Repo | Purpose |
|---|---|
| `food-rescue-docs` | This planning repo |
| `Food-Rescue-HQ-02` | The app code, synced from Replit with the Git panel's Sync Changes button |
| `food-rescue-hq-app` | Old skeleton. Archive once nothing points at it |

## Build order (Replit prompts in `14-replit-prompt-pack.md`)

1. Prompt 1: skeleton, state, dashboard (done in Replit, still old wording)
2. Prompt 1.5: reframe wording and sample data to event food waste and partners
3. Prompt 2: Twilio voice calls, claim and pickup buttons, simulate controls
4. Prompt 3: polish and celebration
5. After each prompt: Sync Changes, then review the code against the prompt

## Blockers outside the code

- Twilio: Account SID emailed to the organizers on 2026-10-14 asking for credits, trial removal, and a number. The account has no phone number yet.
- Twilio Secrets to add in Replit: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `PUBLIC_BASE_URL`.
- Official judging criteria and required vs optional tech: still not verified (Friday call).

## Demo (about 2 minutes)

1. Idle dashboard. "After events, good food gets thrown out because nobody has time to find who needs it."
2. Organizer submits the report form: 400 meals, Main hall, 45 minutes.
3. Dashboard goes urgent with the countdown. Partner phones ring.
4. Partner shelter A presses 1: 100 claimed. Partner shelter B claims the rest.
5. Organizer marks pickups. Dashboard shows 400 rescued and celebrates.
6. Fallback at any step: the simulate buttons.
