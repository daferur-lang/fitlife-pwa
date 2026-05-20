/**
 * FitLife — Cloudflare Worker proxy for Gemini API
 *
 * Setup (5 minutes, free forever):
 * 1. Sign up at https://dash.cloudflare.com/sign-up
 * 2. Go to Workers & Pages → Create → Hello World template
 * 3. Replace the code with this file
 * 4. In Settings → Variables → Environment Variables, add:
 *    - GEMINI_KEY = <your Gemini API key from aistudio.google.com>
 *    - ALLOWED_ORIGIN = https://daferur-lang.github.io
 * 5. Deploy. Copy the worker URL (e.g. fitlife.<your>.workers.dev)
 * 6. Paste that URL into js/gemini.js (PROXY_URL constant)
 *
 * Free tier: 100,000 requests/day. More than enough.
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin === '*' ? '*' : (origin === allowedOrigin ? origin : allowedOrigin),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!env.GEMINI_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();

      const res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
