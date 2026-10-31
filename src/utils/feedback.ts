/**
 * Gym-quality sound effects using Web Audio API synthesis.
 * No external files needed — all sounds are generated in-browser.
 * Inspired by open-source Web Audio examples (MDN, Tone.js patterns).
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Tiny helper: connect a chain and clean up automatically */
function chain(
  _ctx: AudioContext,
  nodes: AudioNode[],
  dest: AudioDestinationNode
) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  nodes[nodes.length - 1].connect(dest);
}

// ─── SOUND 1 ── Boxing / Gym Bell (set complete) ─────────────────────────────
// Classic "DING" bell: fundamental + bright overtones, quick attack, long ring
export function playSetBeep() {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Strike transient – sharp metallic click
  const noise = ctx.createOscillator();
  const noiseGain = ctx.createGain();
  noise.type = 'sawtooth';
  noise.frequency.setValueAtTime(1200, now);
  noise.frequency.exponentialRampToValueAtTime(200, now + 0.04);
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  chain(ctx, [noise, noiseGain], ctx.destination);
  noise.start(now);
  noise.stop(now + 0.06);

  // Bell body – three partials (fundamental + 2 overtones)
  const bellFreqs = [880, 1320, 2200]; // A5, E6, A7
  const bellDecays = [1.8, 1.2, 0.7];
  const bellGains = [0.28, 0.18, 0.10];

  bellFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(bellGains[i], now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + bellDecays[i]);

    chain(ctx, [osc, gain], ctx.destination);
    osc.start(now + 0.005);
    osc.stop(now + bellDecays[i] + 0.05);
  });
}

// ─── SOUND 2 ── Air Horn (workout finish) ────────────────────────────────────
// Classic stadium/gym air horn: harsh buzzy fundamental + harmonics
export function playTimerFinishBeep() {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const hornDuration = 1.4;

  // Primary horn tone
  const horn = ctx.createOscillator();
  const hornGain = ctx.createGain();
  horn.type = 'sawtooth';
  horn.frequency.setValueAtTime(185, now);          // F#3
  horn.frequency.setValueAtTime(220, now + 0.03);   // slight pitch rise on attack

  hornGain.gain.setValueAtTime(0, now);
  hornGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
  hornGain.gain.setValueAtTime(0.38, now + hornDuration - 0.1);
  hornGain.gain.exponentialRampToValueAtTime(0.001, now + hornDuration);

  // Band-pass filter to shape that "horn" character
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, now);
  filter.Q.setValueAtTime(0.8, now);

  chain(ctx, [horn, filter, hornGain], ctx.destination);
  horn.start(now);
  horn.stop(now + hornDuration + 0.05);

  // Second harmonic layer
  const horn2 = ctx.createOscillator();
  const horn2Gain = ctx.createGain();
  horn2.type = 'square';
  horn2.frequency.setValueAtTime(370, now);         // F#4

  horn2Gain.gain.setValueAtTime(0, now);
  horn2Gain.gain.linearRampToValueAtTime(0.15, now + 0.06);
  horn2Gain.gain.setValueAtTime(0.13, now + hornDuration - 0.1);
  horn2Gain.gain.exponentialRampToValueAtTime(0.001, now + hornDuration);

  chain(ctx, [horn2, horn2Gain], ctx.destination);
  horn2.start(now);
  horn2.stop(now + hornDuration + 0.05);

  // Short triumphant beep blips after the horn (3 × ascending pips)
  const pips = [880, 1047, 1319]; // A5, C6, E6 — major triad
  pips.forEach((freq, i) => {
    const t = now + hornDuration + 0.08 + i * 0.13;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    chain(ctx, [osc, gain], ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

// ─── SOUND 3 ── Countdown warning tick (last 10 seconds) ─────────────────────
export function playCountdownTick() {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1046, now); // C6

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  chain(ctx, [osc, gain], ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

// ─── Haptic ───────────────────────────────────────────────────────────────────
export function triggerHaptic(durationMs = 45) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(durationMs);
  } catch { /* silently ignore */ }
}
