# Feasibility, decisions, and reconciliation with the other plan

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

This reconciles the pasted "Product & Architecture Plan" and the planning chat with docs 01 to 10. It does not replace them. The PRD is `01-prd.md`, with feature specs in `02-features.md`. There is one PRD, not one per feature.

Not verified: the two documents that chat mentions (PRD and Feasibility download links) were not accessible, so only the text that was pasted was used. If those files contain API contracts or Replit prompts you want merged in, paste or drop them in the repo and they can be folded in.

## 1. What the other plan adds, and what to adopt

| Idea | Adopt? | How it lands in our docs |
|---|---|---|
| One backend owns the state of every incident. Neither the dashboard nor an inbound text decides success on its own. | Yes | Already how `03-technical-design.md` works (`handleInbound` is the single path). Make it an explicit rule. |
| Activity events as an auditable timeline | Yes | Our `feed` becomes a first-class `ActivityEvent` log with actor and type. Judges see how the crisis evolved. |
| Explicit incident state machine | Yes | See section 3. |
| Assignment as its own entity | Yes | Our `Claim` is renamed `Assignment`, same shape plus a few statuses. |
| Message entity (direction, delivery status) | Yes, small | Log every SMS in and out. Useful for debugging a failed text mid-demo. |
| Role selection / welcome screen | No for MVP | One dashboard plus SMS. Field people use text messages, so there is no field screen to build. A `/v` page stays P2. |
| Separate incident detail and mission detail screens | No for MVP | Folded into the dashboard, as that plan itself suggests. |
| HQ approves every assignment | Optional | See decision 2. |

## 2. The four decisions to settle on the call

The other plan asks these and proposes defaults. Here is my recommendation for each, with the reason, so you can accept or change it quickly.

| # | Question | Other plan default | My recommendation | Why |
|---|---|---|---|---|
| 1 | Who creates an incident? | Organizer or HQ | **Organizer or HQ, through the same report form and endpoint.** | Matches the demo flow and the demo-control safety net. |
| 2 | Auto-assign or HQ approves? | HQ approves | **Auto-confirm on CLAIM, HQ can cancel or reassign.** | An approval step adds a click to the live demo and one more place for it to stall. Keep HQ in control with an override instead of a gate. |
| 3 | One person per incident, or portions? | One person | **Portions.** Several partners each claim part of the 400. | The counter climbing through several claims is the visual payoff. One person taking all 400 is a single anticlimactic step. |
| 4 | Who resolves it? | HQ verifies | **Auto-resolve when all portions are picked up. HQ can mark a pickup failed.** | Keeps the loop fast. An HQ "verify" click can be added as a P2 beat if you want a human in the loop on screen. |

If you pick "HQ approves" for decision 2, add: `Assignment.status = pending`, an Approve button on the dashboard, and a text back to the partner on approval. Roughly 30 to 45 more minutes of work.

## 3. State machines

### Incident

| State | Meaning | Moves to |
|---|---|---|
| Reported | Submitted, being validated (the confirm form) | Open |
| Open | Alerts sent, food unclaimed or partly claimed | In progress, Resolved, Expired, Cancelled |
| In progress | All food claimed, pickups underway | Resolved, Expired |
| Resolved | All portions picked up | none |
| Expired | Deadline passed with food remaining | none |
| Cancelled | HQ cancelled | none |

Dashboard labels in `plan.html` map as: Urgent = Open, Rescuing = In progress, Rescued = Resolved, Expired = Expired.

### Assignment (one partner's portion)

| State | Meaning | Moves to |
|---|---|---|
| Claimed | Partner replied CLAIM | Picked up, Cancelled, Failed |
| Picked up | Partner replied PICKED UP | none |
| Cancelled | HQ or the partner released it | Quantity returns to unclaimed |
| Failed | Deadline passed with no pickup | Quantity counts as not rescued |

Exception handling in the MVP: expired, cancelled, failed pickup. Reassignment is simply "returned to unclaimed, then re-alert", which is a P2 feature.

## 4. Data model changes

Update the model in `03-technical-design.md` as follows.

```ts
type Assignment = {            // was Claim
  id: string;
  incidentId: string;
  participantId: string;       // was volunteerId
  quantity: number;
  status: "claimed" | "picked_up" | "cancelled" | "failed";
  claimedAt: string;
  pickedUpAt?: string;
};

type Message = {
  id: string;
  participantId: string;
  direction: "out" | "in";
  body: string;
  deliveryStatus?: "sent" | "failed";   // out only
  at: string;
};

type ActivityEvent = {
  id: string;
  incidentId?: string;
  type: "incident_created" | "alert_sent" | "claimed" | "picked_up" | "cancelled" | "expired" | "resolved";
  actor: string;                // participant name, "HQ", or "system"
  text: string;
  at: string;
};
```

The incident `status` values become `reported | open | in_progress | resolved | expired | cancelled`.

## 5. Feasibility

Assessment for a two-person team and a 4-hour build, P0 scope only. These are estimates, not measurements.

| Capability | Difficulty | Main risk | Fallback |
|---|---|---|---|
| Replit hosting and public URL | Low | Repl sleeping during the demo | Keep the tab open, ping the URL |
| Dashboard with live updates (SSE) | Low | None significant | Poll `/api/state` every 3 s |
| Incident, assignment, state transitions | Low to medium | Logic bugs in edge cases | One handler, tested through `/api/simulate` |
| Twilio outbound SMS | Medium | Trial limits, number registration, carrier filtering | Simulate controls, verified demo numbers |
| Twilio inbound webhook | Low | Wrong webhook URL or port | Smoke test before the day |
| Report form and validation | Low | Bad input | Defaults prefilled, inline validation |
| ElevenLabs announcement | Low | API or key issue | Skip silently |
| Persistence | Low | Corrupt file on a crash | Reset button |

**Overall:** feasible if you hold to the P0 list and the cut line in `04-build-plan.md`. The two integrations most likely to eat time are Twilio delivery and browser audio, so both get tested before the day.

**Not feasible in 4 hours alongside P0:** HQ approval flow, partner web page, phone-call reporting, WhatsApp, geolocation matching. Keep those in the pitch as next steps.

### Cost and credits

Not verified, so treat as things to check rather than numbers:
- Replit Agent usage is metered. Check your remaining balance before the day and whether the event provides credits.
- Twilio credits and trial removal go through Chris (send only the Account SID).
- ElevenLabs: check what the account includes before the day (optional).
- Plan-first prompting (below) is the best way to avoid burning credits on a wrong build.

## 6. What to give Replit Agent vs. build by hand

| Give to Replit Agent | Build and verify yourselves |
|---|---|
| Express boilerplate, routes, static serving | Inbound keyword handler and state transitions (`lib/inbound.js`) |
| Dashboard layout, CSS, components | Data model and persistence rules |
| Simple endpoints (state, reset, incidents) | Twilio webhook contract and signature handling |
| Demo-controls panel UI | Report form validation rules |
| Celebration visual | Demo script and rehearsal |

Reason: the agent is good at repetitive scaffolding and weak at your specific rules. Anything where a wrong answer breaks the demo, you own.

### Prompt 0: plan only (run this first, before any build prompt)

```
Read the docs folder, especially 01-prd.md, 02-features.md, 03-technical-design.md and
11-feasibility-and-decisions.md. Do not write any code yet. Reply with: (1) the file list you
would create, (2) the data model you would use, (3) the endpoints, (4) anything in the docs
that is ambiguous or conflicts. Wait for approval before building.
```

The hour-by-hour build prompts are in `07-build-prompts-and-tech-map.md`. Run them one at a time and review each result before the next.

## 7. Your workflow mapped to the four hours

Your factory stages (research, plan, verify, implement, test, review) map like this.

| Stage | When | Output |
|---|---|---|
| Research | Before the day | Brief read, accounts and integrations smoke-tested (`06-prebuild-checklist.md`) |
| Plan | 30-minute planning window | Four decisions settled, owners assigned, cut line agreed |
| Verify | Start of each hour | Run Prompt 0 style check: does the agent's plan match the docs? |
| Implement | Hours 1 to 3 | One milestone per hour (`04-build-plan.md`) |
| Test | End of each hour | Milestone check on real phones, not just the browser |
| Review | Hour 4 | Visual pass, two full rehearsals, one fallback drill |

## 8. Updated first milestone

Same as the other plan, adapted: **create incident, see it on HQ, claim from a phone, mark picked up, see it resolve.** If that loop works with demo controls only (no real texts), you already have a demo. Real SMS then upgrades it.

## 9. Still open

- [ ] The four decisions in section 2
- [ ] Whether to merge anything from the two downloadable documents in the other chat
- [ ] Whether HQ approval is worth the extra 30 to 45 minutes
