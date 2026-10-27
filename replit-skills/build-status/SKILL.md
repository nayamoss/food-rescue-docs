---
name: build-status
description: Keep the team updated on exactly where the Food Rescue HQ build is against the plan. Use after every task or prompt, whenever asked "status", "where are we", or "what's next", and before ending any turn that changed code.
---

# Build status

Two people (Naya and Nikema) are building Food Rescue HQ in a 4-hour hackathon and cannot see your internal plan. Your job with this skill is to make the state of the build impossible to misunderstand.

## The plan (source of truth)

App: crisis management for an absurd crisis (400 tacos, no guests, 45 minutes). Crisis HQ dashboard plus volunteers who reply by text. Node.js + Express, plain HTML/CSS/JS in `public/`, no database, state in memory saved to `data/state.json`, live updates over server-sent events, Twilio for texts. Deepgram is NOT part of this project. ElevenLabs is an optional stretch.

| # | Milestone | Done when |
|---|---|---|
| M1 | Dashboard and state | "Create sample incident" shows Urgent with a ticking 45:00 and 400 unclaimed. Fast-forward goes to 1:00 then Expired. Reset returns to Idle. Restarting keeps state. Volunteers are seeded. |
| M2 | Texts and keywords | `handleInbound(phone, body)` handles JOIN, CLAIM, CLAIM n, PICKED UP, STOP, HELP. `POST /api/simulate` and `POST /webhooks/twilio` both use it. Alerts go out through Twilio and fail soft if not configured. Demo buttons simulate replies. Two simulated claims and two pickups end in Rescued. |
| M3 | Tone and polish | Theatrical, absurd alert and dashboard wording. Escalating urgency labels. Celebration state on Rescued. Works at phone width. |
| M4 | Demo hardening | Failure paths tested (send fails, webhook down, bad input). Restart persistence confirmed. A full run works with demo controls only and with real phones. README and `.env.example` complete. |
| S1 | Stretch: spoken announcement | ElevenLabs line on rescue, silent fallback. Only after M1 to M4 pass. |

Do not start a milestone until the previous one is marked verified. Do not add features that are not in this table.

## What to do after every task

1. **Re-check reality.** Look at the actual files and run the app. Do not rely on memory of what you changed.
2. **Update `BUILD_STATUS.md`** in the project root (create it if missing) using the template below. Keep it short and current. Do not append forever; rewrite the top sections each time and keep only the last 10 changelog lines.
3. **Report in chat** using the status block below, as the last thing in your message.
4. **Commit** `BUILD_STATUS.md` with the code change.

## `BUILD_STATUS.md` template

```markdown
# Build status

Updated: {date and time}

## Where we are
Current milestone: {M1..M4 or S1}
State: {Not started | In progress | Built, not verified | Verified}
One line: {what works right now, in plain words}

## Milestones
| # | Milestone | Status | Evidence |
|---|---|---|---|
| M1 | Dashboard and state | {Not started / In progress / Built / Verified} | {what you ran and saw} |
| M2 | Texts and keywords | ... | ... |
| M3 | Tone and polish | ... | ... |
| M4 | Demo hardening | ... | ... |
| S1 | Spoken announcement | ... | ... |

## What changed in the last task
- {file or area}: {what and why}

## What is next
1. {single next step}
2. {optional second}

## How to run and test
- Run: {exact command}
- Open: {where}
- Click: {exact test steps and the expected result}

## Known issues
- {issue, where, impact} (or "None")

## Decisions needed from the team
- {question} (or "None")

## Secrets and setup still missing
- {env var or account step} (or "None")

## Changelog (last 10)
- {date} {one line}
```

## Chat status block (use exactly this shape)

```
STATUS
Milestone: {M#} {name}
State: {Not started | In progress | Built, not verified | Verified}
Works now: {one sentence}
Changed: {files}
Tested: {what you ran, and the result. If you did not run it, say "Not tested".}
Next: {single next step}
Needs from you: {decision, secret, or "Nothing"}
Known issues: {list or "None"}
```

## Rules

- **Never write "Verified" unless you ran it and saw the expected result.** Say "Built, not verified" instead, and say what you could not check.
- **Never hide a failure.** If something broke or you skipped something, it goes in Known issues with the exact error.
- **Be specific.** Name files, endpoints, and button labels. No phrases like "improved the UI".
- **Say what you did not do.** If the plan item is only partly done, state which part.
- **No scope creep.** If you think something extra would help, put it under "Decisions needed" and wait.
- **Keep it short.** The team reads this in under 30 seconds.
- If asked "where are we" or "status", answer with the chat status block only, built from a fresh look at the files, not from memory.
