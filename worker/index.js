// Food Rescue HQ on Cloudflare Workers. Same routes as artifacts/api-server/server.js, state in D1.
// Each request: load the state document (hydrate), run the synchronous core logic, save once (persist).
// Calls placed after a response run through ctx.waitUntil. Expiry runs on every request and on the cron.
import { AsyncLocalStorage } from "node:async_hooks";
import express, { Res, makeReq } from "./express-shim.js";
import * as core from "../artifacts/api-server/lib/core.js";
import { registerQuick } from "../artifacts/api-server/lib/quick.js";
import { registerEstimate } from "../artifacts/api-server/lib/estimate.js";
import { registerAgent } from "../artifacts/api-server/lib/agent.js";
import * as voice from "../artifacts/api-server/lib/voice.js";
import * as sms from "../artifacts/api-server/lib/sms.js";

const PREFIX = "/food-rescue-hq";
const PHONE = /\+?\d[\d\s().-]{5,}\d/g; // activity_log never stores phone-like text

// ---- D1 store ---------------------------------------------------------------
// One row (id "main") holds the whole state document. `version` guards against lost updates:
// a save only lands if nobody else saved since we loaded, otherwise the request gets a 409.
class ConflictError extends Error {}
let db = null;
const d1Store = () => {
  let version = -1; // -1 unknown, 0 no row yet
  let forceReload = false;
  let logged = new Set(); // feed ids already copied to activity_log
  const remember = (s) => { logged = new Set((s?.feed ?? []).map((f) => f.id)); };
  return {
    async load(dirty) {
      const row = await db.prepare("SELECT version, CASE WHEN version = ?1 THEN NULL ELSE json END AS json FROM app_state WHERE id = 'main'")
        .bind(version).first();
      const latest = row ? row.version : 0;
      if (latest === version && !forceReload) return undefined;
      if (dirty && !forceReload) return undefined; // keep local edits; the save then fails its version check
      forceReload = false;
      version = latest;
      if (!row) { remember(null); return null; }
      const s = JSON.parse(row.json ?? (await db.prepare("SELECT json FROM app_state WHERE id = 'main'").first("json")));
      remember(s);
      return s;
    },
    async save(state) {
      const base = version;
      const now = new Date().toISOString();
      const json = JSON.stringify(state);
      const r = base <= 0
        ? await db.prepare("INSERT INTO app_state (id, json, updated_at, version) VALUES ('main', ?1, ?2, 1) ON CONFLICT(id) DO NOTHING").bind(json, now).run()
        : await db.prepare("UPDATE app_state SET json = ?1, updated_at = ?2, version = version + 1 WHERE id = 'main' AND version = ?3").bind(json, now, base).run();
      if (!r.meta?.changes) { forceReload = true; throw new ConflictError("state changed elsewhere"); }
      version = Math.max(base, 0) + 1;
      const fresh = state.feed.filter((f) => f?.id && !logged.has(f.id)).reverse();
      remember(state);
      if (fresh.length) {
        const insert = db.prepare("INSERT OR IGNORE INTO activity_log (id, at, text, kind) VALUES (?1, ?2, ?3, ?4)");
        await db.batch(fresh.map((f) => insert.bind(f.id, f.at, String(f.text ?? "").replace(PHONE, "[number hidden]"), f.kind || "hq")));
      }
    },
  };
};
core.useStore(d1Store());

// Every load and save in this isolate runs one at a time, so versions stay in step.
let chain = Promise.resolve();
const locked = (fn) => { const run = chain.then(fn); chain = run.catch(() => {}); return run; };

// ---- background work ----------------------------------------------------------
// Work queued during a request (outbound calls) starts only after the state is saved.
const requestWork = new AsyncLocalStorage();
const later = (fn) => { const list = requestWork.getStore(); if (list) list.push(fn); else fn().catch(() => {}); };

async function placeCallsNow() {
  const ids = core.takePendingCalls();
  if (!ids.length) return;
  const calls = voice.callForOffers(voiceCore, ids);
  const texts = process.env.SMS_ENABLED === "true" ? sms.textForOffers(voiceCore, ids) : null;
  const [c, t] = await Promise.allSettled([calls, texts]);
  if (c.status === "rejected") console.error("Voice call failed", c.reason?.name);
  if (t.status === "rejected") console.error("Text message failed", t.reason?.name);
}
const placeCalls = () => { later(placeCallsNow); return Promise.resolve(); };

// Same adapter as server.js: voice and sms see real phones server side only.
const voiceCore = {
  getState: () => core.internalState(),
  volunteerPhone: (id) => core.volunteerPhone(id),
  describeOffer: (id) => core.describeOffer(id),
  respondToOffer: (id, action) => { const snap = core.respondToOffer(id, action); placeCalls(); return snap; },
  addFeed: (text) => { try { core.postUpdate(text); } catch { /* feed is best effort */ } },
  pickupOffer: (id) => core.pickupOffer(id),
  dropoffOffer: (id) => core.dropoffOffer(id),
};

// ---- routes (mirrors artifacts/api-server/server.js) ---------------------------
const app = express();
registerEstimate(app);
voice.registerVoice(app, voiceCore);
sms.registerSms(app, voiceCore);
app.use(express.json({ limit: "64kb" }));
app.use("/api", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
for (const hook of ["/sms/inbound", "/voice/offer", "/voice/answer"]) {
  app.get(hook, (_req, res) => res.type("text/plain").send("This address is for Twilio. It is working. Texts and calls are sent here with POST."));
}
app.get("/api/healthz", (_req, res) => res.json({ status: "ok", runtime: "cloudflare-workers" }));
app.get("/api/state", (_req, res) => { core.expire(); res.json(core.snapshot()); });
// No long-lived SSE on Workers: 204 tells EventSource to stop, and the page keeps its 3 second polling.
app.get("/api/stream", (_req, res) => res.status(204).set("Cache-Control", "no-store").send(""));
const route = (status, fn, after) => async (req, res, next) => {
  try {
    const out = fn(req);
    res.status(status).json(out);
    if (after) await after();
  } catch (error) { next(error); }
};
registerAgent(app, core);
app.post("/api/incidents", route(201, (req) => core.createIncident(req.body)));
app.post("/api/demo/fast-forward", route(200, () => core.fastForward()));
app.post("/api/updates", route(201, (req) => core.postUpdate(req.body?.text)));
app.post("/api/demo/reset", route(200, () => core.reset()));
app.post("/api/demo/reset-all", route(200, () => core.resetAll()));
app.post("/api/event", route(201, (req) => core.createEvent(req.body)));
app.patch("/api/event", route(200, (req) => core.patchEvent(req.body)));
app.post("/api/report", route(201, (req) => core.submitReport(req.body)));
registerQuick(app, core, placeCalls);
app.post("/api/offers/send", route(200, (req) => core.sendOffers(req.body), placeCalls));
app.post("/api/offers/:id/respond", route(200, (req) => core.respondToOffer(req.params.id, req.body?.action), placeCalls));
app.post("/api/offers/:id/pickup", route(200, (req) => core.pickupOffer(req.params.id)));
app.post("/api/offers/:id/dropoff", route(200, (req) => core.dropoffOffer(req.params.id)));
app.post("/api/offers/:id/call", async (req, res) => {
  const offer = core.getOffer(req.params.id);
  if (!offer) return res.status(404).json({ error: "That offer no longer exists." });
  try {
    const out = await voice.callForOffers(voiceCore, [offer.id]);
    if (out?.skipped) return res.status(409).json({ error: "Calls are not set up yet." });
    const r = out?.results?.[0];
    if (r?.ok) return res.json({ ok: true, message: "Calling now. Answer and press 1 to accept." });
    if (r?.skipped) return res.status(409).json({ error: "Add a real phone number for this volunteer first." });
    return res.status(502).json({ error: "The call did not go through. Check the number and try again." });
  } catch (error) {
    console.error("Call now failed", error?.name);
    return res.status(502).json({ error: "The call did not go through. Try again." });
  }
});
app.post("/api/volunteers", route(201, (req) => core.addVolunteer(req.body)));
app.patch("/api/volunteers/:id", route(200, (req) => core.patchVolunteer(req.params.id, req.body)));
app.delete("/api/volunteers/:id", route(200, (req) => core.deleteVolunteer(req.params.id)));
app.post("/api/volunteers/:id/phone", route(200, (req) => core.setVolunteerPhone(req.params.id, req.body?.phone)));
app.post("/api/places", route(201, (req) => core.addPlace(req.body)));
app.patch("/api/places/:id", route(200, (req) => core.patchPlace(req.params.id, req.body)));
app.delete("/api/places/:id", route(200, (req) => core.deletePlace(req.params.id)));

// ---- app files (from the static assets binding, never cached) -------------------
const asset = (req, file) => req.env.ASSETS.fetch(new Request(new URL(file, req.origin)));
const NO_STORE = "no-store";
app.get("/v/:id", async (req, res) => {
  const r = await asset(req, "/v.html");
  if (r.ok) return res.set("Cache-Control", NO_STORE).sendResponse(r);
  res.type("html").send("<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><title>Food Rescue HQ</title><p style='font-family:sans-serif;padding:24px'>Volunteer page coming soon.</p>");
});
app.use("/api", (_req, res) => res.status(404).json({ error: "Endpoint not found." }));
// Versioned asset URLs, like server.js: each deploy gets new file names.
const tag = (build) => (html) => html.replace('href="/styles.css"', `href="/styles.css?v=${build}"`).replace('src="/main.js"', `src="/main.js?v=${build}"`);
const versioned = (file, type, fix) => async (req, res) => {
  const r = await asset(req, file);
  if (!r.ok) return res.status(r.status).type("text/plain").send("Not found");
  res.set("Cache-Control", NO_STORE).type(type).send(fix(req.build)(await r.text()));
};
app.get(["/", "/index.html"], versioned("/index.html", "html", tag));
app.get("/v.html", versioned("/v.html", "html", tag));
app.get("/main.js", versioned("/main.js", "js", (build) => (js) => js.replace("'/rescue-chat.js'", `'/rescue-chat.js?v=${build}'`)));
app.use(async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  res.set("Cache-Control", NO_STORE).sendResponse(await asset(req, req.path));
});

function handleError(err, res) {
  if (err instanceof core.HttpError) return res.status(err.status).json({ error: err.message });
  if (err?.status === 413) return res.status(413).json({ error: "That request is too large." });
  if (err?.status === 400 || err?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON request." });
  console.error("Request failed", err?.name, err?.message);
  return res.status(500).json({ error: "Unable to save or load state. Please try again." });
}

const STATEFUL = /^\/(api|voice|sms)(\/|$)/;
const ISOLATE_BUILD = Date.now().toString(36);

function syncEnv(env, origin) {
  for (const [k, v] of Object.entries(env)) if (typeof v === "string") process.env[k] = v;
  if (!process.env.PUBLIC_BASE_URL && origin) process.env.PUBLIC_BASE_URL = origin;
}

async function saveOrConflict(res) {
  try {
    await locked(() => core.persist());
  } catch (error) {
    await locked(() => core.hydrate()).catch(() => {});
    res.raw = null;
    res.set("Cache-Control", "no-store");
    if (error instanceof ConflictError) {
      res.status(409).json({ error: "Someone else changed the board at the same moment. Please try again." });
    } else {
      console.error("Save failed", error?.name, error?.message);
      res.status(500).json({ error: "Unable to save or load state. Please try again." });
    }
    return false;
  }
  return true;
}

export default {
  async fetch(request, env, ctx) {
    db = env.DB;
    const url = new URL(request.url);
    syncEnv(env, url.origin);
    let path = url.pathname;
    if (path === `${PREFIX}/api` || path.startsWith(`${PREFIX}/api/`)) path = path.slice(PREFIX.length);
    const stateful = STATEFUL.test(path);
    const res = new Res();
    const work = [];
    return requestWork.run(work, async () => {
      const rawBody = ["GET", "HEAD"].includes(request.method) ? "" : await request.text();
      const req = makeReq({ method: request.method, path, search: url.search, headers: request.headers, rawBody });
      Object.assign(req, { env, origin: url.origin, build: env.CF_VERSION_METADATA?.id?.slice(0, 8) || ISOLATE_BUILD });
      if (stateful) {
        try { await locked(() => core.hydrate()); } catch (error) {
          console.error("Load failed", error?.name, error?.message);
          return new Response(JSON.stringify({ error: "Unable to save or load state. Please try again." }), { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
        }
      }
      const out = await app.handle(req, res);
      if (out && !res.sent) {
        if (out.err) handleError(out.err, res);
        else res.status(404).type("text/plain").send(`Cannot ${request.method} ${path}`);
      }
      // Let fire-and-forget follow-ups (quick.js runs its after() on the next microtask) queue their work.
      await new Promise((r) => setTimeout(r, 0));
      const saved = stateful ? await saveOrConflict(res) : true;
      if (saved && work.length) {
        ctx.waitUntil((async () => {
          for (const fn of work) { try { await fn(); } catch (e) { console.error("Background work failed", e?.name); } }
          await locked(() => core.persist()).catch((e) => console.error("Background save failed", e?.name));
        })());
      }
      return res.toResponse(request.method);
    });
  },

  // Every minute: close incidents whose safety window has ended, even when nobody has the page open.
  async scheduled(_controller, env) {
    db = env.DB;
    syncEnv(env, "");
    await locked(async () => { await core.hydrate(); await core.persist(); });
  },
};
