/**
 * Synthesised UI sound (Web Audio). OFF by default; the context is only created
 * after the visitor flips the toggle, so nothing ever autoplays.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let pad: { stop: () => void } | null = null;
let enabled = false;

function ensure() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setSound(on: boolean) {
  enabled = on;
  if (on) {
    const c = ensure();
    if (!c || !master) return;
    startPad(c, master);
    tick(1.4);
  } else {
    pad?.stop();
    pad = null;
  }
}

function startPad(c: AudioContext, out: GainNode) {
  pad?.stop();
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.06, c.currentTime + 3);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const lfo = c.createOscillator();
  const lfoG = c.createGain();
  lfo.frequency.value = 0.07;
  lfoG.gain.value = 180;
  lfo.connect(lfoG).connect(lp.frequency);
  const oscs = [110, 164.81, 220, 277.18].map((f, i) => {
    const o = c.createOscillator();
    o.type = i % 2 ? 'sine' : 'triangle';
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 6;
    o.connect(lp);
    o.start();
    return o;
  });
  lp.connect(g).connect(out);
  lfo.start();
  pad = {
    stop() {
      const t = c.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.6);
      setTimeout(() => {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      }, 700);
    },
  };
}

export function tick(pitch = 1) {
  if (!enabled || !ctx || !master) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(1800 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(900 * pitch, t + 0.05);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.09);
}

export function whoosh() {
  if (!enabled || !ctx || !master) return;
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 1.1);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(2600, t + 0.55);
  bp.frequency.exponentialRampToValueAtTime(400, t + 1.05);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
}
