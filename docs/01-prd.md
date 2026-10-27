# Food Rescue HQ: Product Requirements

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

**Status:** Draft for call with Nikema
**Last updated:** 2026-10-13

## 1. Problem

At conferences, corporate events, and weddings, large amounts of good food get thrown out because organizers do not know who to call, and the window to redistribute it safely is short. Naya saw this firsthand at a conference where organizers were about to bin most of the food.

The gap is coordination speed. Local kitchens, shelters, and partners would take the food, but nobody can reach them, confirm who is coming, and track pickup inside the time window.

## 2. Hackathon scenario

400 meals are left at a conference and nobody showed up. Food stays safe to distribute for 45 minutes. Food Rescue HQ must find takers, confirm pickups, and prove the food was rescued before the clock hits zero.

## 3. Users

| User | Who | What they need | Channel |
|---|---|---|---|
| Event organizer | Staff with leftover food and no plan | Report surplus in under 30 seconds, see it get claimed | Quick report form on the dashboard |
| Partner / recipient | Community kitchen, shelter, or individual with a car | Get an alert, claim a share, know where and by when | SMS (WhatsApp only if the sender supports it) |
| Crisis HQ operator (demo host) | Runs the dashboard | See the whole rescue live, trigger or simulate events | Replit dashboard |

## 4. Goals

1. A working end-to-end rescue loop in a live demo, on real phones.
2. Sponsor tech used for a real reason, not bolted on: Replit (hosts the app and dashboard) and Twilio (alerts and replies).
3. A demo that is funny and clear in under 3 minutes.
4. A build small enough to finish in 4 hours with a safety net at every layer.

## 5. Non-goals (explicit cuts)

- Maps, geolocation matching, or distance ranking
- User accounts, login, or an admin panel
- Twilio Conversations (group channel)
- LLM-written alert copy
- Voice or phone-call reporting (typed report form only)
- Food safety compliance, donation receipts, or analytics beyond the on-screen counters
- Multi-event support (one active incident at a time)

## 6. Core user flow

1. Organizer opens the dashboard and fills the quick report form: 400 meals, main hall, 45 minutes (or HQ taps "Create sample incident").
2. The app shows the values for a one-tap confirm, then creates the incident.
3. Dashboard goes to URGENT with a 45:00 countdown. Twilio texts every opted-in partner.
4. Partner replies `CLAIM 100`. Dashboard shows 100 claimed, 300 still unclaimed, partner listed. The partner gets a confirmation with pickup details.
5. Partner replies `PICKED UP`. Rescued counter increases, activity feed logs it.
6. When rescued reaches the total, the dashboard celebrates and the incident closes. ElevenLabs announces it if enabled.
7. If the clock hits zero first, remaining food is marked expired and the rescue is shown as partial.

## 7. Success criteria

| Criterion | Pass condition |
|---|---|
| Loop works live | One report leads to at least 2 real phones receiving SMS, replying, and the dashboard updating within 5 seconds of each reply |
| Twilio is load-bearing | Alerts out and keyword replies in both drive state |
| Demo resilience | Every step has a manual trigger on the dashboard if SMS fails |
| Time | P0 features done by hour 3 of the build, hour 4 is polish and rehearsal |

## 8. Judging fit

| Likely criterion | How we hit it |
|---|---|
| Creativity / humor | 400 meals, 45 minute clock, meal counter, over-the-top rescue celebration |
| Use of sponsor tech | Twilio two-way SMS, Replit live command center, ElevenLabs announcement (optional) |
| Real-world value | Direct path to a real product for event food waste |
| Execution | Working live demo with visible state, not slides |

The written S3.E9 brief is verified (see `08-challenge-format-and-submission.md`): absurd crisis, field team plus Crisis HQ, Twilio plus one integration partner, and delight the user. Judging weights and the extra requirements from the Friday call are not verified.

## 9. Open questions for Nikema

1. Food Rescue or Hamster HQ? (Technically near identical.)
2. Who owns dashboard and state, and who owns Twilio and the keyword logic?
3. Is ElevenLabs required or optional? Cut it first if time is tight.
4. Which phone numbers are our demo partners?
5. Is the team Twilio number able to text US numbers without extra registration?
