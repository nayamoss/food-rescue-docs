# Screens, architecture, and platform choices

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Answers: what screens exist, what the architecture is, whether this is a PWA or mobile app, what Replit and Lovable use, and what to do solo before the day.

## 1. Decision summary

| Question | Decision |
|---|---|
| Native mobile app? | No. It would cost hours and add nothing to the demo. Mention it as a next step. |
| PWA? | No. Not needed for judging, costs setup time. |
| What is it? | A responsive web app (dashboard + mic) plus SMS for partners |
| Why this works | Partners install nothing, they just get texts. The organizer only needs a browser. |
| Frontend | Plain HTML, CSS and vanilla JS served by Express. Default choice, no build step. |
| Alternative | React + Vite + Tailwind scaffolded by Replit Agent. Costs roughly 20 to 30 more minutes, only choose it if you prefer it. |

## 2. Screens

| # | Screen | Route | Purpose | Priority |
|---|---|---|---|---|
| 1 | Command center dashboard | `/` | State pill, countdown, counters, partners table, activity feed | P0 |
| 2 | Report panel | `/` (panel) | Quick report form with a confirm step (quantity, item, location, minutes) | P0 |
| 3 | Demo controls panel | `/` (panel) | Create sample incident, simulate reply, fast-forward, reset | P0 |
| 4 | Partner experience | SMS | Alert, claim confirmation, pickup thanks, help text | P0 |
| 5 | Partner web page | `/v` | Claim and Picked up buttons for people who prefer a screen | P2 |

There is no login, settings, or account page.

### Dashboard states

| State | What the screen shows |
|---|---|
| IDLE | "All clear. No surplus food reported." with the report form prominent |
| URGENT | Countdown running, unclaimed count high, alert text sent |
| RESCUING | Claims coming in, rescued counter rising |
| RESCUED | "400 meals rescued" celebration, incident closed |
| EXPIRED | Remaining food marked not rescued, partial result shown |

## 3. Architecture

```
Browser (dashboard + report form)
   |  POST report                        ^ live updates (SSE)
   v                                     |
Replit: Express server  <---- POST /webhooks/twilio ----  Partner phone (SMS)
   |                                                            ^
   +---------- Twilio Messages API (alerts, confirmations) -----+
   +---------- ElevenLabs (optional announcement audio)
```

- One server, one Repl, one public URL.
- State in memory, saved to `data/state.json` on every change.
- Dashboard gets live updates over Server-Sent Events, with a 3 second poll as backup.
- Full endpoints, data model, keyword logic, and failure fallbacks: see `03-technical-design.md`.

## 4. What Replit and Lovable use

| Platform | Default stack | Source |
|---|---|---|
| Replit Agent | React + Vite + Tailwind + shadcn/ui frontend, Express backend, often Postgres | Replit docs and tutorials |
| Lovable | React + TypeScript + Vite + Tailwind + shadcn/ui, Supabase backend | Lovable FAQ |

They share the same frontend family, so Tailwind and shadcn knowledge carries across both. Tailwind is the styling default in both.

Mobile on Replit: Expo (React Native) is supported through an Expo template. Possible, but not recommended for the 4-hour window.

Sources:
- https://docs.replit.com/learn/mobile/expo
- https://expo.dev/blog/from-idea-to-app-with-replit-and-expo
- https://lovable.dev/faq/capabilities/tech-stack/lovable-tech-stack
- https://www.rapidevelopers.com/md/replit-tutorial/how-to-set-up-a-full-stack-javascript-application-on-replit-with-proper-routing

Note: the Replit stack details are from tutorial pages, not a verified Replit statement of defaults. Confirm in Replit when you create the project.

## 5. What you can do solo before the day

In this order:

1. [ ] Create a hello-world Express Repl, open the URL on your phone
2. [ ] Add one Secret, read it with `process.env`
3. [ ] Check the Twilio console shows your Account SID and remaining funds
4. [ ] Confirm Twilio can send you a text and hit a webhook (once the number exists)
5. [ ] Read the S3.E9 challenge doc and note required tools, judging, and submission rules

Start with #1. It is the part you know least and everything depends on it.

## 6. Mobile story for the demo

Say this when asked: "Partners don't need to install anything, it works over SMS on any phone. The organizer dashboard is responsive web. A native app is the next step, not a requirement."
