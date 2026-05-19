const Storage = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('fl_' + key)); } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem('fl_' + key, JSON.stringify(val)); } catch {}
  },
  remove(key) { localStorage.removeItem('fl_' + key); },
  clear() {
    Object.keys(localStorage).filter(k => k.startsWith('fl_')).forEach(k => localStorage.removeItem(k));
  }
};
