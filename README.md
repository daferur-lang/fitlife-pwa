# 🏃 FitLife — Tu Coach Personal de Pérdida de Peso

Una **Progressive Web App** que combina nutricionista digital y entrenador personal en una sola aplicación. Sin backend, sin costes, 100% en tu dispositivo.

### 🚀 [**Probar la app en vivo**](https://daferur-lang.github.io/fitlife-pwa/)

---

## ✨ Características

### 🥗 Nutricionista digital
Planes semanales completos para 5 dietas científicamente respaldadas:
- 🥑 **Keto** — alta en grasa, baja en carbohidratos
- 🫒 **Mediterránea** — equilibrada y deliciosa
- ⏱️ **Ayuno Intermitente 16:8** — con cronómetro integrado
- 💙 **DASH** — baja en sodio, alta en nutrientes
- 🌱 **Plant-Based** — 100% vegetal

Cada dieta incluye 7 días de menús reales con desayuno, comida, merienda y cena, macros detallados y lista de la compra organizada.

### 💪 Entrenador personal
Rutinas semanales adaptadas a tu entorno:
- 🏋️ **Gimnasio** — con equipamiento completo
- 🏠 **En casa** — solo peso corporal

Cada ejercicio incluye series, repeticiones, descanso, músculos trabajados, consejos de forma y una **animación SVG** que muestra el movimiento.

### 📊 Seguimiento de progreso
- Gráfica interactiva de evolución del peso
- IMC con indicador visual
- Historial completo de pesajes
- Estadísticas de días activos y entrenamientos completados

### 🤖 Chat con IA personal
Pregunta cualquier duda a **FitCoach AI** (powered by Gemini 2.0 Flash). Conoce tu perfil completo y te responde como un nutricionista + entrenador certificado.

### 📱 PWA instalable y offline
- Funciona sin conexión tras la primera carga
- Instálala como app nativa en móvil
- Notificaciones push para recordatorios

---

## 🔑 Cómo activar el chat con IA (gratis)

1. Ve a [aistudio.google.com](https://aistudio.google.com)
2. Crea una API key gratuita (sin tarjeta de crédito)
3. Pégala en la app cuando entres a la sección **AI Coach**

Límites del tier gratuito de Gemini: 15 peticiones/minuto, 1500/día.

---

## 📲 Cómo instalarla en el móvil

**Android (Chrome):** Abre la app → menú ⋮ → "Instalar app"

**iPhone (Safari):** Abre la app → compartir → "Añadir a pantalla de inicio"

---

## 🛠️ Stack técnico

- **HTML5 + CSS3 + JavaScript vanilla** — sin frameworks
- **Chart.js** — gráficas de progreso
- **Gemini 2.0 Flash API** — chat inteligente
- **Service Worker** — modo offline
- **LocalStorage** — persistencia de datos

Sin backend. Sin base de datos. Sin cookies. Todo se queda en tu dispositivo.

---

## 📂 Estructura

```
fitlife-pwa/
├── index.html           # SPA shell
├── manifest.json        # PWA metadata
├── sw.js                # Service worker
├── css/app.css          # Estilos
├── js/
│   ├── storage.js       # LocalStorage helpers
│   ├── gemini.js        # Gemini API wrapper
│   ├── data.js          # Planes de dieta + rutinas
│   └── app.js           # Lógica principal
└── icons/icon.svg       # Icono PWA
```

---

## ⚠️ Aviso legal

Esta app es una herramienta informativa y motivacional. **No sustituye el consejo de un médico o nutricionista certificado.** Consulta con un profesional antes de empezar cualquier plan de dieta o ejercicio, especialmente si tienes condiciones médicas preexistentes.

---

## 📄 Licencia

MIT — Úsala, modifícala y compártela libremente.
