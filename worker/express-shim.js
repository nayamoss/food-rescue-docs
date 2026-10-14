// A tiny Express-compatible router for the Cloudflare Worker.
// wrangler.jsonc aliases "express" to this file, so the shared lib modules (voice, sms, estimate,
// agent, quick) mount unchanged. It covers only what they and the worker use:
// app/Router .use/.get/.post/.patch/.delete, :params, query, express.json/urlencoded,
// res.status/json/type/send/set, and next(err) with 4-argument error handlers.

const TYPES = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  "text/plain": "text/plain; charset=utf-8",
  "text/xml": "text/xml; charset=utf-8",
};
const contentType = (t) => TYPES[t] || (t.includes("/") ? t : `application/${t}`);
const UNITS = { b: 1, kb: 1024, mb: 1024 * 1024 };
const bytes = (limit) => {
  const m = /^(\d+)\s*(b|kb|mb)$/i.exec(String(limit ?? "100kb"));
  return m ? Number(m[1]) * UNITS[m[2].toLowerCase()] : 100 * 1024;
};
const fail = (status, type, message) => Object.assign(new Error(message), { status, type });

function compile(path) {
  const keys = [];
  const source = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/:([A-Za-z_]\w*)/g, (_, k) => { keys.push(k); return "/([^/]+)"; });
  return { re: new RegExp(`^${source}/?$`), keys };
}

// Runs one handler. Resolves { err } when it calls next(err?), or null when it handled the request.
function call(fn, req, res, err) {
  return new Promise((resolve) => {
    let done = false;
    const next = (e) => { if (!done) { done = true; resolve({ err: e ?? null }); } };
    try {
      const isErrorHandler = fn.length === 4;
      if (err ? !isErrorHandler : isErrorHandler) return next(err);
      const out = err ? fn(err, req, res, next) : fn(req, res, next);
      Promise.resolve(out).then(() => { if (!done) { done = true; resolve(null); } }, next);
    } catch (e) { next(e); }
  });
}

export class Router {
  constructor() { this.layers = []; }
  use(first, ...rest) {
    if (typeof first === "string") this.layers.push({ prefix: first.replace(/\/+$/, ""), handlers: rest });
    else this.layers.push({ prefix: "", handlers: [first, ...rest] });
    return this;
  }
  route(method, paths, handlers) {
    for (const p of [].concat(paths)) this.layers.push({ method, ...compile(p), handlers });
    return this;
  }
  get(p, ...h) { return this.route("GET", p, h); }
  post(p, ...h) { return this.route("POST", p, h); }
  patch(p, ...h) { return this.route("PATCH", p, h); }
  delete(p, ...h) { return this.route("DELETE", p, h); }
  disable() { return this; }

  // Resolves null once a handler took the request, or { err } when nothing did.
  async handle(req, res, err = null) {
    for (const layer of this.layers) {
      let params = null;
      if (layer.method) {
        if (layer.method !== req.method && !(layer.method === "GET" && req.method === "HEAD")) continue;
        const m = layer.re.exec(req.path);
        if (!m) continue;
        params = Object.fromEntries(layer.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      } else if (layer.prefix && req.path !== layer.prefix && !req.path.startsWith(`${layer.prefix}/`)) {
        continue;
      }
      for (const h of layer.handlers) {
        let out;
        if (h instanceof Router) {
          const saved = req.path;
          req.path = req.path.slice(layer.prefix.length) || "/";
          out = await h.handle(req, res, err);
          req.path = saved;
        } else {
          if (params) req.params = params;
          out = await call(h, req, res, err);
        }
        if (out === null) return null;
        err = out.err;
      }
    }
    return { err };
  }
}

export class Res {
  constructor() { this.statusCode = 200; this.headers = new Headers(); this.body = null; this.sent = false; this.raw = null; }
  get headersSent() { return this.sent; }
  status(code) { this.statusCode = code; return this; }
  set(key, value) {
    if (typeof key === "object") for (const [k, v] of Object.entries(key)) this.headers.set(k, v);
    else this.headers.set(key, value);
    return this;
  }
  type(t) { this.headers.set("Content-Type", contentType(t)); return this; }
  send(body) {
    if (!this.headers.has("Content-Type")) this.headers.set("Content-Type", typeof body === "string" ? TYPES.html : "application/octet-stream");
    this.body = body ?? null;
    this.sent = true;
    return this;
  }
  json(value) {
    if (!this.headers.has("Content-Type")) this.headers.set("Content-Type", TYPES.json);
    return this.send(JSON.stringify(value));
  }
  // Worker-only: hand back an upstream Response (static assets), with our headers on top.
  sendResponse(response) { this.raw = response; this.sent = true; return this; }
  toResponse(method) {
    if (this.raw) {
      const out = new Response(method === "HEAD" ? null : this.raw.body, this.raw);
      for (const [k, v] of this.headers) out.headers.set(k, v);
      return out;
    }
    const empty = method === "HEAD" || this.statusCode === 204 || this.statusCode === 304;
    return new Response(empty ? null : this.body, { status: this.statusCode, headers: this.headers });
  }
}

// Builds the request object the handlers see. rawBody is read once by the worker.
export function makeReq({ method, path, search, headers, rawBody }) {
  const query = {};
  for (const [k, v] of new URLSearchParams(search)) query[k] = k in query ? [].concat(query[k], v) : v;
  return {
    method, path, url: path + (search || ""), query, params: {}, headers: Object.fromEntries(headers),
    get: (name) => headers.get(name), rawBody, body: undefined, _parsed: false,
  };
}

function json({ limit } = {}) {
  const max = bytes(limit);
  return (req, _res, next) => {
    if (req._parsed || !/\bjson\b/i.test(req.get("content-type") || "")) return next();
    if (req.rawBody.length > max) return next(fail(413, "entity.too.large", "request entity too large"));
    req._parsed = true;
    if (!req.rawBody) { req.body = {}; return next(); }
    try { req.body = JSON.parse(req.rawBody); } catch { return next(fail(400, "entity.parse.failed", "invalid json")); }
    next();
  };
}

function urlencoded({ limit } = {}) {
  const max = bytes(limit);
  return (req, _res, next) => {
    if (req._parsed || !/application\/x-www-form-urlencoded/i.test(req.get("content-type") || "")) return next();
    if (req.rawBody.length > max) return next(fail(413, "entity.too.large", "request entity too large"));
    req._parsed = true;
    req.body = Object.fromEntries(new URLSearchParams(req.rawBody));
    next();
  };
}

export default function express() { return new Router(); }
express.Router = () => new Router();
express.json = json;
express.urlencoded = urlencoded;
