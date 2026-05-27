/**
 * FitLife — Cloudflare Worker
 *
 * Rutas:
 *   POST /  body: { action: 'strava_token', ... }  → OAuth Strava
 *   POST /  body: { contents: [...], ... }          → Proxy Groq AI (ruta por defecto)
 *
 * Variables de entorno requeridas:
 *   GROQ_KEY             — API key de Groq (https://console.groq.com)
 *   STRAVA_CLIENT_SECRET — Client Secret de tu app en Strava
 *   STRAVA_CLIENT_ID     — Client ID de tu app en Strava
 *   ALLOWED_ORIGIN       — (opcional) dominio permitido, por defecto '*'
 */

const GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL  = 'llama-3.1-8b-instant';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export default {
  async fetch(request, env) {
    const origin  = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '*';

    const cors = {
      'Access-Control-Allow-Origin' : allowed === '*' ? '*' : (origin === allowed ? origin : allowed),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST')
      return new Response('Method not allowed', { status: 405, headers: cors });

    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }); }

    // ── Strava OAuth token exchange ──────────────────────────────────────────
    if (body.action === 'strava_token') {
      return handleStravaToken(body, env, cors);
    }

    // ── Groq AI proxy (default) ──────────────────────────────────────────────
    return handleGroq(body, env, cors);
  }
};

// ---------------------------------------------------------------------------
// Strava: exchanges an auth code or refreshes a token.
// Keeps client_secret server-side so it is never exposed to the browser.
// ---------------------------------------------------------------------------
async function handleStravaToken(body, env, cors) {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (!env.STRAVA_CLIENT_SECRET || !env.STRAVA_CLIENT_ID) {
    return json({ error: 'Strava credentials not configured on the Worker' }, 500);
  }

  const { grant_type, code, refresh_token } = body;

  if (grant_type !== 'authorization_code' && grant_type !== 'refresh_token') {
    return json({ error: 'Invalid grant_type' }, 400);
  }
  if (grant_type === 'authorization_code' && !code) {
    return json({ error: 'Missing code' }, 400);
  }
  if (grant_type === 'refresh_token' && !refresh_token) {
    return json({ error: 'Missing refresh_token' }, 400);
  }

  const payload = {
    client_id:     env.STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET,
    grant_type,
    ...(grant_type === 'authorization_code' ? { code } : { refresh_token }),
  };

  try {
    const res = await fetch(STRAVA_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // Propagate Strava error (e.g. 403 athlete capacity, 400 bad code)
      return json(data, res.status);
    }

    // Return only the fields the client needs — never expose client_secret
    return json({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at,
      athlete:       data.athlete || null,
    });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}

// ---------------------------------------------------------------------------
// Groq: proxies AI chat requests, converting Gemini-style body → OpenAI format
// ---------------------------------------------------------------------------
async function handleGroq(body, env, cors) {
  const ok = (text) =>
    new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );

  if (!env.GROQ_KEY)
    return new Response(JSON.stringify({ error: 'Server not configured' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

  try {
    const messages = [];
    if (body.system_instruction?.parts?.[0]?.text)
      messages.push({ role: 'system', content: body.system_instruction.parts[0].text });

    for (const c of (body.contents || []))
      messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts?.[0]?.text || '' });

    const res = await fetch(GROQ_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.GROQ_KEY}` },
      body:    JSON.stringify({
        model:       GROQ_MODEL,
        messages,
        max_tokens:  body.generationConfig?.maxOutputTokens || 800,
        temperature: body.generationConfig?.temperature     || 0.8,
      }),
    });

    const rawText = await res.text();
    let data;
    try { data = JSON.parse(rawText); } catch { return ok('⚠️ Error de conexión con la IA. Intenta de nuevo.'); }

    if (data?.error) return ok(`⚠️ ${data.error?.message || data.error}`);

    const text = data?.choices?.[0]?.message?.content || 'No pude generar una respuesta.';
    return ok(text);
  } catch (e) {
    return ok(`❌ Error: ${e.message}`);
  }
}
