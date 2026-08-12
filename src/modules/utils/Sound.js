// src/modules/utils/Sound.js
// Sons leves via Web Audio API (sem arquivos externos)

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type = 'sine', gain = 0.08) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch (_) {}
}

export const Sound = {
  click() {
    tone(420, 0.06, 'sine', 0.05);
  },
  hover() {
    tone(520, 0.03, 'sine', 0.03);
  },
  success() {
    tone(520, 0.08, 'sine', 0.06);
    setTimeout(() => tone(720, 0.12, 'sine', 0.05), 70);
  },
  linkStart() {
    const notes = [280, 340, 420, 520];
    notes.forEach((f, i) => {
      setTimeout(() => tone(f, 0.15, 'sine', 0.07), i * 120);
    });
  },
  panel() {
    tone(380, 0.07, 'triangle', 0.04);
  },
  error() {
    tone(180, 0.15, 'sawtooth', 0.04);
  }
};
