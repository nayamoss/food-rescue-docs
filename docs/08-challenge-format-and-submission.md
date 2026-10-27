# Challenge format and submission

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

## What is verified

From CodeTV's Web Dev Challenge pages:
- Each episode: 30 minutes of planning, 4 hours of building, designed with that episode's sponsor.
- Teams or solo builders.

## Precedent: Season 2, Episode 11 (also a Twilio episode)

This is the closest published example. **S3.E9 may differ.** Use it only to anticipate what to ask or prepare.

| Item | S2.E11 |
|---|---|
| Required tech | Twilio ConversationRelay, optionally with Programmable Voice and Messaging (SMS/WhatsApp), webhooks, any runtime |
| Deliverables | Public GitHub repo, deployed web app at a public URL, submission posted to Twilio's X or LinkedIn by a set deadline |
| Prizes | Twilio's picks (swag and credits), a speed bonus for the first qualifying submissions, an ideas track judged on social engagement |
| Support | Dedicated channel on the Twilio Discord |

Source: https://codetv.dev/blog/web-dev-challenge-hackathon-s2e11-code-powered-phone-hotline

## Verified: the written S3.E9 brief

Source: the official "Web Dev Challenge S3.E9 Details" text, pasted by Naya. It was not independently fetched (the Google Doc is private).

| Item | What the brief says |
|---|---|
| Task | Build a crisis management app for an utterly absurd crisis |
| Scenarios offered | 400 meals and no guests, squirrels hijacking nut deliveries, "shrimps is bugs" seafood crash, or invent your own |
| Must serve | People in the field AND the team back at Crisis HQ |
| Must do | Help monitor, understand, and resolve the crisis |
| Must delight | "Delight the user" is an explicit requirement |
| Required tech | **Twilio plus one of its integration partners** |
| Recommended starting points | Twilio Agent Connect (TAC), ConversationRelay, Twilio + Replit examples, ConversationRelay + ElevenLabs |
| Tone | Fun first. Creative misinterpretations are encouraged. "The more fun you're having, the better the show will be." |
| Support | Advisors on site (Twilio and CodeTV) |

What this means for us:
- The 400 meals scenario is one of the brief's own examples, so Food Rescue HQ is squarely on-brief and the meal theme is legitimate.
- Field team plus Crisis HQ is exactly the two-sided structure in `11-feasibility-and-decisions.md`.
- Replit and ElevenLabs appear only as examples of Twilio integration partners in the brief.
- "Delight" is a graded-feeling requirement, so the celebration moment (F7) should not be treated as optional polish. Consider promoting it to P0-lite: a simple but funny resolution screen.
- Make the crisis itself more absurd in tone: dramatic alert wording, escalating threat levels, a panicked organizer voice. The product underneath can stay the same.

## Not verified: the Friday participant call

Nikema attended a team call on Friday where organizers reportedly gave additional instructions about which technologies to use and about credits. That detail came through garbled, so it is **not** confirmed. Do not assume Replit and ElevenLabs are both mandatory, and do not assume they are not.

Ask Nikema these exact questions and write the answers here:

1. Which technologies did they say are required, and which are optional?
2. Do we have to use Replit specifically, or is it "Twilio plus any one partner"?
3. Is any other tech required beyond Twilio and Replit?
4. Is ElevenLabs required, or just available?
5. What did they say about credits (which accounts, how to claim)?
6. Any submission requirement: public repo, deployed URL, video, social post? What is the deadline?
7. How are projects judged?

Answers:

- [ ] (fill in after the call with Nikema)

## Decision you need to make: repo visibility

If the brief requires a **public GitHub repo** like S2.E11 did, follow the brief. Do not put any secrets in it either way: `.env.example` only.

## ConversationRelay note

The written brief only recommends ConversationRelay, it does not require it. If the Friday call or the advisors say it is expected (Twilio's voice AI relay), Food Rescue's current text-based reporting would not satisfy it. In that case the phone-call stretch (F10) becomes P0: a caller dials the Twilio number, ConversationRelay handles speech to text and text to speech over a WebSocket, and your server creates the incident. Read the doc before deciding.
## Submission checklist (fill in after reading the brief)

- [ ] Public URL deployed and loads from a fresh browser
- [ ] Repo state confirmed (visibility, no secrets, README with run steps)
- [ ] `.env.example` complete
- [ ] README explains the demo flow in 5 lines
- [ ] Post or video created if required
- [ ] Demo state reset to IDLE
