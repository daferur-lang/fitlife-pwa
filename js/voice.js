// ===== VOZ (dictado + lectura en voz alta) =====
// Usa la Web Speech API nativa del navegador. Sin servidor, sin coste.
// - SpeechRecognition: convierte tu voz en texto (dictar al coach).
// - speechSynthesis: lee en voz alta las respuestas del coach.
const Voice = {
  rec: null,
  recognizing: false,
  enabled: true, // ¿el coach lee sus respuestas en voz alta?
  supported: ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window),
  ttsSupported: ('speechSynthesis' in window),

  initState() {
    const v = Storage.get('voiceOn');
    this.enabled = (v === null || v === undefined) ? true : !!v;
  },

  // ----- Dictado (voz -> texto) -----
  startMic() {
    if (!this.supported) { showToast('Tu navegador no soporta dictado por voz', 'error'); return; }
    if (this.recognizing) { this.stopMic(); return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    this.rec = rec;
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    this.stopSpeaking(); // no escuchar mientras el coach habla (evita eco)

    rec.onstart = () => { this.recognizing = true; this._setMicUI(true); };

    rec.onresult = (e) => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = txt;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      }
    };

    rec.onerror = (e) => {
      this.recognizing = false; this._setMicUI(false);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') showToast('Permiso de micrófono denegado', 'error');
      else if (e.error === 'no-speech') showToast('No te he oído, inténtalo de nuevo');
    };

    rec.onend = () => {
      this.recognizing = false; this._setMicUI(false);
      const input = document.getElementById('chat-input');
      if (input && input.value.trim() && typeof sendMessage === 'function') sendMessage();
    };

    try { rec.start(); } catch {}
  },

  stopMic() { if (this.rec) { try { this.rec.stop(); } catch {} } },

  _setMicUI(on) {
    const btn = document.getElementById('mic-btn');
    if (btn) btn.classList.toggle('listening', on);
  },

  // ----- Lectura en voz alta (texto -> voz) -----
  speak(text) {
    if (!this.enabled || !this.ttsSupported || !text) return;
    this.stopSpeaking();
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[#*_`>]/g, '')
      .replace(/\n+/g, '. ')
      .trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'es-ES';
    u.rate = 1.05;
    u.pitch = 1;
    const esVoice = speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().startsWith('es'));
    if (esVoice) u.voice = esVoice;
    try { speechSynthesis.speak(u); } catch {}
  },

  stopSpeaking() {
    if (this.ttsSupported) { try { speechSynthesis.cancel(); } catch {} }
  },

  toggleEnabled() {
    this.enabled = !this.enabled;
    Storage.set('voiceOn', this.enabled);
    if (!this.enabled) this.stopSpeaking();
    this._setVoiceUI();
    showToast(this.enabled ? '🔊 Voz del coach activada' : '🔇 Voz silenciada');
  },

  _setVoiceUI() {
    const btn = document.getElementById('voice-toggle');
    if (btn) btn.textContent = this.enabled ? '🔊' : '🔇';
  }
};

// Precarga de voces (algunos navegadores las cargan async)
if ('speechSynthesis' in window) {
  try { speechSynthesis.getVoices(); } catch {}
}

// Wrappers globales para usar en onclick
function toggleMic() { Voice.startMic(); }
function toggleVoice() { Voice.toggleEnabled(); }
