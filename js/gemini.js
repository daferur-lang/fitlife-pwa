const Gemini = {
  // 🌐 Cuando despliegues el Worker, pega aquí su URL (ej: https://fitlife.tuusuario.workers.dev)
  // Mientras esté vacío, la app pedirá la API key al usuario como fallback.
  PROXY_URL: 'https://fitlife.daferur.workers.dev',

  DIRECT_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',

  isAutoMode() {
    return !!this.PROXY_URL;
  },

  buildSystemPrompt(user) {
    const dietNames = { keto:'Keto', mediterranean:'Mediterránea', intermittent_fasting:'Ayuno Intermitente 16:8', dash:'DASH', plant_based:'Plant-Based' };
    const envNames = { gym:'Gimnasio', home:'Casa', outdoor:'Correr/Andar al aire libre' };
    return `Eres FitCoach, un experto en nutrición y entrenamiento personal con 15 años de experiencia certificada.
Especialidades: dieta keto, mediterránea, ayuno intermitente (16:8, 5:2, OMAD, Warrior Diet), DASH, plant-based, carnívora y últimas tendencias (cronobiología nutricional, Zone Diet, anti-inflamatoria).
También eres entrenador personal certificado NSCA: diseñas rutinas para gym y casa, de cualquier nivel, con progresión real.
PERFIL DEL USUARIO:
- Nombre: ${user.name}
- Objetivo: pasar de ${user.currentWeight}kg a ${user.goalWeight}kg
- Dieta actual: ${dietNames[user.diet] || user.diet}
- Entrenamiento: ${envNames[user.equipment] || user.equipment}
- Nivel de actividad: ${user.activity}
REGLAS DE RESPUESTA:
- Responde SIEMPRE en español, de forma directa y práctica
- Sé motivador pero realista — sin promesas milagrosas
- Da consejos concretos y accionables, no vagos
- Cuando des planes de comida o rutinas, sé específico (cantidades, tiempos, reps)
- Máximo 3 párrafos por respuesta salvo que pidan un plan completo
- Usa emojis con moderación para hacer el texto más legible`;
  },

  async send(apiKey, message, history, user) {
    const systemPrompt = this.buildSystemPrompt(user);
    const contents = [];

    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      contents.push({ role: msg.role === 'ai' ? 'model' : 'user', parts: [{ text: msg.text }] });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 800, topP: 0.9 }
    };

    // Use proxy if configured (no key needed from user), else fall back to direct call
    const endpoint = this.PROXY_URL || `${this.DIRECT_URL}?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `Error ${res.status}`;
      if (res.status === 400 && !this.PROXY_URL) throw new Error('API key inválida. Verifica tu clave en Ajustes.');
      if (res.status === 429) throw new Error('Límite de peticiones alcanzado. Espera un momento.');
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta. Intenta de nuevo.';
  }
};
