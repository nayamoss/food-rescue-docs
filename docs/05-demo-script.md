# Food Rescue HQ: Demo Script

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Length: 2 to 3 minutes. One narrator, one person on phones.

## Setup before going live

- Dashboard open on the shared screen, state reset to IDLE
- Two partner phones visible or on speaker/screen share, both already opted in
- Demo controls open in a second tab as the backup

## Beats


| #   | Time | What happens                                                                                                                             | What is said                                                                                                                                                                           |
| --- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 0:00 | Dashboard idle: "All clear. No surplus food reported."                                                                                   | "Every year, tons of good food is thrown out after events because nobody can coordinate a rescue in time. This is Food Rescue HQ."                                                     |
| 2   | 0:15 | Organizer fills in the report form: 400 meals, main hall, 45 minutes | "It's the end of a conference. Nobody showed up for lunch." |
| 3   | 0:25 | Tap confirm. The incident is created | "One report, and the rescue is live." |
| 4   | 0:45 | Dashboard flips to URGENT, 45:00 countdown, 400 unclaimed. Partner phones buzz                                                         | "Twilio is now texting every partner on the list."                                                                                                                                   |
| 5   | 1:00 | Partner A replies `CLAIM 150`. Dashboard: 150 claimed, 250 unclaimed, feed entry                                                       | "Claims come back by text and the command center updates live."                                                                                                                        |
| 6   | 1:20 | Partner B replies `CLAIM 250`. Unclaimed hits 0                                                                                        | "Everything is spoken for with 41 minutes left."                                                                                                                                       |
| 7   | 1:40 | Partner A replies `PICKED UP`. Rescued: 150                                                                                            | "Pickups are confirmed the same way."                                                                                                                                                  |
| 8   | 2:00 | Partner B replies `PICKED UP`. Rescued: 400. Celebration state. ElevenLabs voice: "Four hundred meals rescued. Nobody goes hungry."    | "Four hundred meals, rescued, in under three minutes."                                                                                                                                 |
| 9   | 2:20 | Back to the stack                                                                                                                        | "Replit hosts the command center, Twilio carries the alerts and replies. Swap meals for wedding catering or a hamster and it's the same system." |


The "swap for a hamster" line is the nod to Hamster Threat Level HQ. Keep it as a one-liner.

## Fallback plays


| If this breaks         | Do this                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| SMS is slow or blocked | Use Demo controls: "Simulate reply". Say "here's the same reply coming in from the field." |
| Phones not visible     | Narrate from the activity feed, it shows every message in plain language.                  |
| Dashboard stalls       | Refresh. State reloads from the saved file.                                                |
| ElevenLabs fails       | Skip silently.                                                                             |




## Rehearsal checklist

- [ ] Run once with real phones
- [ ] Run once with zero phones (Demo controls only)
- [ ] Time it, trim to under 3 minutes
- [ ] Reset to IDLE right before going live