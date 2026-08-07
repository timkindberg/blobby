import { describe, it, expect } from "vitest";
import { getHostPhase } from "../../src/hooks/useHostActions";

/**
 * getHostPhase drives which host action (advance/rewind) is offered on both
 * the admin view and the spectator view, so a wrong answer here means the
 * host loses their controls mid-game.
 */
describe("getHostPhase", () => {
  it("has no phase in the lobby", () => {
    expect(
      getHostPhase({ status: "lobby", currentQuestionIndex: -1 })
    ).toBeUndefined();
  });

  it("has no phase once finished", () => {
    expect(
      getHostPhase({ status: "finished", currentQuestionIndex: 3, questionPhase: "results" })
    ).toBeUndefined();
  });

  it("reports pre_game when active before the first question", () => {
    expect(
      getHostPhase({ status: "active", currentQuestionIndex: -1, questionPhase: "pre_game" })
    ).toBe("pre_game");
  });

  it("reports pre_game even if the stored phase is stale", () => {
    expect(
      getHostPhase({ status: "active", currentQuestionIndex: -1, questionPhase: "results" })
    ).toBe("pre_game");
  });

  it("passes through the stored phase during a question", () => {
    expect(
      getHostPhase({ status: "active", currentQuestionIndex: 0, questionPhase: "answers_shown" })
    ).toBe("answers_shown");
    expect(
      getHostPhase({ status: "active", currentQuestionIndex: 2, questionPhase: "revealed" })
    ).toBe("revealed");
  });

  it("falls back to answers_shown for sessions started before phases existed", () => {
    expect(
      getHostPhase({ status: "active", currentQuestionIndex: 0 })
    ).toBe("answers_shown");
  });
});
