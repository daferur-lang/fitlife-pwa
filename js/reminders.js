// ===== RECORDATORIOS LOCALES =====
// Programa notificaciones en el dispositivo sin servidor. Funcionan con la app
// abierta o en segundo plano reciente. Comprueba la hora cada minuto y dispara
// la notificación vía Service Worker, sin repetir la misma franja en el día.
const Reminders = {
  KEY: 'reminders',
  WINDOW: 60, // minutos de margen para no perder un aviso si abres la app algo tarde
  timer: null,

  default() {
    return {
      enabled: false,
      meals:   { on: true,  breakfast: '08:30', lunch: '14:00', snack: '17:30', dinner: '21:00' },
      water:   { on: true,  from: '09:00', to: '21:00', every: 2 },
      workout: { on: true,  time: '18:00' },
      weighin: { on: false, time: '08:00' }
    };
  },

  get() {
    const saved = Storage.get(this.KEY);
    if (!saved) return this.default();
    const d = this.default();
    return {
      enabled: !!saved.enabled,
      meals:   Object.assign(d.meals,   saved.meals   || {}),
      water:   Object.assign(d.water,   saved.water   || {}),
      workout: Object.assign(d.workout, saved.workout || {}),
      weighin: Object.assign(d.weighin, saved.weighin || {})
    };
  },

  save(r) { Storage.set(this.KEY, r); },

  // Convierte "HH:MM" -> minutos desde medianoche
  toMin(hm) {
    if (!hm || !hm.includes(':')) return null;
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
  },

  // Horas objetivo para el agua entre la franja [from, to] cada N horas
  waterTimes(w) {
    const start = this.toMin(w.from), end = this.toMin(w.to);
    const step = (parseInt(w.every) || 2) * 60;
    if (start == null || end == null || step <= 0) return [];
    const out = [];
    for (let t = start; t <= end; t += step) {
      const h = Math.floor(t / 60).toString().padStart(2, '0');
      const m = (t % 60).toString().padStart(2, '0');
      out.push(`${h}:${m}`);
    }
    return out;
  },

  // Lista de avisos de hoy: { key, hm, title, body }
  buildSchedule() {
    const r = this.get();
    const u = (typeof App !== 'undefined') ? App.user : null;
    const list = [];
    if (!u) return list;

    if (r.meals.on) {
      const labels = { breakfast: '🌅 Desayuno', lunch: '☀️ Comida', snack: '🍎 Merienda', dinner: '🌙 Cena' };
      let day = null;
      try {
        const diet = Data.DIETS[u.diet] || Data.DIETS.mediterranean;
        day = diet.days[Data.getDayIndex()];
      } catch {}
      ['breakfast', 'lunch', 'snack', 'dinner'].forEach(m => {
        const hm = r.meals[m];
        if (!hm) return;
        const meal = day && day.meals && day.meals[m];
        list.push({
          key: 'meal_' + m, hm,
          title: labels[m],
          body: meal ? `${meal.name} · ${meal.kcal} kcal` : 'Hora de tu comida'
        });
      });
    }

    if (r.water.on) {
      this.waterTimes(r.water).forEach(hm => list.push({
        key: 'water_' + hm, hm,
        title: '💧 Hidrátate',
        body: 'Bebe un vaso de agua y sigue en racha 🚰'
      }));
    }

    if (r.workout.on && r.workout.time) {
      let body = '¡Toca moverse!';
      try {
        if (u.equipment === 'outdoor') {
          body = 'Sal a correr o andar y suma tus km 🏃';
        } else {
          const w = Data.getTodayWorkout(u);
          body = w.isRest ? 'Descanso activo: estira o sal a caminar 🚶' : `${w.focus} · ${w.exercises.length} ejercicios`;
        }
      } catch {}
      list.push({ key: 'workout', hm: r.workout.time, title: '💪 Hora de entrenar', body });
    }

    if (r.weighin.on && r.weighin.time) {
      list.push({ key: 'weighin', hm: r.weighin.time, title: '⚖️ Pésate', body: 'Registra tu peso de hoy y mira tu progreso' });
    }

    return list;
  },

  tick() {
    const r = this.get();
    if (!r.enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    const today = now.toDateString();
    let fired = Storage.get('reminderFired') || {};
    if (fired.date !== today) fired = { date: today, keys: {} };

    const curM = now.getHours() * 60 + now.getMinutes();

    this.buildSchedule().forEach(item => {
      const m = this.toMin(item.hm);
      if (m == null) return;
      const id = item.key + '@' + item.hm;
      if (curM >= m && curM < m + this.WINDOW && !fired.keys[id]) {
        this.fire(item.title, item.body, item.key);
        fired.keys[id] = true;
      }
    });

    Storage.set('reminderFired', fired);
  },

  fire(title, body, tag) {
    const opts = { body, icon: './icons/icon.svg', badge: './icons/icon.svg', tag, renotify: true, data: { url: './' } };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then(reg => reg.showNotification(title, opts))
        .catch(() => this.fallback(title, opts));
    } else {
      this.fallback(title, opts);
    }
  },

  fallback(title, opts) {
    try { new Notification(title, opts); } catch {}
  },

  init() {
    if (this.timer) clearInterval(this.timer);
    const r = this.get();
    if (!r.enabled) return;
    this.tick();
    this.timer = setInterval(() => this.tick(), 60000);
  }
};
