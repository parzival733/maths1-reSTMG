/* Horloge testable. Une echeance absolue evite la derive des intervalles en arriere-plan. */
((root) => {
  'use strict';
  class Countdown {
    constructor(now = () => Date.now()) { this.now = now; this.duration = 0; this.remaining = 0; this.deadline = null; }
    start(ms) {
      if (!Number.isFinite(ms) || ms <= 0) throw new RangeError('Durée invalide');
      this.duration = ms; this.remaining = ms; this.deadline = this.now() + ms;
    }
    left() { return this.deadline === null ? this.remaining : Math.max(0, this.deadline - this.now()); }
    pause() { this.remaining = this.left(); this.deadline = null; }
    resume() { if (this.deadline === null && this.remaining > 0) this.deadline = this.now() + this.remaining; }
    elapsed() { return this.duration - this.left(); }
    stop() { this.pause(); }
    // Pause automatique quand l'onglet est masqué (visibilitychange), si le chrono
    // tourne et si la page l'autorise. Renvoie une fonction qui retire l'écouteur.
    static autoPause({isRunning, pause, enabled = () => true}, doc = typeof document !== 'undefined' ? document : null) {
      if (!doc) return () => {};
      const listener = () => { if (doc.hidden && enabled() && isRunning()) pause(); };
      doc.addEventListener('visibilitychange', listener);
      return () => doc.removeEventListener('visibilitychange', listener);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = Countdown;
  else root.QuickCountdown = Countdown;
})(typeof window !== 'undefined' ? window : globalThis);
