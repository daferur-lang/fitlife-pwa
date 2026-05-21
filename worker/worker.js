/**
 * FitLife — Cloudflare Worker proxy for Hugging Face Inference API
 * Model: mistralai/Mistral-7B-Instruct-v0.3 (free, no credit card)
 *
 * Secrets needed in Cloudflare (Settings → Variables → Secrets):
 *   HF_TOKEN       → tu token de Hugging Face (hf_...)
 *   ALLOWED_ORIGIN → https://daferur-lang.github.io
 */

const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';
const HF_URL   = `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`;

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
    if (!env.HF_TOKEN)
      return new Response(JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

    try {
      const body = await request.json();

      // Convert Gemini-style body to OpenAI-compatible (HF uses this format)
      const messages = [];

      // System instruction → system message
      if (body.system_instruction?.parts?.[0]?.text) {
        messages.push({ role: 'system', content: body.system_instruction.parts[0].text });
      }

      // Contents array → messages
      for (const c of (body.contents || [])) {
        messages.push({
          role   : c.role === 'model' ? 'assistant' : 'user',
          content: c.parts?.[0]?.text || ''
        });
      }

      const hfBody = {
        model      : HF_MODEL,
        messages,
        max_tokens : body.generationConfig?.maxOutputTokens || 800,
        temperature: body.generationConfig?.temperature     || 0.8,
        stream     : false,
      };

      const res = await fetch(HF_URL, {
        method : 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'Authorization': `Bearer ${env.HF_TOKEN}`,
        },
        body: JSON.stringify(hfBody),
      });

      const data = await res.json();

      // Normalize response to Gemini format so gemini.js doesn't need changes
      const text = data?.choices?.[0]?.message?.content || 'No pude generar una respuesta. Intenta de nuevo.';
      const normalized = {
        candidates: [{ content: { parts: [{ text }] } }]
      };

      return new Response(JSON.stringify(normalized), {
        status : res.ok ? 200 : res.status,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  }
};
