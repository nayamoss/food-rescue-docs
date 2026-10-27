# How to prompt the build (walkthrough)

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

For Replit Agent, or any AI coding assistant. The goal is a working demo in 4 hours without burning credits on wrong builds.

Not verified: the exact buttons and modes in Replit's current interface (for example a plan mode or checkpoints). If you see them, use them. The method below works either way.

## 1. The five rules

1. **One milestone per prompt.** Never "build the whole app." One prompt, one result you can test.
2. **Plan first, build second.** Ask for a plan, read it, correct it, then say go.
3. **Paste the spec.** The agent cannot see our docs, so each prompt carries the spec it needs. Use `14-replit-prompt-pack.md`.
4. **Say what NOT to do.** Agents add things. Name the limits: no framework, no database, no new features.
5. **Test after every prompt.** Run it, click it, text it. Do not stack a new prompt on a broken one.

## 2. The loop

```
Plan prompt  ->  read the plan  ->  fix the plan  ->  Build prompt  ->  run it  ->  Test  ->  (Fix prompt)  ->  next milestone
```

Time budget per loop: about 15 minutes of agent time plus 5 minutes of your testing. That is why you have roughly four loops, one per hour.

## 3. The prompt template

Use this shape for every build prompt.

```
GOAL: one sentence, what should work when this is done.
CONTEXT: the relevant spec pasted into the prompt (the agent cannot open our docs).
BUILD: the specific pieces, as a short list.
DO NOT: the limits.
DONE WHEN: how I will test it.
```

### Worked example (hour 1)

```
GOAL: A dashboard that shows an incident with a live countdown, and a button that creates a sample incident.
CONTEXT: state shape, endpoints and UI rules pasted inline (see 14-replit-prompt-pack.md).
BUILD:
- Express server with GET /, GET /api/state, GET /api/stream (server-sent events), POST /api/incidents, POST /api/reset
- State in memory, saved to data/state.json
- One page in public/ with state label, countdown, four counters, partners table, activity feed
- A "Create sample incident" button (400 meals, main hall, 45 minutes)
DO NOT: add Twilio yet, add a database, add a framework, add login, or add pages other than "/".
DONE WHEN: I click the button and the dashboard goes urgent with a ticking clock and 400 unclaimed.
```

## 4. Your prompt sequence

The full paste-ready prompt for each hour is in `14-replit-prompt-pack.md`. Use them in this order.

| Order | Prompt | When | Check before moving on |
|---|---|---|---|
| 0 | Plan only (in `11-feasibility-and-decisions.md`) | First 15 minutes | The agent's file list, data model and endpoints match the docs |
| 1 | Skeleton, state, dashboard | Hour 1 | Sample incident shows on the dashboard |
| 2 | Twilio alerts and reply keywords | Hour 2 | A real text changes the dashboard in 5 seconds |
| 3 | Absurd wording, celebration, polish | Hour 3 to 4 | Full run works on phones and on demo controls |

## 5. How to read the plan before saying go

When the agent returns a plan, check three things:

- **Files:** are they the ones in `03-technical-design.md`, or did it invent a framework?
- **Scope:** does it include anything you did not ask for (login, database, settings page)? Cut it.
- **Order:** does it build the dashboard first? If it starts with Twilio, redirect it.

Reply with corrections, not a rewrite:

```
Good plan. Changes: remove the database and use the JSON file. Skip the settings page. Build in this order: server, state, dashboard, then stop. Go.
```

## 6. How to fix things (the fix prompt)

Be specific about what you saw, not what you think is wrong.

**Bad:** "It doesn't work."

**Good:**
```
When I click "Create sample incident", nothing changes on the dashboard. The browser console shows: [paste the exact error]. The server log shows: [paste]. Fix only this. Do not change anything else.
```

Always include:
- What you did
- What you expected
- What happened instead
- The exact error text, if any

If two attempts fail, stop. Ask the agent: "Explain what you think is wrong in plain words and list two possible causes before changing any code."

## 7. Phrases that save time

| Situation | Say |
|---|---|
| Agent is adding extras | "Stop. Only do what I listed. Remove anything else." |
| You do not understand a change | "Explain what you changed in two sentences, in plain language." |
| It rewrote too much | "Revert that and make the smallest possible change." |
| You want to see before it builds | "Do not write code yet. Show me the plan." |
| You are running low on time | "Make it work with the simplest approach, skip polish." |
| An integration fails | "Add a fallback so the app keeps running if this call fails, and log the error to the activity feed." |

## 8. Protect what already works

- **Commit or checkpoint after every working milestone.** Name it: "hour 1 dashboard works."
- **Never ask for a big refactor** in the last hour.
- **Keep a known-good version.** If hour 4 breaks something, go back one step instead of debugging.

## 9. Credit-saving habits

- Plan prompts are cheaper than failed builds.
- Short, specific prompts beat long speculative ones.
- Do not ask the agent to "improve" or "make it better." Ask for one named change.
- Fix one bug per prompt.
- Check your balance at the start so the budget is known. Not verified: how this event's credits are applied.

## 10. What you and Nikema do yourselves

Do not delegate these to the agent:

- Deciding the four product choices
- The reply keyword rules and state transitions (read the code it writes)
- Putting keys into Replit Secrets
- Testing with real phones
- The demo script and rehearsal

## 11. Splitting prompts between two people

- **One agent session per person** only if you work in separate folders. Two sessions editing the same file will overwrite each other.
- Suggested split: Naya prompts for `public/` (dashboard, styling). Nikema prompts for `lib/` (Twilio, inbound).
- Agree on the data model and endpoint names first (`03-technical-design.md`), so each side can build against the same contract.
- Before merging a long session, ask: "List every file you changed and why."

## 12. Quick reference card

```
Plan first. One milestone. Point at the docs. Say what NOT to do.
Test every time. Fix one thing per prompt. Checkpoint what works.
```
