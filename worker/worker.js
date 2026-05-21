/**
 * FitLife — Cloudflare Worker proxy for Groq API
 * Model: llama-3.1-8b-instant — gratis, rapidísimo, sin tarjeta
 * Free tier: 14.400 peticiones/día
 *
 * Para obtener GROQ_KEY gratis: https://console.groq.com
 */

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

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
    if (!env.GROQ_KEY)
      return new Response(JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

    try {
      const body = await request.json();

      // Convert Gemini-style body → OpenAI format (Groq is OpenAI-compatible)
      const messages = [];
      if (body.system_instruction?.parts?.[0]?.text)
        messages.push({ role: 'system', content: body.system_instruction.parts[0].text });

      for (const c of (body.contents || []))
        messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts?.[0]?.text || '' });

      const res = await fetch(GROQ_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.GROQ_KEY}` },
        body   : JSON.stringify({
          model      : GROQ_MODEL,
          messages,
          max_tokens : body.generationConfig?.maxOutputTokens || 800,
          temperature: body.generationConfig?.temperature     || 0.8,
        }),
      });

      const rawText = await res.text();
      let data;
      try { data = JSON.parse(rawText); } catch {
        return ok(cors, '⚠️ Error de conexión con la IA. Intenta de nuevo.');
      }

      if (data?.error) return ok(cors, `⚠️ ${data.error?.message || data.error}`);

      const text = data?.choices?.[0]?.message?.content || 'No pude generar una respuesta.';
      return ok(cors, text);

    } catch (e) {
      return ok(cors, `❌ Error: ${e.message}`);
    }
  }
};

function ok(cors, text) {
  return new Response(
    JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
  );
}
