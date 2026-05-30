// ===== STATE =====
const App = {
  user: null, geminiKey: null, weightLog: [], chatHistory: [], runLog: [],
  mealsEaten: {}, exercisesDone: {}, currentScreen: 'dashboard',
  fastingActive: false, fastingStart: null, fastingInterval: null,
  weightChart: null, ob: { step: 1, data: {} }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(Storage.get('theme') || 'light');
  App.user = Storage.get('user');
  App.geminiKey = Storage.get('geminiKey');
  App.weightLog = Storage.get('weightLog') || [];
  App.chatHistory = Storage.get('chatHistory') || [];
  App.runLog = Storage.get('runLog') || [];
  App.fastingActive = Storage.get('fastingActive') || false;
  App.fastingStart = Storage.get('fastingStart') || null;

  const todayKey = new Date().toDateString();
  App.mealsEaten = Storage.get('mealsEaten_' + todayKey) || {};
  App.exercisesDone = Storage.get('exercisesDone_' + todayKey) || {};

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  Reminders.init();

  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      if (!App.user) showOnboarding();
      else { document.getElementById('app').classList.remove('hidden'); navigate('dashboard'); }
    }, 500);
  }, 1800);
});

// ===== ONBOARDING =====
function showOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  renderObStep(1);
}

function renderObStep(step) {
  App.ob.step = step;
  document.querySelectorAll('.ob-step').forEach((s, i) => s.classList.toggle('active', i === step - 1));
  document.querySelector('.ob-progress-bar').style.width = `${(step / 5) * 100}%`;
}

function obNext() {
  const step = App.ob.step;
  // Validate current step
  if (step === 1) {
    const name = document.getElementById('ob-name').value.trim();
    const goal = document.getElementById('ob-goal').value.trim();
    if (!name || !goal) { showToast('Por favor completa todos los campos', 'error'); return; }
    App.ob.data.name = name; App.ob.data.goal = goal;
  } else if (step === 2) {
    const age = document.getElementById('ob-age').value;
    const gender = document.getElementById('ob-gender').value;
    const height = document.getElementById('ob-height').value;
    const cw = document.getElementById('ob-cw').value;
    const gw = document.getElementById('ob-gw').value;
    if (!age || !gender || !height || !cw || !gw) { showToast('Completa todos los datos', 'error'); return; }
    Object.assign(App.ob.data, { age, gender, height, currentWeight: cw, goalWeight: gw });
  } else if (step === 3) {
    if (!App.ob.data.activity) { showToast('Selecciona tu nivel de actividad', 'error'); return; }
  } else if (step === 4) {
    if (!App.ob.data.diet) { showToast('Selecciona una dieta', 'error'); return; }
  } else if (step === 5) {
    if (!App.ob.data.equipment) { showToast('Selecciona tu entorno', 'error'); return; }
    finishOnboarding(); return;
  }
  renderObStep(step + 1);
}

function obBack() {
  if (App.ob.step > 1) renderObStep(App.ob.step - 1);
}

function selectChip(group, value, el) {
  document.querySelectorAll(`[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  App.ob.data[group] = value;
}

function finishOnboarding() {
  App.user = { ...App.ob.data, startDate: new Date().toISOString(), startWeight: App.ob.data.currentWeight };
  Storage.set('user', App.user);
  // Add first weight entry
  if (App.weightLog.length === 0) {
    App.weightLog.push({ date: new Date().toISOString(), weight: parseFloat(App.user.currentWeight) });
    Storage.set('weightLog', App.weightLog);
  }
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  showToast(`¡Bienvenido/a ${App.user.name}! Tu plan está listo 🎉`);
  navigate('dashboard');
}

// ===== NAVIGATION =====
function navigate(screen) {
  if (App.currentScreen === 'chat' && screen !== 'chat' && typeof Voice !== 'undefined') {
    Voice.stopSpeaking(); Voice.stopMic();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  document.getElementById('nav-' + screen).classList.add('active');
  App.currentScreen = screen;
  const titles = { dashboard:'Inicio', diet:'Mi Dieta', workout:'Entrenamiento', track:'Progreso', chat:'FitCoach AI' };
  document.getElementById('topbar-title').textContent = titles[screen] || 'FitLife';
  renderScreen(screen);
}

function renderScreen(screen) {
  if (screen === 'dashboard') renderDashboard();
  else if (screen === 'diet') renderDiet();
  else if (screen === 'workout') renderWorkout();
  else if (screen === 'track') renderTrack();
  else if (screen === 'chat') renderChat();
}

// ===== TEMA (claro / oscuro) =====
function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#12121c' : '#1A1A2E');
}

function toggleTheme(el) {
  const dark = !(Storage.get('theme') === 'dark');
  Storage.set('theme', dark ? 'dark' : 'light');
  applyTheme(dark ? 'dark' : 'light');
  if (el) el.classList.toggle('on', dark);
  if (App.currentScreen) renderScreen(App.currentScreen); // refresca gráficas con los colores del tema
}

// Colores de gráficas según tema
function chartGrid() { return isDark() ? 'rgba(255,255,255,0.08)' : '#F3F4F6'; }
function chartTick() { return isDark() ? '#C2C6D2' : '#6B7280'; }

// ===== DASHBOARD =====
function renderDashboard() {
  const u = App.user;
  const firstName = u.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const tdee = Data.calculateTDEE(u);
  const todayMeals = Data.getTodayMeals(u);
  const totalEaten = Object.values(App.mealsEaten).reduce((a, b) => a + b, 0);
  const cw = parseFloat(u.currentWeight), gw = parseFloat(u.goalWeight), sw = parseFloat(u.startWeight || u.currentWeight);
  const totalToLose = Math.abs(sw - gw);
  const lost = Math.max(0, sw - cw);
  const pct = totalToLose > 0 ? Math.min(100, Math.round((lost / totalToLose) * 100)) : 0;
  const daysSince = Math.floor((Date.now() - new Date(u.startDate)) / 86400000);
  const totalWorkouts = Storage.get('totalWorkouts') || 0;
  const isOutdoor = u.equipment === 'outdoor';
  const todayWorkout = isOutdoor ? null : Data.getTodayWorkout(u);
  const todayRunKm = isOutdoor ? Data.runFilter(App.runLog, 'day').reduce((a, s) => a + (s.km || 0), 0) : 0;

  // Calories eaten today from meals
  const mealData = todayMeals?.meals || {};
  let eatenKcal = 0;
  ['breakfast','lunch','dinner','snack'].forEach(m => {
    if (App.mealsEaten[m]) eatenKcal += mealData[m]?.kcal || 0;
  });

  // Next meal
  const mealOrder = ['breakfast','lunch','snack','dinner'];
  const mealEmojis = { breakfast:'🌅', lunch:'☀️', snack:'🍎', dinner:'🌙' };
  const mealNames = { breakfast:'Desayuno', lunch:'Comida', snack:'Merienda', dinner:'Cena' };
  const nextMeal = mealOrder.find(m => !App.mealsEaten[m]) || 'breakfast';

  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (pct / 100) * circumference;
  const isIF = u.diet === 'intermittent_fasting';

  document.getElementById('screen-dashboard').innerHTML = `
    <div class="dash-greeting">
      <h2>${greeting}, ${firstName}! 👋</h2>
      <p>${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</p>
    </div>
    <div class="dash-hero">
      <div class="dash-hero-top">
        <div>
          <div class="dash-hero-label">Progreso hacia tu meta</div>
          <div class="dash-hero-val">${cw} kg</div>
          <div class="dash-hero-sub">Meta: ${gw} kg · Perdido: ${lost.toFixed(1)} kg</div>
        </div>
        <div class="progress-ring-wrap">
          <svg class="progress-ring" width="90" height="90">
            <circle class="progress-ring-bg" cx="45" cy="45" r="38"/>
            <circle class="progress-ring-fill" cx="45" cy="45" r="38"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
          </svg>
          <div class="progress-ring-text">
            <span class="progress-ring-pct">${pct}%</span>
            <span class="progress-ring-lbl">completado</span>
          </div>
        </div>
      </div>
      <div class="dash-hero-stats">
        <div class="dash-stat"><div class="dash-stat-val">${daysSince}</div><div class="dash-stat-label">Días activo</div></div>
        <div class="dash-stat"><div class="dash-stat-val">${lost.toFixed(1)}</div><div class="dash-stat-label">Kg perdidos</div></div>
        <div class="dash-stat"><div class="dash-stat-val">${totalWorkouts}</div><div class="dash-stat-label">Entrenos</div></div>
      </div>
    </div>
    ${isIF ? renderFastingTimer() : ''}
    <div class="dash-grid">
      <div class="dash-mini-card">
        <div class="dash-mini-icon" style="background:#FEF9C3">🔥</div>
        <div class="dash-mini-val">${eatenKcal}<span style="font-size:0.7rem;font-weight:500;color:var(--text-3)">/${tdee}</span></div>
        <div class="dash-mini-label">Calorías hoy</div>
      </div>
      <div class="dash-mini-card">
        <div class="dash-mini-icon" style="background:${Data.DIETS[u.diet]?.bgColor || '#E8F5C8'}">${Data.DIETS[u.diet]?.icon || '🥗'}</div>
        <div class="dash-mini-val" style="font-size:1rem">${Data.DIETS[u.diet]?.name || 'Dieta'}</div>
        <div class="dash-mini-label">Tu dieta actual</div>
      </div>
      <div class="dash-mini-card">
        <div class="dash-mini-icon" style="background:#F0FDF4">💧</div>
        <div class="dash-mini-val">8<span style="font-size:0.7rem;font-weight:500;color:var(--text-3)"> vasos</span></div>
        <div class="dash-mini-label">Agua diaria</div>
      </div>
      <div class="dash-mini-card" onclick="navigate('workout')" style="cursor:pointer">
        <div class="dash-mini-icon" style="background:#F5F3FF">${isOutdoor ? '🏃' : (todayWorkout?.isRest ? '😴' : '💪')}</div>
        <div class="dash-mini-val" style="font-size:0.85rem;line-height:1.2">${isOutdoor ? todayRunKm.toFixed(1) + ' km' : (todayWorkout?.focus || 'Descanso')}</div>
        <div class="dash-mini-label">Entreno hoy</div>
      </div>
    </div>
    <div class="section-title">Próxima comida</div>
    <div class="upcoming-meal" onclick="navigate('diet')">
      <div class="meal-emoji">${mealData[nextMeal]?.emoji || '🍽️'}</div>
      <div class="meal-info">
        <h4>${mealData[nextMeal]?.name || 'Ver plan de dieta'}</h4>
        <p>${mealNames[nextMeal]} · ${mealData[nextMeal]?.desc?.substring(0,40) || 'Toca para ver tu plan completo'}...</p>
      </div>
      <div class="meal-kcal">
        <div class="meal-kcal-val">${mealData[nextMeal]?.kcal || '--'}</div>
        <div class="meal-kcal-lbl">kcal</div>
      </div>
    </div>
  `;

  if (isIF) startFastingDisplay();
}

function renderFastingTimer() {
  const diet = Data.DIETS.intermittent_fasting;
  return `
    <div class="fast-card">
      <div class="fast-header">
        <div class="fast-title">⏱️ Ayuno Intermitente</div>
        <div class="fast-badge">${App.fastingActive ? '🔴 Ayunando' : '🟢 Comiendo'}</div>
      </div>
      <div class="fast-timer">
        <div class="fast-time" id="fast-time-display">${App.fastingActive ? getFastingElapsed() : '00:00:00'}</div>
        <div class="fast-sub">${App.fastingActive ? 'Tiempo en ayunas · Meta: 16h' : 'Ventana de comida: 12:00 – 20:00'}</div>
      </div>
      <div class="fast-actions">
        <button class="fast-btn ${App.fastingActive ? 'fast-btn-outline' : 'fast-btn-primary'}" onclick="toggleFasting()">
          ${App.fastingActive ? '🍽️ Terminar ayuno' : '⏱️ Iniciar ayuno'}
        </button>
        <button class="fast-btn fast-btn-outline" onclick="navigate('chat')" style="flex:0.5">💬 Ayuda</button>
      </div>
    </div>
  `;
}

function getFastingElapsed() {
  if (!App.fastingStart) return '00:00:00';
  const elapsed = Math.floor((Date.now() - App.fastingStart) / 1000);
  const h = Math.floor(elapsed / 3600).toString().padStart(2,'0');
  const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2,'0');
  const s = (elapsed % 60).toString().padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function startFastingDisplay() {
  if (App.fastingInterval) clearInterval(App.fastingInterval);
  if (App.fastingActive) {
    App.fastingInterval = setInterval(() => {
      const el = document.getElementById('fast-time-display');
      if (el) el.textContent = getFastingElapsed();
    }, 1000);
  }
}

function toggleFasting() {
  App.fastingActive = !App.fastingActive;
  App.fastingStart = App.fastingActive ? Date.now() : null;
  Storage.set('fastingActive', App.fastingActive);
  Storage.set('fastingStart', App.fastingStart);
  renderDashboard();
  showToast(App.fastingActive ? '⏱️ Ayuno iniciado. ¡Mucho ánimo!' : '🍽️ Ventana de comida abierta');
}

// ===== DIET SCREEN =====
let dietTab = 'today', selectedDay = 0;

function renderDiet() {
  const diet = Data.DIETS[App.user.diet] || Data.DIETS.mediterranean;
  const tdee = Data.calculateTDEE(App.user);

  document.getElementById('screen-diet').innerHTML = `
    <div class="diet-info-banner" style="background:${diet.bgColor};color:${diet.textColor}">
      <h3>${diet.icon} ${diet.name}</h3>
      <p>${diet.description}</p>
      <div class="diet-big-icon">${diet.icon}</div>
    </div>
    <div class="diet-tabs">
      <button class="diet-tab ${dietTab==='today'?'active':''}" onclick="switchDietTab('today')">Hoy</button>
      <button class="diet-tab ${dietTab==='week'?'active':''}" onclick="switchDietTab('week')">Semana</button>
      <button class="diet-tab ${dietTab==='shop'?'active':''}" onclick="switchDietTab('shop')">Lista de compra</button>
    </div>
    <div id="diet-content"></div>
  `;
  renderDietContent();
}

function switchDietTab(tab) {
  dietTab = tab;
  document.querySelectorAll('.diet-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  renderDietContent();
}

function renderDietContent() {
  const container = document.getElementById('diet-content');
  if (!container) return;
  const diet = Data.DIETS[App.user.diet] || Data.DIETS.mediterranean;
  const tdee = Data.calculateTDEE(App.user);

  if (dietTab === 'today') {
    const todayIdx = Data.getDayIndex();
    const day = diet.days[todayIdx];
    const mealOrder = ['breakfast','lunch','snack','dinner'];
    const mealLabels = { breakfast:'Desayuno 🌅', lunch:'Comida ☀️', snack:'Merienda 🍎', dinner:'Cena 🌙' };
    const totalKcal = mealOrder.reduce((a,m) => a + (day.meals[m]?.kcal || 0), 0);
    const eatenKcal = mealOrder.filter(m => App.mealsEaten[m]).reduce((a,m) => a + (day.meals[m]?.kcal || 0), 0);
    const barPct = Math.min(100, Math.round((eatenKcal / tdee) * 100));

    container.innerHTML = `
      <div class="kcal-summary card">
        <div class="flex-between"><span class="font-semibold">Calorías hoy</span><span class="font-bold" style="color:var(--primary)">${eatenKcal} / ${tdee} kcal</span></div>
        <div class="kcal-bar-wrap"><div class="kcal-bar" style="width:${barPct}%"></div></div>
        <div class="flex-between text-xs text-muted"><span>Comido: ${eatenKcal} kcal</span><span>Meta: ${tdee} kcal</span></div>
      </div>
      ${mealOrder.map(m => {
        const meal = day.meals[m];
        const done = App.mealsEaten[m];
        return `
          <div class="meal-card ${done?'eaten':''}">
            <div class="meal-time-badge">${meal.emoji}</div>
            <div class="meal-card-body">
              <div class="meal-card-type">${mealLabels[m]}</div>
              <div class="meal-card-name">${meal.name}</div>
              <div class="meal-card-desc">${meal.desc}</div>
              <div class="meal-macros">
                <span class="macro-chip macro-p">P ${meal.p}g</span>
                <span class="macro-chip macro-c">C ${meal.c}g</span>
                <span class="macro-chip macro-f">G ${meal.f}g</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <div class="meal-kcal-badge">
                <div class="meal-kcal-num">${meal.kcal}</div>
                <div class="meal-kcal-text">kcal</div>
              </div>
              <button class="check-btn ${done?'done':''}" onclick="toggleMeal('${m}', this)">
                ${done ? '✓' : ''}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    `;
  } else if (dietTab === 'week') {
    const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    container.innerHTML = `
      <div class="day-selector">
        ${diet.days.map((d,i) => `<button class="day-pill ${i===selectedDay?'active':''}" onclick="selectDietDay(${i})">${days[i]}</button>`).join('')}
      </div>
      <div id="day-meals"></div>
    `;
    renderDayMeals();
  } else {
    const shop = diet.shopping;
    container.innerHTML = Object.entries(shop).map(([cat, items]) => `
      <div class="shop-section">
        <h4>${cat}</h4>
        ${items.map(item => `
          <div class="shop-item">
            <span class="shop-item-icon">${item.icon}</span>
            <span class="shop-item-name">${item.name}</span>
            <span class="shop-item-qty">${item.qty}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }
}

function selectDietDay(idx) {
  selectedDay = idx;
  document.querySelectorAll('.day-pill').forEach((p,i) => p.classList.toggle('active', i===idx));
  renderDayMeals();
}

function renderDayMeals() {
  const container = document.getElementById('day-meals');
  if (!container) return;
  const diet = Data.DIETS[App.user.diet] || Data.DIETS.mediterranean;
  const day = diet.days[selectedDay];
  const mealOrder = ['breakfast','lunch','snack','dinner'];
  const mealLabels = { breakfast:'Desayuno 🌅', lunch:'Comida ☀️', snack:'Merienda 🍎', dinner:'Cena 🌙' };
  container.innerHTML = mealOrder.map(m => {
    const meal = day.meals[m];
    return `
      <div class="meal-card">
        <div class="meal-time-badge">${meal.emoji}</div>
        <div class="meal-card-body">
          <div class="meal-card-type">${mealLabels[m]}</div>
          <div class="meal-card-name">${meal.name}</div>
          <div class="meal-card-desc">${meal.desc}</div>
          <div class="meal-macros">
            <span class="macro-chip macro-p">P ${meal.p}g</span>
            <span class="macro-chip macro-c">C ${meal.c}g</span>
            <span class="macro-chip macro-f">G ${meal.f}g</span>
          </div>
        </div>
        <div class="meal-kcal-badge">
          <div class="meal-kcal-num">${meal.kcal}</div>
          <div class="meal-kcal-text">kcal</div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleMeal(mealId, btn) {
  const todayKey = new Date().toDateString();
  App.mealsEaten[mealId] = !App.mealsEaten[mealId];
  Storage.set('mealsEaten_' + todayKey, App.mealsEaten);
  btn.classList.toggle('done', App.mealsEaten[mealId]);
  btn.textContent = App.mealsEaten[mealId] ? '✓' : '';
  btn.closest('.meal-card').classList.toggle('eaten', App.mealsEaten[mealId]);
  if (App.mealsEaten[mealId]) showToast('¡Comida registrada! 🎉');
  renderDietContent();
}

// ===== WORKOUT SCREEN =====
function renderWorkout() {
  if (App.user.equipment === 'outdoor') { renderRunScreen(); return; }
  const workout = Data.getTodayWorkout(App.user);
  const plan = Data.WORKOUTS[App.user.equipment] || Data.WORKOUTS.home;
  const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const todayIdx = Data.getDayIndex();

  if (workout.isRest) {
    document.getElementById('screen-workout').innerHTML = `
      <div class="rest-day-card">
        <div class="icon">😴</div>
        <h3>Día de descanso activo</h3>
        <p>${workout.restTip}</p>
        <button class="pill-btn pill-btn-primary mt-16" onclick="navigate('chat')">💬 Pedir consejo al AI</button>
      </div>
      ${renderWeekOverview(plan, days, todayIdx)}
    `;
    return;
  }

  const exKeys = workout.exercises.map((_,i) => `${workout.day}_${i}`);
  const doneCount = exKeys.filter(k => App.exercisesDone[k]).length;
  const total = workout.exercises.length;
  const pct = Math.round((doneCount / total) * 100);

  document.getElementById('screen-workout').innerHTML = `
    <div class="workout-today">
      <div class="workout-today-label">${plan.icon} ${plan.name} · ${workout.icon} ${workout.day}</div>
      <div class="workout-today-name">${workout.focus}</div>
      <div class="workout-today-meta">${total} ejercicios · ${total * 4} min estimado</div>
      <div class="workout-progress-bar"><div class="workout-progress-fill" style="width:${pct}%"></div></div>
      <div class="workout-progress-text">${doneCount}/${total} ejercicios completados</div>
    </div>
    ${workout.exercises.map((ex, i) => {
      const key = `${workout.day}_${i}`;
      const done = App.exercisesDone[key];
      return `
        <div class="exercise-card ${done ? 'done-ex' : ''}" id="ex-card-${i}">
          <div class="exercise-header">
            <div class="exercise-anim">${renderExerciseSVG(ex.anim)}</div>
            <div class="exercise-info">
              <div class="exercise-name">${ex.name}</div>
              <div class="exercise-muscles">💪 ${ex.muscles}</div>
              <div class="exercise-tip">💡 ${ex.tip}</div>
            </div>
          </div>
          <div class="exercise-meta">
            <div class="ex-chip"><div class="ex-chip-val">${ex.sets}</div><div class="ex-chip-label">Series</div></div>
            <div class="ex-chip"><div class="ex-chip-val">${ex.reps}</div><div class="ex-chip-label">Reps/Tiempo</div></div>
            <div class="ex-chip"><div class="ex-chip-val">${ex.rest}s</div><div class="ex-chip-label">Descanso</div></div>
          </div>
          <button class="ex-done-btn ${done ? 'done-state' : ''}" onclick="toggleExercise('${key}', ${i}, this)">
            ${done ? '✓ Completado' : '✓ Marcar como hecho'}
          </button>
        </div>
      `;
    }).join('')}
    ${renderWeekOverview(plan, days, todayIdx)}
  `;
}

function renderWeekOverview(plan, days, todayIdx) {
  return `
    <div class="week-overview">
      <div class="section-title">Semana completa</div>
      <div class="week-grid">
        ${plan.weekly.map((w,i) => `
          <div class="week-day-btn ${i===todayIdx?'today-day':''} ${w.isRest?'rest-day-w':''}" onclick="showDayDetail(${i})">
            <span>${days[i]}</span>
            <span>${w.isRest ? '😴' : w.icon}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderExerciseSVG(anim) {
  // Real exercise GIFs from Wikimedia Commons (public domain)
  const GIFS = {
    squat:    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Squats.gif',
    pushup:   'https://upload.wikimedia.org/wikipedia/commons/8/8f/Pushups.gif',
    jump:     'https://upload.wikimedia.org/wikipedia/commons/a/ac/Jumpingjacks.gif',
    run:      'https://upload.wikimedia.org/wikipedia/commons/d/df/Man_Jogging_GIF_Animation_Loop.gif',
    curl:     'https://upload.wikimedia.org/wikipedia/commons/6/68/Man_Lifting_Dumbbells_GIF_Animation_Loop.gif',
    deadlift: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif',
    press:    'https://upload.wikimedia.org/wikipedia/commons/6/68/Man_Lifting_Dumbbells_GIF_Animation_Loop.gif',
    row:      'https://upload.wikimedia.org/wikipedia/commons/c/cb/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif',
    plank:    'https://upload.wikimedia.org/wikipedia/commons/8/8f/Pushups.gif'
  };

  const gifUrl = GIFS[anim] || GIFS.squat;
  return `<img class="ex-gif" src="${gifUrl}" alt="Demostración del ejercicio" loading="lazy" onerror="this.outerHTML='${renderFallbackSVG(anim).replace(/'/g, "\\'")}'"/>`;
}

function renderFallbackSVG(anim) {
  const ground = `<line class="ground" x1="8" y1="88" x2="92" y2="88"/>`;
  const svgs = {
    squat: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <!-- Plates left -->
      <rect class="plate" x="6" y="20" width="6" height="18" rx="1"/>
      <rect class="plate" x="14" y="23" width="4" height="12" rx="1"/>
      <!-- Plates right -->
      <rect class="plate" x="88" y="20" width="6" height="18" rx="1"/>
      <rect class="plate" x="82" y="23" width="4" height="12" rx="1"/>
      <!-- Barbell -->
      <rect class="gear sq-torso" x="10" y="28" width="80" height="3" rx="1"/>
      <!-- Upper body -->
      <g class="sq-torso">
        <circle class="skin" cx="50" cy="16" r="7"/>
        <rect class="skin" x="42" y="22" width="16" height="22" rx="4"/>
        <rect class="skin" x="36" y="26" width="5" height="14" rx="2"/>
        <rect class="skin" x="59" y="26" width="5" height="14" rx="2"/>
      </g>
      <!-- Thighs (rotate at hip) -->
      <rect class="skin-d sq-thigh-l" x="40" y="44" width="6" height="16" rx="2"/>
      <rect class="skin-d sq-thigh-r" x="54" y="44" width="6" height="16" rx="2"/>
      <!-- Shins -->
      <rect class="skin-d sq-shin-l" x="40" y="60" width="6" height="22" rx="2"/>
      <rect class="skin-d sq-shin-r" x="54" y="60" width="6" height="22" rx="2"/>
      <!-- Feet -->
      <ellipse class="gear" cx="43" cy="85" rx="6" ry="2"/>
      <ellipse class="gear" cx="57" cy="85" rx="6" ry="2"/>
    </svg>`,

    pushup: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <g class="pu-body">
        <!-- Body horizontal -->
        <circle class="skin" cx="20" cy="50" r="7"/>
        <rect class="skin" x="26" y="46" width="38" height="10" rx="4"/>
        <rect class="skin-d" x="60" y="46" width="20" height="9" rx="3"/>
      </g>
      <!-- Arms (rotate at shoulder) -->
      <rect class="skin pu-arm-l" x="28" y="50" width="5" height="22" rx="2"/>
      <rect class="skin pu-arm-r" x="58" y="50" width="5" height="22" rx="2"/>
      <!-- Legs -->
      <rect class="skin-d" x="76" y="55" width="6" height="22" rx="2" transform="rotate(8 79 66)"/>
      <rect class="skin-d" x="82" y="55" width="6" height="22" rx="2" transform="rotate(8 85 66)"/>
    </svg>`,

    curl: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <!-- Head -->
      <circle class="skin" cx="50" cy="16" r="7"/>
      <!-- Torso -->
      <rect class="skin" x="42" y="22" width="16" height="26" rx="4"/>
      <!-- Upper arms (fixed at shoulder, elbow at bottom) -->
      <rect class="skin" x="32" y="26" width="5" height="22" rx="2"/>
      <rect class="skin" x="63" y="26" width="5" height="22" rx="2"/>
      <!-- Forearms with dumbbells (rotate at elbow) -->
      <g class="cu-forearm-l">
        <rect class="skin-d" x="32" y="48" width="5" height="18" rx="2"/>
        <rect class="plate" x="26" y="64" width="6" height="10" rx="1"/>
        <rect class="plate" x="37" y="64" width="6" height="10" rx="1"/>
        <rect class="gear" x="32" y="67" width="5" height="4"/>
      </g>
      <g class="cu-forearm-r">
        <rect class="skin-d" x="63" y="48" width="5" height="18" rx="2"/>
        <rect class="plate" x="57" y="64" width="6" height="10" rx="1"/>
        <rect class="plate" x="68" y="64" width="6" height="10" rx="1"/>
        <rect class="gear" x="63" y="67" width="5" height="4"/>
      </g>
      <!-- Legs -->
      <rect class="skin-d" x="43" y="48" width="6" height="34" rx="2"/>
      <rect class="skin-d" x="51" y="48" width="6" height="34" rx="2"/>
      <ellipse class="gear" cx="46" cy="85" rx="5" ry="2"/>
      <ellipse class="gear" cx="54" cy="85" rx="5" ry="2"/>
    </svg>`,

    run: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <g class="ru-body">
        <circle class="skin" cx="50" cy="18" r="7"/>
        <rect class="skin" x="44" y="24" width="14" height="18" rx="4" transform="rotate(5 51 33)"/>
      </g>
      <!-- Arms (swing alternating) -->
      <rect class="skin ru-arm-l" x="47" y="28" width="5" height="20" rx="2"/>
      <rect class="skin ru-arm-r" x="48" y="28" width="5" height="20" rx="2"/>
      <!-- Thighs (alternating) -->
      <rect class="skin-d ru-thigh-l" x="47" y="48" width="6" height="22" rx="2"/>
      <rect class="skin-d ru-thigh-r" x="47" y="48" width="6" height="22" rx="2"/>
      <!-- Static shins coming off the thighs -->
      <rect class="skin-d ru-thigh-l" x="47" y="68" width="5" height="16" rx="2" transform="translate(0,2)"/>
      <rect class="skin-d ru-thigh-r" x="48" y="68" width="5" height="16" rx="2" transform="translate(0,2)"/>
    </svg>`,

    plank: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <g class="pl-body">
        <!-- Forearms on ground -->
        <rect class="skin-d" x="10" y="64" width="18" height="6" rx="2"/>
        <rect class="skin-d" x="14" y="50" width="6" height="18" rx="2"/>
        <!-- Head + torso line -->
        <circle class="skin" cx="22" cy="46" r="7"/>
        <rect class="skin" x="26" y="42" width="48" height="10" rx="4"/>
        <!-- Glutes -->
        <rect class="skin-d" x="68" y="40" width="14" height="14" rx="5"/>
        <!-- Legs straight back -->
        <rect class="skin-d" x="76" y="48" width="6" height="26" rx="2" transform="rotate(15 79 60)"/>
        <rect class="skin-d" x="82" y="48" width="6" height="26" rx="2" transform="rotate(15 85 60)"/>
      </g>
    </svg>`,

    press: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <!-- Head -->
      <circle class="skin" cx="50" cy="32" r="7"/>
      <!-- Torso -->
      <rect class="skin" x="42" y="38" width="16" height="22" rx="4"/>
      <!-- Arms going up -->
      <g class="pr-arm-l">
        <rect class="skin" x="34" y="14" width="5" height="28" rx="2"/>
      </g>
      <g class="pr-arm-r">
        <rect class="skin" x="61" y="14" width="5" height="28" rx="2"/>
      </g>
      <!-- Dumbbells overhead -->
      <g class="pr-bar">
        <rect class="plate" x="28" y="10" width="6" height="14" rx="1"/>
        <rect class="plate" x="39" y="10" width="6" height="14" rx="1"/>
        <rect class="gear" x="34" y="14" width="5" height="6"/>
        <rect class="plate" x="55" y="10" width="6" height="14" rx="1"/>
        <rect class="plate" x="66" y="10" width="6" height="14" rx="1"/>
        <rect class="gear" x="61" y="14" width="5" height="6"/>
      </g>
      <!-- Legs -->
      <rect class="skin-d" x="43" y="60" width="6" height="22" rx="2"/>
      <rect class="skin-d" x="51" y="60" width="6" height="22" rx="2"/>
      <ellipse class="gear" cx="46" cy="85" rx="5" ry="2"/>
      <ellipse class="gear" cx="54" cy="85" rx="5" ry="2"/>
    </svg>`,

    jump: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <g class="ju-body">
        <circle class="skin" cx="50" cy="22" r="7"/>
        <rect class="skin" x="42" y="28" width="16" height="20" rx="4"/>
      </g>
      <!-- Arms swing up/out -->
      <rect class="skin ju-arm-l" x="46" y="30" width="5" height="20" rx="2"/>
      <rect class="skin ju-arm-r" x="49" y="30" width="5" height="20" rx="2"/>
      <!-- Thighs -->
      <rect class="skin-d ju-thigh-l" x="42" y="50" width="6" height="20" rx="2"/>
      <rect class="skin-d ju-thigh-r" x="52" y="50" width="6" height="20" rx="2"/>
      <!-- Shins -->
      <rect class="skin-d ju-thigh-l" x="42" y="68" width="6" height="16" rx="2"/>
      <rect class="skin-d ju-thigh-r" x="52" y="68" width="6" height="16" rx="2"/>
    </svg>`,

    row: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <g class="rw-torso">
        <!-- Hinged forward torso -->
        <circle class="skin" cx="30" cy="32" r="7"/>
        <rect class="skin" x="34" y="30" width="32" height="11" rx="4" transform="rotate(-12 50 36)"/>
      </g>
      <!-- Upper arms hanging -->
      <rect class="skin" x="40" y="38" width="5" height="14" rx="2"/>
      <rect class="skin" x="55" y="38" width="5" height="14" rx="2"/>
      <!-- Forearms pulling barbell -->
      <g class="rw-forearm-l">
        <rect class="skin-d" x="40" y="50" width="5" height="14" rx="2"/>
      </g>
      <g class="rw-forearm-r">
        <rect class="skin-d" x="55" y="50" width="5" height="14" rx="2"/>
      </g>
      <!-- Barbell -->
      <g class="rw-bar">
        <rect class="gear" x="32" y="62" width="36" height="3" rx="1"/>
        <rect class="plate" x="26" y="56" width="6" height="14" rx="1"/>
        <rect class="plate" x="68" y="56" width="6" height="14" rx="1"/>
      </g>
      <!-- Legs slightly bent -->
      <rect class="skin-d" x="44" y="50" width="6" height="20" rx="2"/>
      <rect class="skin-d" x="52" y="50" width="6" height="20" rx="2"/>
      <rect class="skin-d" x="43" y="68" width="6" height="16" rx="2" transform="rotate(-8 46 76)"/>
      <rect class="skin-d" x="53" y="68" width="6" height="16" rx="2" transform="rotate(-8 56 76)"/>
    </svg>`,

    deadlift: `<svg class="ex-svg" viewBox="0 0 100 100">${ground}
      <g class="dl-torso">
        <circle class="skin" cx="50" cy="18" r="7"/>
        <rect class="skin" x="42" y="24" width="16" height="26" rx="4"/>
      </g>
      <!-- Arms going to bar -->
      <g class="dl-arm-l">
        <rect class="skin" x="37" y="28" width="5" height="36" rx="2"/>
      </g>
      <g class="dl-arm-r">
        <rect class="skin" x="58" y="28" width="5" height="36" rx="2"/>
      </g>
      <!-- Legs (semi-bent) -->
      <rect class="skin-d" x="43" y="50" width="6" height="20" rx="2"/>
      <rect class="skin-d" x="51" y="50" width="6" height="20" rx="2"/>
      <rect class="skin-d" x="43" y="68" width="6" height="16" rx="2"/>
      <rect class="skin-d" x="51" y="68" width="6" height="16" rx="2"/>
      <!-- Barbell -->
      <g class="dl-bar">
        <rect class="gear" x="14" y="64" width="72" height="3" rx="1"/>
        <rect class="plate" x="6" y="58" width="8" height="16" rx="1"/>
        <rect class="plate" x="86" y="58" width="8" height="16" rx="1"/>
      </g>
    </svg>`
  };
  return svgs[anim] || svgs.squat;
}

function toggleExercise(key, idx, btn) {
  const todayKey = new Date().toDateString();
  App.exercisesDone[key] = !App.exercisesDone[key];
  Storage.set('exercisesDone_' + todayKey, App.exercisesDone);
  const card = document.getElementById('ex-card-' + idx);
  card.classList.toggle('done-ex', App.exercisesDone[key]);
  btn.classList.toggle('done-state', App.exercisesDone[key]);
  btn.textContent = App.exercisesDone[key] ? '✓ Completado' : '✓ Marcar como hecho';

  if (App.exercisesDone[key]) {
    showToast('¡Ejercicio completado! 💪');
    // Check if workout complete
    const workout = Data.getTodayWorkout(App.user);
    const allDone = workout.exercises.every((_,i) => App.exercisesDone[`${workout.day}_${i}`]);
    if (allDone) {
      setTimeout(() => {
        const total = (Storage.get('totalWorkouts') || 0) + 1;
        Storage.set('totalWorkouts', total);
        showToast('🎉 ¡Entreno completado! Eres imparable', 'success', 3000);
      }, 500);
    }
  }
  // Update progress bar
  const workout = Data.getTodayWorkout(App.user);
  const doneCount = workout.exercises.filter((_,i) => App.exercisesDone[`${workout.day}_${i}`]).length;
  const pct = Math.round((doneCount / workout.exercises.length) * 100);
  const bar = document.querySelector('.workout-progress-fill');
  const text = document.querySelector('.workout-progress-text');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = `${doneCount}/${workout.exercises.length} ejercicios completados`;
}

function showDayDetail(idx) {
  const plan = Data.WORKOUTS[App.user.equipment] || Data.WORKOUTS.home;
  const w = plan.weekly[idx];
  const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  if (w.isRest) { showToast(`${days[idx]}: Día de descanso activo 😴`); return; }
  showToast(`${days[idx]}: ${w.focus} ${w.icon}`);
}

// ===== CORRER / ANDAR (pantalla cardio) =====
let runTab = 'day';
let runType = 'run';
let runChart = null;

function fmtPace(p) {
  if (!p || p <= 0) return '--';
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtDur(min) {
  min = Math.round(min || 0);
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function renderRunScreen() {
  document.getElementById('screen-workout').innerHTML = `
    <div class="run-form card">
      <h3 style="margin-bottom:14px">🏃 Registrar sesión</h3>
      <div class="run-type-toggle">
        <button class="run-type-btn ${runType === 'run' ? 'active' : ''}" onclick="selectRunType('run', this)">🏃 Correr</button>
        <button class="run-type-btn ${runType === 'walk' ? 'active' : ''}" onclick="selectRunType('walk', this)">🚶 Andar</button>
      </div>
      <div class="run-inputs">
        <div class="run-field">
          <label>Distancia</label>
          <input type="number" id="run-km" step="0.1" min="0.1" max="200" placeholder="km" inputmode="decimal">
        </div>
        <div class="run-field">
          <label>Tiempo</label>
          <input type="number" id="run-min" step="1" min="1" max="1440" placeholder="min" inputmode="numeric">
        </div>
      </div>
      <button class="ob-btn" onclick="addRunSession()">Guardar sesión</button>
    </div>

    <div class="diet-tabs">
      <button class="diet-tab ${runTab === 'day' ? 'active' : ''}" onclick="switchRunTab('day')">Hoy</button>
      <button class="diet-tab ${runTab === 'week' ? 'active' : ''}" onclick="switchRunTab('week')">Semana</button>
      <button class="diet-tab ${runTab === 'month' ? 'active' : ''}" onclick="switchRunTab('month')">Mes</button>
    </div>
    <div id="run-content"></div>
  `;
  renderRunContent();
}

function selectRunType(type, el) {
  runType = type;
  document.querySelectorAll('.run-type-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function switchRunTab(tab) {
  runTab = tab;
  document.querySelectorAll('#screen-workout .diet-tab').forEach(t => t.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  renderRunContent();
}

function renderRunContent() {
  const container = document.getElementById('run-content');
  if (!container) return;

  if (!App.runLog.length) {
    container.innerHTML = `
      <div class="rest-day-card">
        <div class="icon">🏃‍♀️</div>
        <h3>¡Tu primer paso empieza aquí!</h3>
        <p>Registra tu primera caminata o carrera arriba y empieza a ver tu progreso, récords y estadísticas.</p>
      </div>`;
    return;
  }

  const sessions = Data.runFilter(App.runLog, runTab);
  const t = Data.runTotals(sessions);
  const rec = Data.runRecords(App.runLog);
  const avgKmh = t.minutes > 0 ? (t.km / (t.minutes / 60)) : 0;

  container.innerHTML = `
    <div class="run-stats-grid">
      <div class="run-stat"><div class="run-stat-val">${t.count}</div><div class="run-stat-lbl">Sesiones</div></div>
      <div class="run-stat"><div class="run-stat-val">${t.km.toFixed(1)}</div><div class="run-stat-lbl">km</div></div>
      <div class="run-stat"><div class="run-stat-val">${fmtDur(t.minutes)}</div><div class="run-stat-lbl">Tiempo</div></div>
      <div class="run-stat"><div class="run-stat-val">${fmtPace(t.pace)}</div><div class="run-stat-lbl">min/km</div></div>
      <div class="run-stat"><div class="run-stat-val">${avgKmh.toFixed(1)}</div><div class="run-stat-lbl">km/h</div></div>
      <div class="run-stat"><div class="run-stat-val">${t.kcal}</div><div class="run-stat-lbl">kcal</div></div>
    </div>

    <div class="section-title">🏆 Tus récords</div>
    <div class="run-records">
      <div class="record-card"><span class="record-emoji">📏</span><div><div class="record-val">${rec.longestKm.toFixed(1)} km</div><div class="record-lbl">Más larga</div></div></div>
      <div class="record-card"><span class="record-emoji">⚡</span><div><div class="record-val">${fmtPace(rec.bestPace)}</div><div class="record-lbl">Mejor ritmo</div></div></div>
      <div class="record-card"><span class="record-emoji">🔥</span><div><div class="record-val">${rec.streak} ${rec.streak === 1 ? 'día' : 'días'}</div><div class="record-lbl">Racha</div></div></div>
      <div class="record-card"><span class="record-emoji">📅</span><div><div class="record-val">${rec.bestWeekKm.toFixed(1)} km</div><div class="record-lbl">Mejor semana</div></div></div>
    </div>

    <div class="chart-card">
      <h3>📈 ${runTab === 'day' ? 'Sesiones de hoy' : runTab === 'week' ? 'Esta semana' : 'Este mes'}</h3>
      <div class="chart-wrap"><canvas id="runChart"></canvas></div>
    </div>

    <div class="card">
      <div class="section-title" style="margin-bottom:12px">Historial</div>
      <div class="run-history-list">
        ${[...App.runLog].reverse().slice(0, 15).map(s => `
          <div class="log-item">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:1.3rem">${s.type === 'walk' ? '🚶' : '🏃'}</span>
              <div>
                <div class="log-date">${s.km.toFixed(1)} km · ${fmtDur(s.minutes)}</div>
                <div class="text-xs text-muted">${new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · ${fmtPace(s.pace)} min/km · ${s.kcal} kcal</div>
              </div>
            </div>
            <span class="log-delete" onclick="deleteRunSession('${s.id}')">✕</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  initRunChart();
}

function initRunChart() {
  const canvas = document.getElementById('runChart');
  if (!canvas) return;
  if (runChart) { runChart.destroy(); runChart = null; }

  let labels = [], data = [];
  if (runTab === 'day') {
    const today = Data.runFilter(App.runLog, 'day');
    labels = today.map(s => new Date(s.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    data = today.map(s => +s.km.toFixed(1));
  } else if (runTab === 'week') {
    labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const start = Data.runRangeStart('week');
    data = Array(7).fill(0);
    Data.runFilter(App.runLog, 'week').forEach(s => {
      const idx = Math.floor((new Date(s.date) - start) / 86400000);
      if (idx >= 0 && idx < 7) data[idx] += s.km;
    });
    data = data.map(v => +v.toFixed(1));
  } else {
    const start = Data.runRangeStart('month');
    const buckets = {};
    Data.runFilter(App.runLog, 'month').forEach(s => {
      const wk = Math.floor((new Date(s.date).getDate() - 1) / 7);
      buckets[wk] = (buckets[wk] || 0) + s.km;
    });
    const maxWk = Math.max(3, ...Object.keys(buckets).map(Number));
    for (let i = 0; i <= maxWk; i++) { labels.push('Sem ' + (i + 1)); data.push(+(buckets[i] || 0).toFixed(1)); }
  }

  runChart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'km', data, backgroundColor: 'rgba(124,181,24,0.75)', borderRadius: 6, maxBarThickness: 44 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} km` } } },
      scales: {
        y: { beginAtZero: true, grid: { color: chartGrid() }, ticks: { color: chartTick(), font: { family: 'Poppins', size: 11 }, callback: v => v + 'km' } },
        x: { grid: { display: false }, ticks: { color: chartTick(), font: { family: 'Poppins', size: 10 } } }
      }
    }
  });
}

function addRunSession() {
  const km = parseFloat(document.getElementById('run-km').value);
  const minutes = parseFloat(document.getElementById('run-min').value);
  if (!km || km <= 0 || km > 200) { showToast('Introduce una distancia válida (km)', 'error'); return; }
  if (!minutes || minutes <= 0 || minutes > 1440) { showToast('Introduce un tiempo válido (min)', 'error'); return; }

  const before = Data.runRecords(App.runLog);
  const { pace, kmh, kcal } = Data.calcRunSession(runType, km, minutes, App.user.currentWeight);
  const session = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(), type: runType,
    km: +km.toFixed(2), minutes: Math.round(minutes),
    pace: +pace.toFixed(3), kmh: +kmh.toFixed(2), kcal
  };
  App.runLog.push(session);
  Storage.set('runLog', App.runLog);
  Storage.set('runRecords', Data.runRecords(App.runLog)); // cache reconstruible

  // ¿Récord batido?
  const after = Data.runRecords(App.runLog);
  let recordMsg = '';
  if (after.longestKm > before.longestKm) recordMsg = `🏆 ¡Récord de distancia: ${after.longestKm.toFixed(1)} km!`;
  else if (before.bestPace > 0 && after.bestPace > 0 && after.bestPace < before.bestPace) recordMsg = `🏆 ¡Nuevo mejor ritmo: ${fmtPace(after.bestPace)} min/km!`;
  else if (after.bestWeekKm > before.bestWeekKm) recordMsg = `🏆 ¡Mejor semana: ${after.bestWeekKm.toFixed(1)} km!`;

  showToast(`✅ ${km.toFixed(1)} km · ${kcal} kcal · ${fmtPace(pace)}/km`);
  if (recordMsg) setTimeout(() => showToast(recordMsg, 'success', 3500), 600);

  document.getElementById('run-km').value = '';
  document.getElementById('run-min').value = '';
  renderRunContent();
}

function deleteRunSession(id) {
  App.runLog = App.runLog.filter(s => s.id !== id);
  Storage.set('runLog', App.runLog);
  Storage.set('runRecords', Data.runRecords(App.runLog));
  renderRunContent();
}

// ===== TRACK SCREEN =====
function renderTrack() {
  const cw = parseFloat(App.user.currentWeight);
  const sw = parseFloat(App.user.startWeight || App.user.currentWeight);
  const gw = parseFloat(App.user.goalWeight);
  const lost = Math.max(0, sw - cw);
  const remaining = Math.max(0, cw - gw);
  const h = parseFloat(App.user.height) / 100;
  const bmi = (cw / (h * h)).toFixed(1);
  const bmiCat = bmi < 18.5 ? 'Bajo peso' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidad';
  const bmiColor = bmi < 18.5 ? '#3B82F6' : bmi < 25 ? '#22C55E' : bmi < 30 ? '#F97316' : '#EF4444';
  const bmiPct = Math.min(95, Math.max(5, ((bmi - 15) / 25) * 100));

  document.getElementById('screen-track').innerHTML = `
    <div class="track-hero">
      <div class="track-hero-stats">
        <div class="track-stat">
          <div class="track-stat-val">${sw}</div>
          <div class="track-stat-label">Peso inicial</div>
        </div>
        <div class="track-stat-divider"></div>
        <div class="track-stat">
          <div class="track-stat-val">${cw}</div>
          <div class="track-stat-label">Peso actual</div>
        </div>
        <div class="track-stat-divider"></div>
        <div class="track-stat">
          <div class="track-stat-val">${gw}</div>
          <div class="track-stat-label">Meta</div>
        </div>
        <div class="track-stat-divider"></div>
        <div class="track-stat">
          <div class="track-stat-val" style="color:#fff">${lost.toFixed(1)}</div>
          <div class="track-stat-label">kg perdidos</div>
        </div>
      </div>
    </div>
    <div class="add-weight-card">
      <h3>📊 Registrar peso de hoy</h3>
      <div class="weight-input-row">
        <input type="number" class="weight-input" id="new-weight-input" placeholder="${cw}" step="0.1" min="30" max="300">
        <button class="weight-submit-btn" onclick="addWeight()">Guardar</button>
      </div>
    </div>
    <div class="chart-card">
      <h3>📈 Evolución del peso</h3>
      <div class="chart-wrap"><canvas id="weightChart"></canvas></div>
    </div>
    <div class="card">
      <div class="flex-between" style="margin-bottom:12px">
        <span class="font-bold">IMC: ${bmi}</span>
        <span class="badge" style="background:${bmiColor}20;color:${bmiColor}">${bmiCat}</span>
      </div>
      <div class="bmi-bar-wrap">
        <div class="bmi-seg" style="background:#3B82F6;flex:1"></div>
        <div class="bmi-seg" style="background:#22C55E;flex:2"></div>
        <div class="bmi-seg" style="background:#F97316;flex:1.5"></div>
        <div class="bmi-seg" style="background:#EF4444;flex:1.5">
          <div class="bmi-indicator" style="left:${bmiPct}%"></div>
        </div>
      </div>
      <div class="flex-between text-xs" style="color:var(--text-3);padding:0 2px">
        <span>15</span><span>18.5 Normal</span><span>25 Sobre</span><span>30 Obeso</span><span>40</span>
      </div>
      ${remaining > 0 ? `<div style="margin-top:14px;padding:12px;background:var(--primary-ultra);border-radius:var(--r-sm);font-size:0.82rem;color:var(--primary-dark)">
        🎯 Te faltan <strong>${remaining.toFixed(1)} kg</strong> para llegar a tu meta. ¡Vas por buen camino!
      </div>` : `<div style="margin-top:14px;padding:12px;background:#F0FDF4;border-radius:var(--r-sm);font-size:0.82rem;color:#15803D">
        🎉 ¡Has alcanzado tu meta! Continúa manteniendo tu peso.
      </div>`}
    </div>
    <div class="card">
      <div class="section-title" style="margin-bottom:12px">Historial de pesajes</div>
      <div class="weight-log-list">
        ${App.weightLog.length === 0 ? '<p class="text-sm text-muted" style="text-align:center;padding:16px">Aún no hay registros</p>' :
          [...App.weightLog].reverse().slice(0,10).map((entry, i, arr) => {
            const prev = arr[i+1];
            const diff = prev ? (entry.weight - prev.weight).toFixed(1) : null;
            return `
              <div class="log-item">
                <div>
                  <div class="log-date">${new Date(entry.date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  ${diff !== null ? `<span class="log-diff ${parseFloat(diff) > 0 ? 'pos' : 'neg'}">${parseFloat(diff) > 0 ? '+' : ''}${diff} kg</span>` : ''}
                  <span class="log-weight">${entry.weight} kg</span>
                  <span class="log-delete" onclick="deleteWeight(${App.weightLog.length-1-i})">✕</span>
                </div>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `;
  initWeightChart();
}

function initWeightChart() {
  const canvas = document.getElementById('weightChart');
  if (!canvas) return;
  if (App.weightChart) { App.weightChart.destroy(); App.weightChart = null; }
  const labels = App.weightLog.map(e => new Date(e.date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}));
  const data = App.weightLog.map(e => e.weight);
  App.weightChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels, datasets: [{
        label: 'Peso (kg)', data,
        borderColor: '#7CB518', backgroundColor: 'rgba(124,181,24,0.08)',
        borderWidth: 2.5, fill: true, tension: 0.4,
        pointBackgroundColor: '#7CB518', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5
      }, {
        label: 'Meta', data: Array(labels.length).fill(parseFloat(App.user.goalWeight)),
        borderColor: '#EF4444', borderDash: [6,4], borderWidth: 1.5, fill: false,
        pointRadius: 0, tension: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} kg` } } },
      scales: {
        y: { grid: { color: chartGrid() }, ticks: { color: chartTick(), font: { family: 'Poppins', size: 11 }, callback: v => v + 'kg' } },
        x: { grid: { display: false }, ticks: { color: chartTick(), font: { family: 'Poppins', size: 10 } } }
      }
    }
  });
}

function addWeight() {
  const input = document.getElementById('new-weight-input');
  const val = parseFloat(input.value);
  if (!val || val < 30 || val > 300) { showToast('Introduce un peso válido', 'error'); return; }
  App.weightLog.push({ date: new Date().toISOString(), weight: val });
  Storage.set('weightLog', App.weightLog);
  App.user.currentWeight = val;
  Storage.set('user', App.user);
  showToast(`✅ Peso registrado: ${val} kg`);
  renderTrack();
}

function deleteWeight(idx) {
  App.weightLog.splice(idx, 1);
  Storage.set('weightLog', App.weightLog);
  renderTrack();
}

// ===== CHAT SCREEN =====
function renderChat() {
  Voice.initState();
  const autoMode = Gemini.isAutoMode();
  const hasKey = autoMode || !!App.geminiKey;
  const voiceToggle = (hasKey && Voice.ttsSupported)
    ? `<button class="voice-toggle" id="voice-toggle" onclick="toggleVoice()" title="Voz del coach">${Voice.enabled ? '🔊' : '🔇'}</button>`
    : '';
  document.getElementById('screen-chat').innerHTML = `
    <div class="chat-header-info">
      <span>🤖</span>
      <span style="flex:1">FitCoach AI — Nutricionista + Entrenador Personal. Powered by Gemini.</span>
      ${voiceToggle}
    </div>
    ${!hasKey ? renderApiSetup() : renderChatInterface()}
  `;
  if (hasKey) {
    renderMessages();
    document.getElementById('chat-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
}

function renderApiSetup() {
  return `
    <div class="api-setup-card">
      <div class="api-icon">🔑</div>
      <h3>Conecta tu AI Personal</h3>
      <p>Introduce tu API key de Google Gemini para activar el chat con tu nutricionista y entrenador personal. <strong>Es gratuita</strong> y no la almacenamos en ningún servidor.</p>
      <p style="margin-bottom:16px" class="text-sm text-muted">Obtenla gratis en <span class="api-link" onclick="showToast('Ve a aistudio.google.com y crea una API key gratuita')">aistudio.google.com</span> (sin tarjeta de crédito)</p>
      <div class="api-input-wrap">
        <input type="password" class="api-input" id="api-key-input" placeholder="AIzaSy...">
        <button class="api-save-btn" onclick="saveApiKey()">Activar FitCoach AI</button>
      </div>
    </div>
  `;
}

function renderChatInterface() {
  const quickQs = [
    '¿Qué puedo comer si tengo mucha hambre?',
    '¿Cómo acelero mi metabolismo?',
    '¿Es normal perder peso lento?',
    'Dame un ejercicio para quemar grasa rápido',
    '¿Cuánto proteína necesito al día?',
    'Tips para no picar entre horas'
  ];
  return `
    <div class="chat-wrap">
      <div class="quick-prompts">
        ${quickQs.map(q => `<button class="quick-q" onclick="sendQuickQuestion('${q}')">${q}</button>`).join('')}
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-wrap">
        <textarea class="chat-textarea" id="chat-input" placeholder="Escribe o pulsa 🎤 para hablar..." rows="1"></textarea>
        ${Voice.supported ? `<button class="chat-mic-btn" id="mic-btn" onclick="toggleMic()" title="Hablar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>` : ''}
        <button class="chat-send-btn" id="send-btn" onclick="sendMessage()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;
}

function renderMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  if (App.chatHistory.length === 0) {
    const u = App.user;
    App.chatHistory.push({
      role: 'ai',
      text: `¡Hola ${u.name}! 👋 Soy FitCoach, tu nutricionista y entrenador personal.\n\nVeo que quieres pasar de **${u.currentWeight}kg** a **${u.goalWeight}kg** con la dieta **${Data.DIETS[u.diet]?.name || u.diet}**. ¡Estoy aquí para ayudarte en cada paso!\n\nPuedes preguntarme sobre tu dieta, ejercicios, dudas nutricionales o cómo superar estancamientos. ¿En qué te ayudo hoy?`,
      time: new Date().toISOString()
    });
    Storage.set('chatHistory', App.chatHistory);
  }
  container.innerHTML = App.chatHistory.map(m => `
    <div class="chat-msg ${m.role === 'user' ? 'user' : ''}">
      <div class="msg-avatar ${m.role === 'ai' ? 'ai' : 'user-av'}">${m.role === 'ai' ? 'FC' : App.user.name[0].toUpperCase()}</div>
      <div class="msg-bubble ${m.role === 'ai' ? 'ai' : 'user'}">${m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || (!App.geminiKey && !Gemini.isAutoMode())) return;
  Voice.stopSpeaking(); // corta cualquier lectura en curso al lanzar una nueva pregunta
  input.value = '';
  input.style.height = 'auto';

  App.chatHistory.push({ role: 'user', text, time: new Date().toISOString() });
  renderMessages();

  // Add typing indicator
  const container = document.getElementById('chat-messages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `
    <div class="msg-avatar ai">FC</div>
    <div class="msg-bubble typing">
      <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
    </div>
  `;
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;

  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.disabled = true;

  try {
    const response = await Gemini.send(App.geminiKey, text, App.chatHistory.slice(0,-1), App.user);
    typingEl.remove();
    App.chatHistory.push({ role: 'ai', text: response, time: new Date().toISOString() });
    Storage.set('chatHistory', App.chatHistory);
    renderMessages();
    Voice.speak(response); // el coach lee su respuesta en voz alta (si la voz está activada)
  } catch (err) {
    typingEl.remove();
    App.chatHistory.push({ role: 'ai', text: `⚠️ ${err.message}`, time: new Date().toISOString() });
    renderMessages();
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function sendQuickQuestion(q) {
  const input = document.getElementById('chat-input');
  if (input) { input.value = q; sendMessage(); }
}

function saveApiKey() {
  const key = document.getElementById('api-key-input')?.value.trim();
  if (!key || !key.startsWith('AIza')) { showToast('Introduce una API key válida (empieza por AIza...)', 'error'); return; }
  App.geminiKey = key;
  Storage.set('geminiKey', key);
  showToast('✅ FitCoach AI activado');
  renderChat();
}

// ===== SETTINGS =====
function showSettings() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  const u = App.user;
  const rem = Reminders.get();
  const remOn = rem.enabled && ('Notification' in window) && Notification.permission === 'granted';
  const darkOn = Storage.get('theme') === 'dark';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeSettings()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div class="modal-handle"></div>
        <div class="modal-title">⚙️ Configuración</div>
        <div class="settings-item" onclick="changeDiet()">
          <div class="settings-icon">${Data.DIETS[u.diet]?.icon || '🥗'}</div>
          <div class="settings-text"><h4>Dieta actual</h4><p>${Data.DIETS[u.diet]?.name || u.diet}</p></div>
          <div class="settings-arrow">›</div>
        </div>
        <div class="settings-item" onclick="changeEquipment()">
          <div class="settings-icon">${equipMeta(u.equipment).icon}</div>
          <div class="settings-text"><h4>Entorno de entrenamiento</h4><p>${equipMeta(u.equipment).name}</p></div>
          <div class="settings-arrow">›</div>
        </div>
        <div class="settings-item" onclick="changeApiKey()">
          <div class="settings-icon">🔑</div>
          <div class="settings-text"><h4>API Key de Gemini</h4><p>${App.geminiKey ? '✓ Configurada' : 'No configurada'}</p></div>
          <div class="settings-arrow">›</div>
        </div>
        <div class="settings-item" onclick="updateWeight()">
          <div class="settings-icon">⚖️</div>
          <div class="settings-text"><h4>Actualizar peso</h4><p>Peso actual: ${u.currentWeight} kg</p></div>
          <div class="settings-arrow">›</div>
        </div>
        <div class="settings-item" onclick="openReminders()">
          <div class="settings-icon">🔔</div>
          <div class="settings-text"><h4>Recordatorios</h4><p>${remOn ? '✓ Activados' : 'Desactivados'}</p></div>
          <div class="settings-arrow">›</div>
        </div>
        <div class="settings-item">
          <div class="settings-icon">🌙</div>
          <div class="settings-text"><h4>Modo oscuro</h4><p>Tema de la aplicación</p></div>
          <div class="toggle-switch ${darkOn ? 'on' : ''}" onclick="toggleTheme(this)">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <button class="danger-btn" onclick="confirmReset()">🗑️ Resetear app</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function changeDiet() {
  const diets = Object.keys(Data.DIETS);
  const names = diets.map(d => Data.DIETS[d].name);
  const current = diets.indexOf(App.user.diet);
  const next = (current + 1) % diets.length;
  App.user.diet = diets[next];
  Storage.set('user', App.user);
  closeSettings();
  showToast(`Dieta cambiada a: ${Data.DIETS[diets[next]].name} ${Data.DIETS[diets[next]].icon}`);
  navigate('diet');
}

function equipMeta(eq) {
  const map = {
    gym:     { icon: '🏋️', name: 'Gimnasio' },
    home:    { icon: '🏠', name: 'En casa' },
    outdoor: { icon: '🏃', name: 'Correr / Andar' }
  };
  return map[eq] || map.home;
}

function changeEquipment() {
  const order = ['gym', 'home', 'outdoor'];
  const next = order[(order.indexOf(App.user.equipment) + 1) % order.length];
  App.user.equipment = next;
  Storage.set('user', App.user);
  closeSettings();
  showToast(`Entorno cambiado a: ${equipMeta(next).name} ${equipMeta(next).icon}`);
  navigate('workout');
}

function changeApiKey() {
  const key = prompt('Introduce tu API key de Gemini:');
  if (key && key.startsWith('AIza')) {
    App.geminiKey = key;
    Storage.set('geminiKey', key);
    showToast('✅ API Key actualizada');
    closeSettings();
  } else if (key) {
    showToast('Key inválida. Debe empezar por AIza...', 'error');
  }
}

function updateWeight() {
  const w = prompt(`Introduce tu peso actual (kg):\nActual: ${App.user.currentWeight} kg`);
  if (w && parseFloat(w) > 0) {
    App.user.currentWeight = parseFloat(w);
    Storage.set('user', App.user);
    App.weightLog.push({ date: new Date().toISOString(), weight: parseFloat(w) });
    Storage.set('weightLog', App.weightLog);
    showToast(`✅ Peso actualizado: ${w} kg`);
    closeSettings();
  }
}

// ===== RECORDATORIOS (panel de configuración) =====
function openReminders() {
  closeSettings();
  const modal = document.getElementById('reminders-modal');
  if (!modal) return;
  const r = Reminders.get();
  const sw = (on) => `<div class="toggle-switch ${on ? 'on' : ''}" onclick="toggleRem(this)"><div class="toggle-knob"></div></div>`;
  const time = (id, val) => `<input type="time" id="${id}" value="${val}" class="rem-time">`;

  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeReminders()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div class="modal-handle"></div>
        <div class="modal-title">🔔 Recordatorios</div>
        <p class="text-sm text-muted" style="margin:-6px 2px 14px">Avisos en tu dispositivo. Funcionan con la app abierta o en segundo plano reciente.</p>

        <div class="settings-item" style="cursor:default">
          <div class="settings-icon">⚡</div>
          <div class="settings-text"><h4>Activar recordatorios</h4><p>Interruptor general</p></div>
          ${sw(r.enabled)}<input type="hidden" id="rem-enabled" value="${r.enabled ? 1 : 0}">
        </div>

        <div class="rem-group">
          <div class="rem-group-head">
            <span>🍽️ Comidas</span>${sw(r.meals.on)}<input type="hidden" id="rem-meals" value="${r.meals.on ? 1 : 0}">
          </div>
          <div class="rem-rows">
            <div class="rem-row"><span>🌅 Desayuno</span>${time('rem-breakfast', r.meals.breakfast)}</div>
            <div class="rem-row"><span>☀️ Comida</span>${time('rem-lunch', r.meals.lunch)}</div>
            <div class="rem-row"><span>🍎 Merienda</span>${time('rem-snack', r.meals.snack)}</div>
            <div class="rem-row"><span>🌙 Cena</span>${time('rem-dinner', r.meals.dinner)}</div>
          </div>
        </div>

        <div class="rem-group">
          <div class="rem-group-head">
            <span>💧 Agua</span>${sw(r.water.on)}<input type="hidden" id="rem-water" value="${r.water.on ? 1 : 0}">
          </div>
          <div class="rem-rows">
            <div class="rem-row"><span>Desde</span>${time('rem-water-from', r.water.from)}</div>
            <div class="rem-row"><span>Hasta</span>${time('rem-water-to', r.water.to)}</div>
            <div class="rem-row"><span>Cada</span>
              <select id="rem-water-every" class="rem-time">
                <option value="1" ${r.water.every == 1 ? 'selected' : ''}>1 hora</option>
                <option value="2" ${r.water.every == 2 ? 'selected' : ''}>2 horas</option>
                <option value="3" ${r.water.every == 3 ? 'selected' : ''}>3 horas</option>
              </select>
            </div>
          </div>
        </div>

        <div class="rem-group">
          <div class="rem-group-head">
            <span>💪 Entreno</span>${sw(r.workout.on)}<input type="hidden" id="rem-workout" value="${r.workout.on ? 1 : 0}">
          </div>
          <div class="rem-rows">
            <div class="rem-row"><span>Hora</span>${time('rem-workout-time', r.workout.time)}</div>
          </div>
        </div>

        <div class="rem-group">
          <div class="rem-group-head">
            <span>⚖️ Pesaje</span>${sw(r.weighin.on)}<input type="hidden" id="rem-weighin" value="${r.weighin.on ? 1 : 0}">
          </div>
          <div class="rem-rows">
            <div class="rem-row"><span>Hora</span>${time('rem-weighin-time', r.weighin.time)}</div>
          </div>
        </div>

        <button class="ob-btn" style="margin-top:8px" onclick="saveReminders()">Guardar recordatorios</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

function closeReminders() {
  document.getElementById('reminders-modal').classList.add('hidden');
}

// Alterna el toggle visual y sincroniza el input oculto contiguo (si lo hay)
function toggleRem(el) {
  const on = !el.classList.contains('on');
  el.classList.toggle('on', on);
  const hidden = el.nextElementSibling;
  if (hidden && hidden.type === 'hidden') hidden.value = on ? 1 : 0;
}

function saveReminders() {
  const g = id => document.getElementById(id);
  const on = id => g(id).value === '1';
  const r = {
    enabled: on('rem-enabled'),
    meals: { on: on('rem-meals'), breakfast: g('rem-breakfast').value, lunch: g('rem-lunch').value, snack: g('rem-snack').value, dinner: g('rem-dinner').value },
    water: { on: on('rem-water'), from: g('rem-water-from').value, to: g('rem-water-to').value, every: parseInt(g('rem-water-every').value) },
    workout: { on: on('rem-workout'), time: g('rem-workout-time').value },
    weighin: { on: on('rem-weighin'), time: g('rem-weighin-time').value }
  };

  const finish = () => {
    Reminders.save(r);
    Reminders.init();
    closeReminders();
    showToast(r.enabled ? '🔔 Recordatorios activados' : 'Recordatorios guardados');
  };

  if (r.enabled && 'Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(perm => {
      if (perm !== 'granted') { r.enabled = false; showToast('Permiso de notificaciones denegado', 'error'); }
      finish();
    });
  } else if (r.enabled && !('Notification' in window)) {
    r.enabled = false;
    showToast('Tu navegador no soporta notificaciones', 'error');
    finish();
  } else {
    finish();
  }
}

function confirmReset() {
  if (confirm('¿Seguro que quieres resetear la app? Se perderán todos tus datos.')) {
    Storage.clear();
    location.reload();
  }
}

// ===== TOAST =====
function showToast(msg, type = 'success', duration = 2500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `position:fixed;bottom:calc(var(--nav) + 16px);left:50%;transform:translateX(-50%) translateY(20px);
      background:var(--dark);color:#fff;padding:12px 20px;border-radius:99px;font-size:0.82rem;font-weight:500;
      font-family:'Poppins',sans-serif;z-index:9000;opacity:0;transition:all 0.25s ease;max-width:85vw;text-align:center;
      box-shadow:0 4px 20px rgba(0,0,0,0.25);white-space:nowrap;overflow:hidden;text-overflow:ellipsis`;
    document.body.appendChild(toast);
  }
  if (type === 'error') toast.style.background = '#EF4444';
  else toast.style.background = 'var(--dark)';
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, duration);
}
