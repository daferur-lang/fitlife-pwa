// ===== STATE =====
const App = {
  user: null, geminiKey: null, weightLog: [], chatHistory: [],
  mealsEaten: {}, exercisesDone: {}, currentScreen: 'dashboard',
  fastingActive: false, fastingStart: null, fastingInterval: null,
  weightChart: null, ob: { step: 1, data: {} }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  App.user = Storage.get('user');
  App.geminiKey = Storage.get('geminiKey');
  App.weightLog = Storage.get('weightLog') || [];
  App.chatHistory = Storage.get('chatHistory') || [];
  App.fastingActive = Storage.get('fastingActive') || false;
  App.fastingStart = Storage.get('fastingStart') || null;

  const todayKey = new Date().toDateString();
  App.mealsEaten = Storage.get('mealsEaten_' + todayKey) || {};
  App.exercisesDone = Storage.get('exercisesDone_' + todayKey) || {};

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

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
  const todayWorkout = Data.getTodayWorkout(u);

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
      <div class="dash-mini-card">
        <div class="dash-mini-icon" style="background:#F5F3FF">${todayWorkout?.isRest ? '😴' : '💪'}</div>
        <div class="dash-mini-val" style="font-size:0.85rem;line-height:1.2">${todayWorkout?.focus || 'Descanso'}</div>
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
  const svgs = {
    squat: `<svg class="ex-svg anim-squat" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="10" r="8" fill="#7CB518"/>
      <rect x="22" y="20" width="16" height="18" rx="4" fill="#7CB518"/>
      <rect x="14" y="24" width="8" height="14" rx="3" fill="#7CB518"/>
      <rect x="38" y="24" width="8" height="14" rx="3" fill="#7CB518"/>
      <rect x="20" y="38" width="9" height="14" rx="3" fill="#5A8A0F"/>
      <rect x="31" y="38" width="9" height="14" rx="3" fill="#5A8A0F"/>
    </svg>`,
    pushup: `<svg class="ex-svg anim-pushup" viewBox="0 0 60 60" fill="none">
      <circle cx="12" cy="18" r="7" fill="#7CB518"/>
      <rect x="18" y="24" width="28" height="10" rx="4" fill="#7CB518"/>
      <rect x="14" y="15" width="8" height="14" rx="3" fill="#7CB518" transform="rotate(30 18 22)"/>
      <rect x="40" y="30" width="8" height="12" rx="3" fill="#5A8A0F" transform="rotate(-10 44 36)"/>
      <rect x="20" y="32" width="8" height="12" rx="3" fill="#5A8A0F" transform="rotate(10 24 38)"/>
    </svg>`,
    curl: `<svg class="ex-svg" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="10" r="8" fill="#7CB518"/>
      <rect x="22" y="20" width="16" height="18" rx="4" fill="#7CB518"/>
      <rect x="14" y="24" width="8" height="14" rx="3" class="anim-curl" fill="#7CB518"/>
      <rect x="38" y="24" width="8" height="14" rx="3" fill="#7CB518"/>
      <rect x="22" y="38" width="9" height="16" rx="3" fill="#5A8A0F"/>
      <rect x="29" y="38" width="9" height="16" rx="3" fill="#5A8A0F"/>
    </svg>`,
    run: `<svg class="ex-svg anim-run" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="9" r="8" fill="#7CB518"/>
      <rect x="23" y="19" width="14" height="16" rx="4" fill="#7CB518" transform="rotate(10 30 27)"/>
      <rect x="12" y="22" width="8" height="14" rx="3" fill="#7CB518" transform="rotate(-20 16 29)"/>
      <rect x="38" y="26" width="8" height="14" rx="3" fill="#7CB518" transform="rotate(20 42 33)"/>
      <rect x="22" y="35" width="9" height="16" rx="3" fill="#5A8A0F" transform="rotate(-15 26 43)"/>
      <rect x="30" y="35" width="9" height="16" rx="3" fill="#5A8A0F" transform="rotate(25 34 43)"/>
    </svg>`,
    plank: `<svg class="ex-svg anim-plank" viewBox="0 0 60 60" fill="none">
      <circle cx="8" cy="28" r="7" fill="#7CB518"/>
      <rect x="14" y="25" width="32" height="10" rx="4" fill="#7CB518"/>
      <rect x="10" y="20" width="6" height="14" rx="3" fill="#7CB518"/>
      <rect x="44" y="30" width="6" height="14" rx="3" fill="#5A8A0F"/>
      <rect x="38" y="30" width="6" height="14" rx="3" fill="#5A8A0F"/>
    </svg>`,
    press: `<svg class="ex-svg" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="10" r="8" fill="#7CB518"/>
      <rect x="22" y="20" width="16" height="16" rx="4" fill="#7CB518"/>
      <rect x="10" y="10" width="10" height="28" rx="3" class="anim-press" fill="#7CB518"/>
      <rect x="40" y="10" width="10" height="28" rx="3" class="anim-press" fill="#7CB518"/>
      <rect x="22" y="36" width="9" height="16" rx="3" fill="#5A8A0F"/>
      <rect x="29" y="36" width="9" height="16" rx="3" fill="#5A8A0F"/>
    </svg>`,
    jump: `<svg class="ex-svg anim-jump" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="8" r="8" fill="#7CB518"/>
      <rect x="22" y="18" width="16" height="16" rx="4" fill="#7CB518"/>
      <rect x="8" y="22" width="14" height="7" rx="3" fill="#7CB518" transform="rotate(-30 15 25)"/>
      <rect x="38" y="22" width="14" height="7" rx="3" fill="#7CB518" transform="rotate(30 45 25)"/>
      <rect x="22" y="34" width="9" height="18" rx="3" fill="#5A8A0F" transform="rotate(-10 26 43)"/>
      <rect x="29" y="34" width="9" height="18" rx="3" fill="#5A8A0F" transform="rotate(10 34 43)"/>
    </svg>`,
    row: `<svg class="ex-svg anim-row" viewBox="0 0 60 60" fill="none">
      <circle cx="10" cy="20" r="7" fill="#7CB518"/>
      <rect x="14" y="22" width="22" height="11" rx="4" fill="#7CB518" transform="rotate(-20 25 27)"/>
      <rect x="32" y="10" width="8" height="20" rx="3" fill="#7CB518" transform="rotate(-20 36 20)"/>
      <rect x="14" y="30" width="9" height="20" rx="3" fill="#5A8A0F" transform="rotate(20 18 40)"/>
      <rect x="22" y="32" width="9" height="20" rx="3" fill="#5A8A0F" transform="rotate(-10 26 42)"/>
    </svg>`,
    deadlift: `<svg class="ex-svg anim-deadlift" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="8" r="8" fill="#7CB518"/>
      <rect x="22" y="18" width="16" height="18" rx="4" fill="#7CB518"/>
      <rect x="10" y="26" width="14" height="7" rx="3" fill="#7CB518" transform="rotate(20 17 29)"/>
      <rect x="36" y="26" width="14" height="7" rx="3" fill="#7CB518" transform="rotate(-20 43 29)"/>
      <rect x="22" y="36" width="9" height="18" rx="3" fill="#5A8A0F"/>
      <rect x="29" y="36" width="9" height="18" rx="3" fill="#5A8A0F"/>
      <rect x="5" y="34" width="50" height="5" rx="2" fill="#E5E7EB"/>
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
        y: { grid: { color: '#F3F4F6' }, ticks: { font: { family: 'Poppins', size: 11 }, callback: v => v + 'kg' } },
        x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } }
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
  const hasKey = !!App.geminiKey;
  document.getElementById('screen-chat').innerHTML = `
    <div class="chat-header-info">
      <span>🤖</span>
      <span>FitCoach AI — Nutricionista + Entrenador Personal. Powered by Gemini.</span>
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
        <textarea class="chat-textarea" id="chat-input" placeholder="Pregunta al FitCoach..." rows="1"></textarea>
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
  if (!text || !App.geminiKey) return;
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
  const notifEnabled = Storage.get('notifEnabled') || false;
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
          <div class="settings-icon">${u.equipment === 'gym' ? '🏋️' : '🏠'}</div>
          <div class="settings-text"><h4>Entorno de entrenamiento</h4><p>${u.equipment === 'gym' ? 'Gimnasio' : 'En casa'}</p></div>
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
        <div class="settings-item">
          <div class="settings-icon">🔔</div>
          <div class="settings-text"><h4>Notificaciones</h4><p>Recordatorios diarios</p></div>
          <div class="toggle-switch ${notifEnabled ? 'on' : ''}" onclick="toggleNotifications(this)">
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

function changeEquipment() {
  App.user.equipment = App.user.equipment === 'gym' ? 'home' : 'gym';
  Storage.set('user', App.user);
  closeSettings();
  showToast(`Entorno cambiado a: ${App.user.equipment === 'gym' ? 'Gimnasio 🏋️' : 'Casa 🏠'}`);
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

function toggleNotifications(el) {
  const enabled = !el.classList.contains('on');
  el.classList.toggle('on', enabled);
  Storage.set('notifEnabled', enabled);
  if (enabled && 'Notification' in window) {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') showToast('🔔 Notificaciones activadas');
      else { el.classList.remove('on'); Storage.set('notifEnabled', false); showToast('Permiso denegado', 'error'); }
    });
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
