/**
 * Baby sound pack smoke tests.
 *
 * The pack is procedural Web Audio, so there is nothing to listen to in a test
 * runner. What IS worth guarding is that every sound actually builds its graph
 * without touching a node method that doesn't exist - the kind of typo that
 * would otherwise only surface as silence during a live game.
 */

import { describe, expect, test, vi } from "vitest";
import { BABY_SOUNDS, playBabySound } from "../../src/lib/babySounds";
import type { SoundType } from "../../src/lib/soundManager";

function createMockContext() {
  const started: string[] = [];

  const param = () => ({
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  });

  const node = (kind: string) => ({
    connect: vi.fn(),
    start: vi.fn(() => started.push(kind)),
    stop: vi.fn(),
    frequency: param(),
    gain: param(),
    Q: param(),
    type: "sine",
    buffer: null as AudioBuffer | null,
  });

  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(() => node("oscillator")),
    createGain: vi.fn(() => node("gain")),
    createBiquadFilter: vi.fn(() => node("filter")),
    createBufferSource: vi.fn(() => node("buffer-source")),
    createBuffer: vi.fn((_channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    })),
  };

  return { ctx: ctx as unknown as AudioContext, started };
}

const SOUNDS = Object.keys(BABY_SOUNDS) as SoundType[];

describe("baby sound pack", () => {
  test.each(SOUNDS)("%s builds an audio graph and starts a source", (type) => {
    const { ctx, started } = createMockContext();

    expect(() => playBabySound(ctx, type)).not.toThrow();
    expect(started.length).toBeGreaterThan(0);
  });

  test("reports back that it handled the sound", () => {
    const { ctx } = createMockContext();
    expect(playBabySound(ctx, "giggle")).toBe(true);
  });

  test("falls back for a sound the pack does not cover", () => {
    const { ctx } = createMockContext();
    // Not a real SoundType - stands in for one the pack hasn't voiced yet.
    expect(playBabySound(ctx, "not-a-sound" as SoundType)).toBe(false);
  });

  test("every sound is routed to the speakers", () => {
    // A graph that never reaches ctx.destination plays silently.
    for (const type of SOUNDS) {
      const { ctx } = createMockContext();
      playBabySound(ctx, type);

      const connections = [
        ...(ctx.createGain as unknown as ReturnType<typeof vi.fn>).mock.results,
      ].flatMap((result) => (result.value as { connect: ReturnType<typeof vi.fn> }).connect.mock.calls);

      expect(connections.some(([target]) => target === ctx.destination)).toBe(true);
    }
  });
});
