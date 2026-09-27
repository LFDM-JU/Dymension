// SFX synthétisés en Web Audio : aucun fichier à charger, latence minimale.
let ctx: AudioContext | undefined;
let master: GainNode | undefined;

export function unlockAudio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.3, slideTo?: number, delay = 0) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur);
}

function noise(dur: number, vol = 0.6, lowpass = 3000) {
  if (!ctx || !master) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(filter).connect(g).connect(master);
  src.start();
}

export const sfx = {
  /** Plus le ballon est gonflé, plus le son monte : le danger s'entend. */
  pump(fill: number) {
    const f = 220 + fill * 660;
    tone(f, 0.08, 'triangle', 0.25, f * 1.25);
  },
  mega() {
    tone(300, 0.35, 'sawtooth', 0.2, 1200);
    noise(0.25, 0.15, 6000);
  },
  pop() {
    noise(0.5, 0.9, 5000);
    tone(160, 0.4, 'sine', 0.6, 40);
  },
  bank() {
    [660, 880, 1320].forEach((f, i) => tone(f, 0.12, 'square', 0.18, undefined, i * 0.07));
  },
  tick() {
    tone(1000, 0.05, 'square', 0.15);
  },
  vote() {
    tone(520, 0.06, 'square', 0.12);
  },
  start() {
    [440, 660].forEach((f, i) => tone(f, 0.1, 'square', 0.2, undefined, i * 0.08));
  },
  over() {
    [440, 330, 220].forEach((f, i) => tone(f, 0.2, 'triangle', 0.3, undefined, i * 0.15));
  },
};
