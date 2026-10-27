// Sperre gegen Echtzeit: Im Render-Modus darf kein Bild von der Uhr oder der Rechengeschwindigkeit
// abhängen (Ursache von Rucklern und nicht reproduzierbaren Bildern).
//
// - Math.random wird durch einen geseedeten Generator ersetzt (Three.js nutzt Math.random z. B. für UUIDs).
// - requestAnimationFrame, Date.now, performance.now und new Date() ohne Argument werfen,
//   sobald lock() aufgerufen wurde (nach dem Aufbau der Szene, vor dem ersten Frame).
import { createRng } from './rng.js';

const original = {
  raf: window.requestAnimationFrame.bind(window),
  now: Date.now,
  perfNow: performance.now.bind(performance),
  Date: window.Date,
};

let locked = false;

function forbidden(name) {
  return () => {
    throw new Error(`Echtzeit-API "${name}" ist im Render-Modus verboten – Zeit nur aus dem Frame-Index ableiten.`);
  };
}

export function installGuard(seed) {
  const rng = createRng(seed ^ 0x9e3779b9);
  Math.random = rng.next;
  window.requestAnimationFrame = (...a) => (locked ? forbidden('requestAnimationFrame')() : original.raf(...a));
  Date.now = () => (locked ? forbidden('Date.now')() : original.now());
  performance.now = () => (locked ? forbidden('performance.now')() : original.perfNow());
  const OrigDate = original.Date;
  window.Date = class extends OrigDate {
    constructor(...args) {
      if (locked && args.length === 0) forbidden('new Date()')();
      super(...args);
    }
  };
  window.Date.now = Date.now;
}

export function lock() {
  locked = true;
}

export function isLocked() {
  return locked;
}
