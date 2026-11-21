const COOKIE_NAME = "hakili_site_lock";
const LOCK_POST_PATH = "/__hakili_lock";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const enc = new TextEncoder();

async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacDigest(secret, value) {
  const key = await getHmacKey(secret);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function parseCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function isAuthorized(request, secret) {
  const token = parseCookie(request.headers.get("cookie"), COOKIE_NAME);
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expStr = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now() || !/^[0-9a-f]{64}$/i.test(sigHex)) {
    return false;
  }
  const expectedSig = toHex(await hmacDigest(secret, `v1.${expStr}`));
  return constantTimeEqual(enc.encode(sigHex.toLowerCase()), enc.encode(expectedSig));
}

function safeNextPath(raw) {
  if (!raw || typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw === LOCK_POST_PATH ? "/" : raw;
}

function renderLockHtml(nextPath, hasError) {
  const escapedNext = nextPath.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const errHtml = hasError
    ? '<p class="err" role="alert">Incorrect password. Please try again.</p>'
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Protected Access</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#090b10;color:#f3f4f6}
  .card{width:100%;max-width:380px;background:#111520;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px;box-shadow:0 20px 50px rgba(0,0,0,.5)}
  .badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#93c5fd;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);border-radius:999px;padding:4px 10px;margin-bottom:14px}
  h1{margin:0 0 6px;font-size:20px;font-weight:600;letter-spacing:-.01em}
  p.sub{margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.45}
  label{display:block;font-size:13px;font-weight:500;color:#d1d5db;margin-bottom:8px}
  input[type=password]{width:100%;padding:11px 13px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#090b10;color:#fff;font-size:15px;outline:none}
  input[type=password]:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.2)}
  button{width:100%;margin-top:14px;padding:11px 16px;border:0;border-radius:10px;background:#2563eb;color:#fff;font-size:15px;font-weight:600;cursor:pointer}
  button:hover{background:#1d4ed8}
  .err{margin:12px 0 0;padding:10px 12px;border-radius:8px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5;font-size:13px}
</style>
</head>
<body>
<main class="card">
  <div class="badge">Protected Preview</div>
  <h1>Enter Access Password</h1>
  <p class="sub">This site is locked. Enter the access password to continue.</p>
  <form method="POST" action="${LOCK_POST_PATH}">
    <input type="hidden" name="next" value="${escapedNext}">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <button type="submit">Unlock Site</button>
    ${errHtml}
  </form>
</main>
</body>
</html>`;
}

export default async function middleware(request) {
  const expectedPassword = process.env.SITE_LOCK_PASSWORD;
  const secret = process.env.SITE_LOCK_SECRET;

  if (!expectedPassword || !secret) {
    return new Response("Site lock is not configured.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === LOCK_POST_PATH) {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const submitted = params.get("password") || "";
    const nextPath = safeNextPath(params.get("next"));
    const [a, b] = await Promise.all([
      hmacDigest(secret, `pw:${submitted}`),
      hmacDigest(secret, `pw:${expectedPassword}`),
    ]);

    if (constantTimeEqual(a, b)) {
      const exp = String(Date.now() + TTL_MS);
      const sig = toHex(await hmacDigest(secret, `v1.${exp}`));
      return new Response(null, {
        status: 303,
        headers: {
          location: nextPath,
          "set-cookie": `${COOKIE_NAME}=${exp}.${sig}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store",
        },
      });
    }

    return new Response(renderLockHtml(nextPath, true), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }

  if (await isAuthorized(request, secret)) {
    return new Response(null, {
      headers: { "x-middleware-next": "1" },
    });
  }

  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const nextPath = safeNextPath(url.pathname + url.search);
  return new Response(renderLockHtml(nextPath, false), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
