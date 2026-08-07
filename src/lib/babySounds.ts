import type { SoundType } from "./soundManager";

/**
 * Baby sound pack.
 *
 * Same procedural approach as the default sounds (no audio assets), but every
 * voice is re-cast as nursery kit: music-box and toy-xylophone notes instead of
 * synth blips, coos and babbles instead of chirps, a rubber-duck squeak instead
 * of the scissors snip.
 *
 * A pack is a plain map from SoundType to a synth call, so a theme can swap the
 * whole palette of noises without any caller knowing.
 */

/** Music-box / glockenspiel note: pure fundamental, bell partial, fast decay. */
function musicBoxNote(
  ctx: AudioContext,
  freq: number,
  at: number,
  duration = 0.55,
  gain = 0.11
): void {
  const fundamental = ctx.createOscillator();
  const partial = ctx.createOscillator();
  const amp = ctx.createGain();

  fundamental.type = "sine";
  fundamental.frequency.setValueAtTime(freq, at);
  // Slightly detuned high partial is what makes it read as struck metal.
  partial.type = "sine";
  partial.frequency.setValueAtTime(freq * 3.01, at);

  const partialAmp = ctx.createGain();
  partialAmp.gain.setValueAtTime(0.25, at);
  partial.connect(partialAmp);
  partialAmp.connect(amp);
  fundamental.connect(amp);

  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  amp.connect(ctx.destination);

  fundamental.start(at);
  partial.start(at);
  fundamental.stop(at + duration);
  partial.stop(at + duration);
}

/**
 * Baby voice. A sine slides between two pitches under a wobble, through a
 * lowpass that keeps it soft rather than synthy - the building block for
 * coos, giggles, whimpers and babble.
 */
function coo(
  ctx: AudioContext,
  {
    at,
    from,
    to,
    duration = 0.3,
    gain = 0.13,
    wobble = 6,
  }: {
    at: number;
    from: number;
    to: number;
    duration?: number;
    gain?: number;
    wobble?: number;
  }
): void {
  const voice = ctx.createOscillator();
  const amp = ctx.createGain();
  const mouth = ctx.createBiquadFilter();

  voice.type = "sine";
  voice.frequency.setValueAtTime(from, at);
  voice.frequency.exponentialRampToValueAtTime(Math.max(40, to), at + duration);

  // Vibrato: the tiny warble that separates a baby from a test tone.
  const vibrato = ctx.createOscillator();
  const vibratoDepth = ctx.createGain();
  vibrato.type = "sine";
  vibrato.frequency.setValueAtTime(wobble, at);
  vibratoDepth.gain.setValueAtTime(from * 0.045, at);
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(voice.frequency);

  mouth.type = "lowpass";
  mouth.frequency.setValueAtTime(2200, at);
  mouth.Q.setValueAtTime(4, at);

  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + duration * 0.25);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  voice.connect(mouth);
  mouth.connect(amp);
  amp.connect(ctx.destination);

  voice.start(at);
  vibrato.start(at);
  voice.stop(at + duration);
  vibrato.stop(at + duration);
}

/** Rubber-duck squeak: fast up-down pitch bend with a reedy edge. */
function duckSqueak(ctx: AudioContext, at: number, gain = 0.12): void {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const base = 620 + Math.random() * 220;

  osc.type = "triangle";
  osc.frequency.setValueAtTime(base, at);
  osc.frequency.exponentialRampToValueAtTime(base * 2.1, at + 0.07);
  osc.frequency.exponentialRampToValueAtTime(base * 0.9, at + 0.16);

  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);

  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.18);
}

/** Shaken rattle: bandpassed noise with a bouncing envelope. */
function rattle(ctx: AudioContext, at: number, duration = 0.35, gain = 0.09): void {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.setValueAtTime(2600, at);
  band.Q.setValueAtTime(1.6, at);

  // Three shakes rather than one wash of noise.
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, at);
  for (let shake = 0; shake < 3; shake++) {
    const t = at + (duration / 3) * shake;
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration / 3.4);
  }

  source.connect(band);
  band.connect(amp);
  amp.connect(ctx.destination);
  source.start(at);
  source.stop(at + duration);
}

/** Wet little "bloop", like a bubble popping. */
function bloop(ctx: AudioContext, at: number): void {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(260 + Math.random() * 120, at);
  osc.frequency.exponentialRampToValueAtTime(900 + Math.random() * 300, at + 0.06);

  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(0.16, at + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);

  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.12);
}

/** A run of nonsense syllables - the baby version of a voice clip. */
function babble(ctx: AudioContext, at: number, syllables: number): void {
  let t = at;
  for (let i = 0; i < syllables; i++) {
    const pitch = 380 + Math.random() * 320;
    const rising = Math.random() < 0.5;
    coo(ctx, {
      at: t,
      from: pitch,
      to: rising ? pitch * 1.35 : pitch * 0.75,
      duration: 0.12 + Math.random() * 0.1,
      gain: 0.1,
      wobble: 8 + Math.random() * 6,
    });
    t += 0.13 + Math.random() * 0.09;
  }
}

// C major pentatonic - a music box can't play a wrong note in this game.
const NOTES = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5 };

/**
 * The pack. Every entry gets the context and a start time; anything missing
 * here falls back to the default sound.
 */
export const BABY_SOUNDS: Record<SoundType, (ctx: AudioContext, now: number) => void> = {
  // Toys and movement
  squeak: (ctx, now) => duckSqueak(ctx, now),
  boop: (ctx, now) => musicBoxNote(ctx, NOTES.A5, now, 0.4),
  pop: (ctx, now) => bloop(ctx, now),
  ropeTension: (ctx, now) => rattle(ctx, now, 0.32, 0.07),

  // Voices
  giggle: (ctx, now) => {
    // Four quick rising hiccups - a laugh, not a tone.
    for (let i = 0; i < 4; i++) {
      const base = 560 + i * 45;
      coo(ctx, {
        at: now + i * 0.11,
        from: base,
        to: base * 1.3,
        duration: 0.1,
        gain: 0.12,
        wobble: 14,
      });
    }
  },
  gibberish: (ctx, now) => babble(ctx, now, 4 + Math.floor(Math.random() * 3)),
  chitter: (ctx, now) => babble(ctx, now, 2 + Math.floor(Math.random() * 2)),
  blobAmbient: (ctx, now) => {
    const pitch = 400 + Math.random() * 200;
    coo(ctx, { at: now, from: pitch, to: pitch * 1.2, duration: 0.28, gain: 0.08 });
  },
  blobHappy: (ctx, now) => {
    coo(ctx, { at: now, from: 520, to: 880, duration: 0.26, gain: 0.13 });
    musicBoxNote(ctx, NOTES.C6, now + 0.16, 0.5, 0.08);
  },
  blobSad: (ctx, now) => {
    // Whimper: two falling coos, the second lower - "uh-ohhh".
    coo(ctx, { at: now, from: 520, to: 360, duration: 0.24, gain: 0.12, wobble: 9 });
    coo(ctx, { at: now + 0.26, from: 420, to: 240, duration: 0.42, gain: 0.12, wobble: 11 });
  },
  scream: (ctx, now) => {
    // The full "WAAAH": loud, wobbling, falling away.
    coo(ctx, { at: now, from: 900, to: 320, duration: 0.75, gain: 0.2, wobble: 13 });
  },

  // Game moments
  snip: (ctx, now) => {
    // Squeaky toy stepped on, then dropped.
    duckSqueak(ctx, now, 0.16);
    coo(ctx, { at: now + 0.12, from: 500, to: 180, duration: 0.32, gain: 0.11, wobble: 10 });
  },
  celebration: (ctx, now) => {
    [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((freq, i) => {
      musicBoxNote(ctx, freq, now + i * 0.1, 0.7);
    });
    for (let i = 0; i < 3; i++) {
      const base = 620 + i * 60;
      coo(ctx, { at: now + 0.45 + i * 0.1, from: base, to: base * 1.3, duration: 0.1, gain: 0.1, wobble: 14 });
    }
  },
  questionReveal: (ctx, now) => {
    [NOTES.G5, NOTES.C6].forEach((freq, i) => musicBoxNote(ctx, freq, now + i * 0.09, 0.5));
  },
  getReady: (ctx, now) => {
    rattle(ctx, now, 0.45, 0.08);
    [NOTES.C5, NOTES.D5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((freq, i) => {
      musicBoxNote(ctx, freq, now + 0.12 + i * 0.13, 0.8, 0.13);
    });
  },
  scissorsSafe: (ctx, now) => musicBoxNote(ctx, NOTES.C6, now, 0.6, 0.07),
};

/**
 * Play a sound from the baby pack.
 * Returns false when the pack has nothing for this type, so the caller can
 * fall back to the default sound.
 */
export function playBabySound(ctx: AudioContext, type: SoundType): boolean {
  const play = BABY_SOUNDS[type];
  if (!play) return false;
  play(ctx, ctx.currentTime);
  return true;
}
