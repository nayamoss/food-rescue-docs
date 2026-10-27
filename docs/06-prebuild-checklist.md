# Food Rescue HQ: Pre-build Checklist and Risks

> **Update 2026-10-14:** the concept is now event food waste routed to shelters and partner organizations, and alerts are phone calls, not SMS. Where this doc mentions SMS or text keywords, see [`00-current-plan.md`](00-current-plan.md).

Do these before the clock starts. Each one removes a way to lose the first hour.

## Accounts and access

- [ ] Fresh Twilio account created (per the sponsor email), Account SID starts with `AC`
- [ ] Account SID sent to Chris for credits and moving out of trial mode (SID only, nothing else)
- [ ] Twilio number purchased or assigned, confirmed it can send SMS
- [ ] Twilio Dev Phone considered for local testing (note: it changes the number's webhooks, so use a separate test number or reset the webhook afterward)
- [ ] ElevenLabs account and API key (optional), one TTS call tested
- [ ] Replit account, both people can open the same Repl

## Replit warm-up (Naya, 30 minutes)

- [ ] Create an Express hello-world Repl
- [ ] Confirm the public URL loads from a phone
- [ ] Add one Secret and read it from `process.env`
- [ ] Confirm the Repl stays running and note how restart works
- [ ] Hit the URL from a Twilio webhook test and see the request in the logs

## Twilio smoke test

- [ ] Point the number's inbound SMS webhook at `{Repl URL}/webhooks/twilio`
- [ ] Text the number from a personal phone, see `From` and `Body` in the logs
- [ ] Reply with TwiML and confirm the text comes back
- [ ] Send one outbound message from the server to a personal phone

## Demo logistics

- [ ] Pick 2 to 3 partner phone numbers, all verified in Twilio if the account is still in trial
- [ ] Each partner texts JOIN once beforehand
- [ ] Decide who holds which phone during the demo

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Twilio trial only texts verified numbers | High | High | Get SID to Chris early, verify demo numbers, use simulate controls as backup |
| US SMS from a new number gets filtered or blocked (carrier registration rules) | Medium | High | Check with the sponsor which number to use, test with real phones in hour 2, keep simulate controls |
| Webhook cannot reach Replit | Medium | High | Smoke test before the day, check the Repl URL and port |
| Repl goes to sleep mid-demo | Medium | High | Keep the tab open, ping the URL before the demo, state persists to file |
| Scope creep (conversations, WhatsApp, maps) | High | High | Cut line in 04-build-plan.md, review it at the start of each hour |
| Two people editing the same file | Medium | Medium | One owner per area, talk before touching `server.js` |
| Official brief requires something we did not plan for | Medium | Medium | Read the brief during the 30-minute planning window and update 01-prd.md |
| Secrets leaked in screen share | Low | High | Close the Secrets panel before presenting, never paste keys into chat or docs |

## Not verified when these docs were written

- The official S3.E9 brief, judging criteria, and which sponsor tech is required vs optional
- The Notion and Google Doc brainstorm links (not opened)
- Whether the team Twilio number needs additional registration to text US numbers
- Current Twilio SDK version and call signatures (check the vendor docs when coding)
