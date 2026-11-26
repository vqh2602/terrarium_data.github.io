// Cozy Web Audio synthesizer for Terrarium Events (no external audio files).
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _ensure() {
    if (this.muted) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _tone(freq, { type = 'sine', start = 0, duration = 0.12, gain = 0.08, endFreq = null } = {}) {
    const ctx = this._ensure();
    if (!ctx) return;
    const now = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  setMuted(value) {
    this.muted = Boolean(value);
    return this.muted;
  }

  toggle() {
    return this.setMuted(!this.muted);
  }

  tap() {
    this._tone(520, { type: 'triangle', duration: 0.06, gain: 0.06, endFreq: 380 });
  }

  spinStart() {
    this._tone(330, { type: 'triangle', duration: 0.08, gain: 0.07, endFreq: 520 });
    this._tone(440, { type: 'sine', start: 0.05, duration: 0.1, gain: 0.05, endFreq: 660 });
  }

  spinTick() {
    this._tone(680, { type: 'triangle', duration: 0.032, gain: 0.035, endFreq: 420 });
  }

  reelStop(index = 0) {
    const notes = [523.25, 659.25, 783.99];
    const base = notes[index % notes.length];
    this._tone(base, { type: 'triangle', duration: 0.14, gain: 0.09, endFreq: base * 0.99 });
    this._tone(base * 2, { type: 'sine', start: 0.01, duration: 0.12, gain: 0.04 });
  }

  flip() {
    this._tone(360, { type: 'sine', duration: 0.09, gain: 0.06, endFreq: 640 });
  }

  mismatch() {
    this._tone(260, { type: 'triangle', duration: 0.11, gain: 0.07, endFreq: 210 });
    this._tone(210, { type: 'triangle', start: 0.1, duration: 0.14, gain: 0.06, endFreq: 165 });
  }

  match() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this._tone(f, { type: 'sine', start: i * 0.055, duration: 0.24, gain: 0.07 });
    });
  }

  stamp() {
    this._tone(190, { type: 'triangle', duration: 0.09, gain: 0.11, endFreq: 95 });
    this._tone(659.25, { type: 'sine', start: 0.06, duration: 0.18, gain: 0.06 });
    this._tone(880, { type: 'sine', start: 0.12, duration: 0.22, gain: 0.06 });
  }

  claim() {
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
      this._tone(f, { type: 'triangle', start: i * 0.06, duration: 0.24, gain: 0.07 });
    });
  }

  win() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((f, i) => {
      this._tone(f, { type: 'triangle', start: i * 0.07, duration: 0.34, gain: 0.08 });
    });
  }

  error() {
    this._tone(210, { type: 'sine', duration: 0.14, gain: 0.06, endFreq: 160 });
  }
}

export const sfx = new SoundEngine();
