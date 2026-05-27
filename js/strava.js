// ===== STRAVA API SERVICE =====
// Handles OAuth, token refresh, rate limit tracking, caching, and error handling.
// Before deploying: set CLIENT_ID to your Strava app's Client ID.
// The client_secret lives only in the Cloudflare Worker env (STRAVA_CLIENT_SECRET).

const Strava = {

  // ===== CONFIG =====
  CLIENT_ID: Storage.get('stravaClientId') || '',
  WORKER_URL: 'https://fitlife.daferur.workers.dev',
  SCOPES: 'read,activity:read_all',

  get REDIRECT_URI() {
    // GitHub Pages: preserve the path prefix (e.g. /fitlife-pwa/)
    const { origin, pathname } = window.location;
    const base = pathname.endsWith('/') ? pathname : pathname.replace(/\/[^/]*$/, '/');
    return origin + base;
  },

  // ===== RATE LIMIT STATE =====
  // Populated from X-RateLimit-* and X-ReadRateLimit-* response headers.
  // Strava resets 15-min windows at :00 :15 :30 :45 UTC; daily at midnight UTC.
  rateLimits: {
    shortLimit: 200, dailyLimit: 2000,
    shortUsage: 0,   dailyUsage: 0,
    readShortLimit: 100, readDailyLimit: 1000,
    readShortUsage: 0,   readDailyUsage: 0,
    lastUpdated: 0,
  },

  // ===== REQUEST CACHE =====
  _cache: {},
  CACHE_TTL: 10 * 60 * 1000, // 10 min — reduce redundant read calls

  // ===== TOKEN MANAGEMENT =====
  get tokens() { return Storage.get('stravaTokens'); },
  set tokens(v) { Storage.set('stravaTokens', v); },

  get isConnected() { return !!this.tokens?.access_token; },
  get athlete()     { return this.tokens?.athlete || null; },

  // ===== OAUTH =====
  authorize() {
    const cid = this.CLIENT_ID || Storage.get('stravaClientId');
    if (!cid) {
      const id = prompt('Introduce tu Strava Client ID\n(lo encuentras en https://www.strava.com/settings/api):');
      if (!id) return;
      this.CLIENT_ID = id.trim();
      Storage.set('stravaClientId', this.CLIENT_ID);
    }
    const params = new URLSearchParams({
      client_id:       this.CLIENT_ID,
      response_type:   'code',
      redirect_uri:    this.REDIRECT_URI,
      approval_prompt: 'auto',
      scope:           this.SCOPES,
    });
    window.location.href = `https://www.strava.com/oauth/authorize?${params}`;
  },

  // Called on app init — detects ?code= in URL and exchanges it for tokens.
  async handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code  = params.get('code');
    const error = params.get('error');
    if (!code && !error) return false;

    // Clean up the URL so it doesn't trigger again on reload
    history.replaceState({}, '', window.location.pathname);

    if (error === 'access_denied') {
      showToast('Autorización de Strava cancelada', 'error');
      return false;
    }
    if (!code) return false;

    showToast('Conectando con Strava…', 'success', 8000);
    try {
      const res = await fetch(this.WORKER_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'strava_token', grant_type: 'authorization_code', code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403 || data?.errors?.[0]?.code === 'invalid_authorization') {
          this._showAthleteCapacityModal();
          return false;
        }
        throw new Error(data?.message || `Error ${res.status}`);
      }

      this.tokens = {
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
        expires_at:    data.expires_at,
        athlete:       data.athlete,
      };
      showToast(`✅ Conectado como ${data.athlete?.firstname || 'Atleta'}!`);
      return true;
    } catch (e) {
      showToast('Error al conectar con Strava: ' + e.message, 'error');
      return false;
    }
  },

  async _refreshToken() {
    const t = this.tokens;
    if (!t?.refresh_token) return false;
    try {
      const res = await fetch(this.WORKER_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'strava_token', grant_type: 'refresh_token', refresh_token: t.refresh_token }),
      });
      if (!res.ok) { this.tokens = null; return false; }
      const data = await res.json();
      this.tokens = { ...t, access_token: data.access_token, expires_at: data.expires_at };
      return true;
    } catch { return false; }
  },

  async _getValidToken() {
    const t = this.tokens;
    if (!t?.access_token) return null;
    // Refresh proactively if less than 5 min remain
    if (Date.now() / 1000 >= t.expires_at - 300) {
      if (!await this._refreshToken()) return null;
    }
    return this.tokens.access_token;
  },

  disconnect() {
    this.tokens = null;
    this._cache = {};
    showToast('Desconectado de Strava');
  },

  // ===== RATE LIMIT HELPERS =====
  _parseRateLimitHeaders(headers) {
    const pair = (name) => headers.get(name)?.split(',').map(s => parseInt(s.trim(), 10)) || null;
    const lim = pair('X-RateLimit-Limit');
    const use = pair('X-RateLimit-Usage');
    const rLim = pair('X-ReadRateLimit-Limit');
    const rUse = pair('X-ReadRateLimit-Usage');
    const rl = this.rateLimits;
    if (lim) { rl.shortLimit = lim[0]; rl.dailyLimit = lim[1]; }
    if (use) { rl.shortUsage = use[0]; rl.dailyUsage = use[1]; }
    if (rLim) { rl.readShortLimit = rLim[0]; rl.readDailyLimit = rLim[1]; }
    if (rUse) { rl.readShortUsage = rUse[0]; rl.readDailyUsage = rUse[1]; }
    rl.lastUpdated = Date.now();
  },

  // Next Strava rate-limit reset at :00 :15 :30 :45 UTC
  _nextResetTime() {
    const now = new Date();
    const m = now.getUTCMinutes();
    const nextQ = Math.ceil((m + 1) / 15) * 15;
    const r = new Date(now);
    if (nextQ >= 60) r.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
    else r.setUTCMinutes(nextQ, 0, 0);
    return r;
  },

  secsUntilReset() {
    return Math.max(1, Math.ceil((this._nextResetTime() - Date.now()) / 1000));
  },

  isRateLimited() {
    const rl = this.rateLimits;
    return rl.shortUsage >= rl.shortLimit || rl.dailyUsage >= rl.dailyLimit;
  },

  getRateLimitStatus() {
    const rl = this.rateLimits;
    return {
      ...rl,
      shortPct: rl.shortLimit > 0 ? Math.round((rl.shortUsage / rl.shortLimit) * 100) : 0,
      dailyPct: rl.dailyLimit > 0 ? Math.round((rl.dailyUsage / rl.dailyLimit) * 100) : 0,
      secsUntilReset: this.secsUntilReset(),
    };
  },

  // ===== CORE REQUEST =====
  async request(endpoint, opts = {}) {
    // Check cache (only for GET-like requests)
    const isWrite = opts.method === 'POST' || opts.method === 'PUT';
    const cacheKey = endpoint;
    if (!isWrite) {
      const hit = this._cache[cacheKey];
      if (hit && Date.now() - hit.t < this.CACHE_TTL) return hit.d;
    }

    // Check rate limits before sending (avoid burning a request)
    if (this.isRateLimited()) {
      const secs = this.secsUntilReset();
      const mins = Math.ceil(secs / 60);
      const err = new Error(`Límite de peticiones alcanzado. Disponible en ${mins} min.`);
      err.code = 'RATE_LIMITED';
      err.secsUntilReset = secs;
      throw err;
    }

    const token = await this._getValidToken();
    if (!token) {
      const err = new Error('Sesión de Strava no activa. Vuelve a conectar.');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    const res = await fetch(`https://www.strava.com/api/v3/${endpoint}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, ...opts.headers },
    });

    // Always parse rate-limit headers, even on errors
    this._parseRateLimitHeaders(res.headers);

    if (res.status === 429) {
      // Force local state to reflect that we're at the limit
      const rl = this.rateLimits;
      rl.shortUsage = rl.shortLimit;
      const secs = this.secsUntilReset();
      const err = new Error(`Demasiadas peticiones. Espera ${Math.ceil(secs / 60)} min.`);
      err.code = 'RATE_LIMITED';
      err.secsUntilReset = secs;
      throw err;
    }

    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));
      if (body.errors?.[0]?.code === 'invalid_authorization') {
        this._showAthleteCapacityModal();
        const err = new Error('Capacidad de atletas superada (Single Player Mode).');
        err.code = 'ATHLETE_CAPACITY';
        throw err;
      }
      throw new Error('Acceso denegado por Strava.');
    }

    if (res.status === 401) {
      this.tokens = null;
      const err = new Error('Sesión expirada. Vuelve a conectar Strava.');
      err.code = 'UNAUTHENTICATED';
      throw err;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!isWrite) this._cache[cacheKey] = { d: data, t: Date.now() };
    return data;
  },

  // ===== API METHODS =====
  getAthlete()               { return this.request('athlete'); },
  getActivities(n = 15, p = 1) { return this.request(`athlete/activities?per_page=${n}&page=${p}`); },
  getActivity(id)            { return this.request(`activities/${id}`); },
  getStats(athleteId)        { return this.request(`athletes/${athleteId}/stats`); },

  // ===== UI HELPERS =====
  formatActivity(act) {
    const icons = { Run:'🏃', Ride:'🚴', Swim:'🏊', Walk:'🚶', Hike:'🥾',
                    Workout:'💪', WeightTraining:'🏋️', Yoga:'🧘', VirtualRide:'🚴' };
    return {
      icon:  icons[act.type] || '⚡',
      name:  act.name,
      type:  act.type,
      dist:  act.distance > 0  ? `${(act.distance / 1000).toFixed(1)} km` : null,
      time:  act.moving_time > 0 ? `${Math.floor(act.moving_time / 60)} min` : null,
      elev:  act.total_elevation_gain > 0 ? `↑${Math.round(act.total_elevation_gain)} m` : null,
      date:  new Date(act.start_date_local).toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' }),
      kudos: act.kudos_count || 0,
    };
  },

  _showAthleteCapacityModal() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:flex-end;padding:16px';
    el.innerHTML = `
      <div style="background:#1E293B;border-radius:20px 20px 16px 16px;padding:28px 24px;width:100%;color:#fff;font-family:Poppins,sans-serif;max-height:90vh;overflow-y:auto">
        <div style="font-size:2.5rem;text-align:center;margin-bottom:12px">🚫</div>
        <h3 style="margin:0 0 8px;font-size:1.05rem;color:#F97316;text-align:center">Error 403 – Límite de Atletas</h3>
        <p style="margin:0 0 16px;font-size:0.85rem;color:#CBD5E1;line-height:1.65;text-align:center">
          Tu app de Strava está en <strong style="color:#FC4C02">Single Player Mode</strong>.<br>
          Solo 1 atleta puede conectarse hasta que Strava apruebe tu solicitud.
        </p>
        <div style="background:#0F172A;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 10px;font-size:0.78rem;color:#F97316;font-weight:700;letter-spacing:.05em">CÓMO RESOLVER ESTO:</p>
          <div style="font-size:0.82rem;color:#CBD5E1;line-height:2.1">
            <div>① Tu app necesita <strong>+100 usuarios activos</strong> para calificar</div>
            <div>② Cumple el <a href="https://www.strava.com/legal/api" target="_blank" style="color:#FC4C02">API Agreement</a> de Strava</div>
            <div>③ Sigue las <a href="https://developers.strava.com/guidelines" target="_blank" style="color:#FC4C02">Brand Guidelines</a></div>
            <div>④ Solicita ampliación en el <a href="https://www.strava.com/settings/api" target="_blank" style="color:#FC4C02">Developer Program</a></div>
          </div>
        </div>
        <p style="margin:0 0 16px;font-size:0.78rem;color:#64748B;text-align:center">
          Mientras tanto, el desarrollador puede usar la app con su propia cuenta.
        </p>
        <button onclick="this.closest('[style*=fixed]').remove()" style="width:100%;padding:14px;background:#FC4C02;color:#fff;border:none;border-radius:12px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:Poppins,sans-serif">
          Entendido
        </button>
      </div>
    `;
    el.addEventListener('click', e => { if (e.target === el) el.remove(); });
    document.body.appendChild(el);
  },
};
