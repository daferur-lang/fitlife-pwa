# 🚀 Desplegar el Worker (5 minutos, gratis para siempre)

Esto hace que la app conecte sola con la IA sin pedirle la API key al usuario.

## Paso 1 — Cuenta en Cloudflare (1 min)

1. Ve a https://dash.cloudflare.com/sign-up
2. Regístrate con tu email (no piden tarjeta)
3. Confirma el email

## Paso 2 — Crear el Worker (2 min)

1. En el panel de Cloudflare, ve a **Workers & Pages** (menú izquierdo)
2. Click en **Create application** → **Create Worker**
3. Ponle un nombre: `fitlife` (o lo que quieras)
4. Click en **Deploy** (acepta el código de ejemplo, lo reemplazaremos)
5. Una vez desplegado, click en **Edit code**
6. **Borra todo el código** que aparece y pega el contenido de `worker.js` (este mismo archivo, está en `worker/worker.js`)
7. Click en **Save and Deploy** (arriba a la derecha)

## Paso 3 — Configurar tu API key (1 min)

1. Vuelve al Worker (Workers & Pages → fitlife)
2. Ve a **Settings** → **Variables and Secrets**
3. Click en **Add variable** y añade:
   - **Variable name:** `GEMINI_KEY`
   - **Value:** tu API key de Gemini (la sacas gratis en https://aistudio.google.com)
   - **Type:** Secret (importante — para que quede oculta)
4. Añade otra variable:
   - **Variable name:** `ALLOWED_ORIGIN`
   - **Value:** `https://daferur-lang.github.io`
   - **Type:** Text
5. Click **Deploy** para guardar

## Paso 4 — Conectar la PWA (1 min)

1. Copia la URL del Worker (algo como `https://fitlife.daferur-lang.workers.dev`)
2. Abre `js/gemini.js` en tu repo
3. Pega la URL en la línea 4:
   ```js
   PROXY_URL: 'https://fitlife.daferur-lang.workers.dev',
   ```
4. Sube el cambio:
   ```bash
   git add js/gemini.js && git commit -m "Connect to Gemini proxy" && git push
   ```

## ✅ Listo

Ahora cualquiera que entre a la PWA puede chatear con FitCoach sin necesitar API key. Tú pagas $0 (free tier de Cloudflare: 100.000 peticiones/día, Gemini: 1.500/día).

## ⚠️ Si en algún momento ves abuso

Si alguien empieza a abusar (improbable porque solo se puede llamar desde tu dominio), entra al Worker y:
- Cambia `ALLOWED_ORIGIN` para restringir más
- O elimina/regenera la `GEMINI_KEY` desde aistudio.google.com
