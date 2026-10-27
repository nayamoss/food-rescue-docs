# Team name, simple explanation, and pitch prep

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

## 1. Team name

Pick one. Say it out loud twice before choosing, you will be saying it on camera.

| Name | Why it works | Risk |
|---|---|---|
| **No Meal Left Behind** | Instantly says what you do, funny, easy to remember | A little long |
| **The Leftovers** | Funny, short, and the team is literally made of leftovers rescuing leftovers | Could read as negative if said flat |
| **Second Helpings** | Warm, clear, positive | Less funny |
| **Salsa 911** | Matches the emergency theme, short | Doesn't say "food rescue" on its own |
| **Meal Dispatch** | Sounds like a real dispatch center, fits "Crisis HQ" | Slightly generic |

**Recommendation: No Meal Left Behind** as the team name, **Food Rescue HQ** as the product name. The team name is the joke, the product name is the serious one.

Check before committing: the name does not need to be unique, but search it once so you are not stepping on a real company.

## 2. The project in one breath

> When there is leftover food and the clock is ticking, you report it in seconds, everyone nearby who can take it gets a text, and a live screen shows how much got rescued before time ran out.

## 3. Explain it at three levels

### To a 10-year-old
"After a big party there's a mountain of food nobody ate. Our app lets someone yell 'we have 400 meals!' and it instantly texts all the helpers nearby. They text back 'I'll take 150!' and a big screen shows the meals getting saved."

### To a judge in 30 seconds
"Event organizers throw out good food because nobody can coordinate a rescue fast enough. Food Rescue HQ turns a quick report into a text alert. Twilio texts every partner, they reply CLAIM and PICKED UP, and our Replit command center counts down the rescue live. In our demo, 400 meals get rescued in under three minutes."

### To a technical person
"Express server on Replit. The organizer submits a report form, we create an incident, and Twilio sends SMS alerts. An inbound webhook handles CLAIM and PICKED UP keywords and updates state. The dashboard gets live updates over server-sent events. State is in memory with a JSON file for persistence."

## 4. What each tool does, in plain words

| Tool | Plain-language job |
|---|---|
| Replit | Where the app lives online, and the screen everyone watches |
| Twilio | The messenger: sends texts out and catches the replies |
| ElevenLabs | The voice: says "400 meals rescued" out loud (optional) |

## 5. The story to tell

Use your own story, it is the strongest thing you have:

1. **The moment:** "At a conference, there was so much food left that organizers were getting ready to throw it all away."
2. **The gap:** "People who could use that food exist nearby. Nobody could reach them fast enough."
3. **The product:** "So we built the fastest path from 'we have extra food' to 'someone is on their way to get it'."
4. **The proof:** the live demo.
5. **The line to end on:** "Nobody should have to throw away 400 meals."

Do not quote a food-waste statistic unless you have checked the source. A story beats an unsourced number.

## 6. Pitch versions

**10 seconds (intro on stream)**
"We're No Meal Left Behind, and we built Food Rescue HQ: report it, text it, rescue it."

**30 seconds**
Use the judge version in section 3.

**2 minutes**
Follow `05-demo-script.md`. The story goes first (20 seconds), then the demo (about 2 minutes), then the stack and next steps (20 seconds).

## 7. Likely questions and honest answers

| Question | Answer |
|---|---|
| Why text messages instead of an app? | Partners install nothing and it works on any phone. In an emergency, no one downloads an app. |
| How do you know partners are trustworthy? | Not solved in the hackathon build. Next step: verified organizations and an approved partner list. |
| What about food safety? | The countdown models the safe window. A real version would follow local food-safety guidance and let the organizer set it. |
| What if nobody claims it? | Today the clock expires and shows what was not rescued. Next step: re-alert in waves and widen the group automatically. |
| What if two people claim the same food? | Claims are capped at what is left, so the unclaimed count never goes below zero. |
| Is the demo real or simulated? | Be straight: the text loop is real. The dashboard also has demo controls that simulate a reply, which we use as a backup if a text is slow. |
| How would this make money or sustain itself? | Not decided. Honest answer: start with event organizers who already have a food-waste problem, and figure out pricing after pilots. |
| What did you build in 4 hours vs. plan to build? | Built: report form, incident, SMS loop, live dashboard. Planned: location matching, verified partners, voice and phone-call reporting, WhatsApp. |
| Why a form and not voice? | A form is the fastest and most reliable input on stage. Voice and phone-call reporting are next steps. |
| What about privacy? | Phone numbers are only used for alerts, and people opt in with JOIN and leave with STOP. |

Answer "I don't know yet" plainly when you do not. It lands better than guessing.

## 8. Roles for the presentation

| Moment | Who |
|---|---|
| Story and problem | Naya |
| Live demo, filling in the report | Nikema |
| Phone partners texting | Whoever holds the phones |
| Tech explanation and next steps | Split |
| Closing line | Both together |

Decide this on the call. Rehearse the handoffs, not just the content.

## 9. Ultra-prepared checklist

- [ ] Team name chosen and said out loud once
- [ ] 10-second intro memorized
- [ ] 30-second pitch can be said without looking
- [ ] Story (section 5) practiced, with the closing line
- [ ] Answers to the top 5 questions rehearsed
- [ ] Roles split for the presentation
- [ ] Full demo rehearsed twice with phones, once without
- [ ] Phones charged, volume on, Do Not Disturb off for the demo numbers
- [ ] A second device logged in to the dashboard as a spare
- [ ] Reset the dashboard to idle right before going live
- [ ] Water, snacks, and a quiet place for the 4 hours

## 10. Open items you need to decide

- [ ] Which team name
- [ ] Whether to mention the hamster idea in the pitch (current plan: one line at the end)
- [ ] Which partner numbers are used in the demo and who holds them
