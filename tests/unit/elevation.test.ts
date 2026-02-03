import { describe, it, expect } from "vitest";
import {
  calculateElevationGain,
  calculateBaseScore,
  calculateMinorityBonus,
  calculateMaxPerQuestion,
  applyElevationGain,
  hasReachedSummit,
  calculateDynamicMax,
  SUMMIT,
} from "../../lib/elevation";

describe("calculateMaxPerQuestion", () => {
  describe("scales max elevation based on question count", () => {
    it("returns ~152m for 10 questions (summit at 66% = 6.6 questions)", () => {
      // 1000 / (10 * 0.66) = 1000 / 6.6 = 151.52
      const max = calculateMaxPerQuestion(10);
      expect(max).toBeCloseTo(151.52, 1);
    });

    it("returns ~76m for 20 questions (summit at 66% = 13.2 questions)", () => {
      // 1000 / (20 * 0.66) = 1000 / 13.2 = 75.76
      const max = calculateMaxPerQuestion(20);
      expect(max).toBeCloseTo(75.76, 1);
    });

    it("returns ~34m for 45 questions (summit at 66% = 29.7 questions)", () => {
      // 1000 / (45 * 0.66) = 1000 / 29.7 = 33.67
      const max = calculateMaxPerQuestion(45);
      expect(max).toBeCloseTo(33.67, 1);
    });

    it("returns default max (175m) for 0 or negative questions", () => {
      expect(calculateMaxPerQuestion(0)).toBe(175);
      expect(calculateMaxPerQuestion(-5)).toBe(175);
    });
  });
});

describe("calculateBaseScore", () => {
  describe("legacy behavior (no totalQuestions)", () => {
    it("returns 125m for instant answer (0ms)", () => {
      expect(calculateBaseScore(0)).toBe(125);
    });

    it("returns 113m (rounded) for 1 second", () => {
      // 125 - 12.5 = 112.5, rounds to 113
      expect(calculateBaseScore(1000)).toBe(113);
    });

    it("returns 63m (rounded) for 5 seconds", () => {
      // 125 - 62.5 = 62.5, rounds to 63
      expect(calculateBaseScore(5000)).toBe(63);
    });

    it("returns 0m for 10 seconds", () => {
      expect(calculateBaseScore(10000)).toBe(0);
    });

    it("returns 0m for anything over 10 seconds", () => {
      expect(calculateBaseScore(15000)).toBe(0);
      expect(calculateBaseScore(60000)).toBe(0);
    });
  });

  describe("scaled behavior (with totalQuestions)", () => {
    it("scales base score for 10 questions", () => {
      // With 66%: maxPerQuestion = 1000/(10*0.66) = 151.52
      // baseMax = 151.52 * (125/175) = 108.22
      const instant = calculateBaseScore(0, 10);
      expect(instant).toBe(108); // ~108m for instant answer

      const fiveSeconds = calculateBaseScore(5000, 10);
      expect(fiveSeconds).toBe(54); // ~54m for 5s answer (half of max)

      const tenSeconds = calculateBaseScore(10000, 10);
      expect(tenSeconds).toBe(0); // 0m for 10s answer
    });

    it("scales base score for 45 questions", () => {
      // With 66%: maxPerQuestion = 1000/(45*0.66) = 33.67
      // baseMax = 33.67 * (125/175) = 24.05
      const instant = calculateBaseScore(0, 45);
      expect(instant).toBe(24); // ~24m for instant answer

      const fiveSeconds = calculateBaseScore(5000, 45);
      expect(fiveSeconds).toBe(12); // ~12m for 5s answer

      const tenSeconds = calculateBaseScore(10000, 45);
      expect(tenSeconds).toBe(0); // 0m for 10s answer
    });

    it("handles edge case of 0 totalQuestions (uses default)", () => {
      expect(calculateBaseScore(0, 0)).toBe(125); // Falls back to default
    });
  });

  describe("edge cases", () => {
    it("handles negative time (treats as instant)", () => {
      expect(calculateBaseScore(-1000)).toBe(125);
    });

    it("returns integer values (rounded)", () => {
      const times = [1234, 2567, 4890, 7123, 9456];
      times.forEach((time) => {
        const score = calculateBaseScore(time);
        expect(Number.isInteger(score)).toBe(true);
      });
    });

    it("decreases linearly from 0-10s", () => {
      // At 0s: 125, at 10s: 0
      // Decrease is 12.5m per second
      expect(calculateBaseScore(0)).toBe(125);
      expect(calculateBaseScore(2000)).toBe(100); // 125 - 25 = 100
      expect(calculateBaseScore(4000)).toBe(75);  // 125 - 50 = 75
      expect(calculateBaseScore(6000)).toBe(50);  // 125 - 75 = 50
      expect(calculateBaseScore(8000)).toBe(25);  // 125 - 100 = 25
      expect(calculateBaseScore(10000)).toBe(0);  // 125 - 125 = 0
    });
  });
});

describe("calculateMinorityBonus", () => {
  describe("legacy behavior (no totalQuestions)", () => {
    it("gives max bonus (45m) when nearly alone (1/10)", () => {
      // 1 player chose this, 10 total: aloneRatio = 0.9
      expect(calculateMinorityBonus(1, 10)).toBe(45);
    });

    it("gives ~25m bonus when half chose this answer", () => {
      // 5 players chose this, 10 total: aloneRatio = 0.5
      expect(calculateMinorityBonus(5, 10)).toBe(25);
    });

    it("gives 0m bonus when everyone chose this answer", () => {
      // 10 players chose this, 10 total: aloneRatio = 0.0
      expect(calculateMinorityBonus(10, 10)).toBe(0);
    });

    it("gives ~33m bonus when 2/3 chose different answer", () => {
      // 3 players chose this, 9 total: aloneRatio = 2/3
      expect(calculateMinorityBonus(3, 9)).toBe(33);
    });
  });

  describe("scaled behavior (with totalQuestions)", () => {
    it("scales minority bonus for 10 questions", () => {
      // With 66%: maxPerQuestion = 1000/(10*0.66) = 151.52
      // bonusMax = 151.52 * (50/175) = 43.29
      // 1/10 players: aloneRatio = 0.9, bonus = 0.9 * 43.29 = 38.96 -> 39
      expect(calculateMinorityBonus(1, 10, 10)).toBe(39);

      // 5/10 players: aloneRatio = 0.5, bonus = 0.5 * 43.29 = 21.65 -> 22
      expect(calculateMinorityBonus(5, 10, 10)).toBe(22);

      // 10/10 players: aloneRatio = 0.0, bonus = 0
      expect(calculateMinorityBonus(10, 10, 10)).toBe(0);
    });

    it("scales minority bonus for 45 questions", () => {
      // With 66%: maxPerQuestion = 1000/(45*0.66) = 33.67
      // bonusMax = 33.67 * (50/175) = 9.62
      // 1/10 players: aloneRatio = 0.9, bonus = 0.9 * 9.62 = 8.66 -> 9
      expect(calculateMinorityBonus(1, 10, 45)).toBe(9);

      // 5/10 players: aloneRatio = 0.5, bonus = 0.5 * 9.62 = 4.81 -> 5
      expect(calculateMinorityBonus(5, 10, 45)).toBe(5);
    });

    it("handles edge case of 0 totalQuestions (uses default)", () => {
      expect(calculateMinorityBonus(1, 10, 0)).toBe(45); // Falls back to default
    });
  });

  describe("edge cases", () => {
    it("handles 0 total answers", () => {
      expect(calculateMinorityBonus(0, 0)).toBe(0);
    });

    it("handles single player (alone)", () => {
      expect(calculateMinorityBonus(1, 1)).toBe(0); // Only player = majority
    });

    it("returns integer values (rounded)", () => {
      const pairs = [
        [1, 7],
        [2, 9],
        [3, 13],
        [5, 17],
      ];
      pairs.forEach(([onLadder, total]) => {
        const bonus = calculateMinorityBonus(onLadder!, total!);
        expect(Number.isInteger(bonus)).toBe(true);
      });
    });
  });
});

describe("calculateElevationGain", () => {
  describe("legacy combined scoring (no totalQuestions)", () => {
    it("combines base score and minority bonus", () => {
      // Fast answer (0s) + alone (1/10): 125 + 45 = 170m
      const result = calculateElevationGain(0, 1, 10);
      expect(result.baseScore).toBe(125);
      expect(result.minorityBonus).toBe(45);
      expect(result.total).toBe(170);
    });

    it("fast answer in majority group", () => {
      // Fast answer (0s) + majority (10/10): 125 + 0 = 125m
      const result = calculateElevationGain(0, 10, 10);
      expect(result.baseScore).toBe(125);
      expect(result.minorityBonus).toBe(0);
      expect(result.total).toBe(125);
    });

    it("slow answer alone", () => {
      // Slow answer (10s+) + alone (1/10): 0 + 45 = 45m
      const result = calculateElevationGain(15000, 1, 10);
      expect(result.baseScore).toBe(0);
      expect(result.minorityBonus).toBe(45);
      expect(result.total).toBe(45);
    });

    it("medium speed, medium minority", () => {
      // Medium speed (5s) + half chose (5/10): 63 + 25 = 88m
      const result = calculateElevationGain(5000, 5, 10);
      expect(result.baseScore).toBe(63);
      expect(result.minorityBonus).toBe(25);
      expect(result.total).toBe(88);
    });
  });

  describe("scaled combined scoring (with totalQuestions)", () => {
    it("scales down for 45 questions - fast answer alone", () => {
      // With 66%: maxPerQuestion = 33.67m
      // Fast answer (0s) + alone (1/10): 24 + 9 = 33m
      const result = calculateElevationGain(0, 1, 10, 45);
      expect(result.baseScore).toBe(24);
      expect(result.minorityBonus).toBe(9);
      expect(result.total).toBe(33);
    });

    it("scales appropriately for 10 questions - fast answer alone", () => {
      // With 66%: maxPerQuestion = 151.52m
      // Fast answer (0s) + alone (1/10): 108 + 39 = 147m
      const result = calculateElevationGain(0, 1, 10, 10);
      expect(result.baseScore).toBe(108);
      expect(result.minorityBonus).toBe(39);
      expect(result.total).toBe(147);
    });

    it("ensures summit reachable at 66% with perfect answers (45 questions)", () => {
      // With 45 questions, target is ~30 perfect answers to summit
      // Max per question ≈ 33.67m
      // 30 perfect answers * 33.67m = ~1010m (slightly over 1000)
      const maxPerQuestion = calculateMaxPerQuestion(45);
      const targetQuestions = Math.ceil(45 * 0.66); // 30 questions
      const totalElevation = maxPerQuestion * targetQuestions;
      expect(totalElevation).toBeGreaterThanOrEqual(SUMMIT);
      expect(totalElevation).toBeLessThan(SUMMIT * 1.05); // Within 5% over
    });

    it("ensures summit reachable at 66% with perfect answers (10 questions)", () => {
      // With 10 questions, target is ~7 perfect answers to summit
      const maxPerQuestion = calculateMaxPerQuestion(10);
      const targetQuestions = Math.ceil(10 * 0.66); // 7 questions
      const totalElevation = maxPerQuestion * targetQuestions;
      expect(totalElevation).toBeGreaterThanOrEqual(SUMMIT);
      expect(totalElevation).toBeLessThan(SUMMIT * 1.1); // Within 10% over
    });
  });

  describe("realistic game scenarios (legacy)", () => {
    it("fast player in small minority gets huge bonus", () => {
      // 1s response, only 2 out of 20 players chose this
      const result = calculateElevationGain(1000, 2, 20);
      expect(result.baseScore).toBe(113); // 125 - 12.5 = 112.5 -> 113
      expect(result.minorityBonus).toBe(45); // 90% alone
      expect(result.total).toBe(158);
    });

    it("slow player in majority gets minimal points", () => {
      // 8s response, 15 out of 20 players chose this
      const result = calculateElevationGain(8000, 15, 20);
      expect(result.baseScore).toBe(25); // 125 - 100 = 25
      expect(result.minorityBonus).toBe(13); // Only 25% alone
      expect(result.total).toBe(38);
    });
  });

  describe("game pacing scenarios", () => {
    it("45-question game summit progression with perfect base score only", () => {
      // Simulate getting perfect BASE scores (instant answers) over ALL questions
      // Using majority group (no minority bonus) to test base score alone
      let elevation = 0;

      for (let i = 0; i < 45; i++) {
        // Perfect answer: instant (0ms), majority (10/10 = no minority bonus)
        const gain = calculateElevationGain(0, 10, 10, 45);
        elevation += gain.total;
      }

      // With 66% target and only base scores (71% of max), 45 questions gives:
      // 45 * 24 = 1080m (exceeds summit)
      // This validates that perfect base score alone CAN reach summit in longer games
      expect(elevation).toBeGreaterThan(SUMMIT);
      expect(elevation).toBeLessThan(SUMMIT * 1.2); // Should be within 20% over
    });

    it("45-question game summit progression with full scoring", () => {
      // Simulate perfect answers (instant + minority) over 66% of questions
      // Max per question for 45 questions ≈ 33.67m
      let elevation = 0;
      const questionsForSummit = Math.ceil(45 * 0.66); // 30 questions

      for (let i = 0; i < questionsForSummit; i++) {
        // Max scoring: instant (0ms), truly alone (1/1 still gives 0 bonus though)
        // Use 1/10 for realistic minority bonus
        const gain = calculateElevationGain(0, 1, 10, 45);
        elevation += gain.total;
      }

      // 30 questions * 29m each ≈ 870m - close to summit
      // With full scoring they should be at or near summit
      expect(elevation).toBeGreaterThan(SUMMIT * 0.85); // Should be within 15% of summit
    });

    it("10-question game summit progression", () => {
      // With 10 questions, expect summit around question 7
      let elevation = 0;
      const questionsForSummit = Math.ceil(10 * 0.66); // 7 questions

      for (let i = 0; i < questionsForSummit; i++) {
        // Max scoring: instant answer, good minority position
        const gain = calculateElevationGain(0, 1, 10, 10);
        elevation += gain.total;
      }

      expect(elevation).toBeGreaterThanOrEqual(SUMMIT);
    });

    it("validates max per question scales correctly", () => {
      // For 45 questions: 1000 / (45 * 0.66) = 33.67m max
      // 66% of 45 = 29.7, ceiling to 30 questions
      // 30 * 33.67 = 1010m >= 1000m summit
      const maxPerQuestion = calculateMaxPerQuestion(45);
      const targetQuestions = 45 * 0.66;
      expect(maxPerQuestion * targetQuestions).toBeCloseTo(SUMMIT, 0);
    });
  });
});

describe("applyElevationGain", () => {
  it("adds gain to current elevation", () => {
    expect(applyElevationGain(100, 50)).toBe(150);
  });

  it("allows exceeding summit (no cap)", () => {
    // Elevation is no longer capped - players can exceed 1000m for bonus
    expect(applyElevationGain(950, 100)).toBe(1050);
  });

  it("allows continued gains above summit", () => {
    // Players at summit can still earn bonus elevation
    expect(applyElevationGain(SUMMIT, 100)).toBe(1100);
  });

  it("handles starting from 0", () => {
    expect(applyElevationGain(0, 100)).toBe(100);
  });

  it("handles 0 gain", () => {
    expect(applyElevationGain(500, 0)).toBe(500);
  });
});

describe("hasReachedSummit", () => {
  it("returns false when below summit", () => {
    expect(hasReachedSummit(0)).toBe(false);
    expect(hasReachedSummit(500)).toBe(false);
    expect(hasReachedSummit(999)).toBe(false);
  });

  it("returns true at exactly summit", () => {
    expect(hasReachedSummit(SUMMIT)).toBe(true);
  });

  it("returns true above summit (edge case)", () => {
    expect(hasReachedSummit(SUMMIT + 1)).toBe(true);
  });
});

describe("constants", () => {
  it("has expected summit value", () => {
    expect(SUMMIT).toBe(1000);
  });
});

describe("calculateDynamicMax", () => {
  describe("boost-only logic (never reduces below 175m floor)", () => {
    it("returns floor of 175m for normal situations", () => {
      // Leader at 700m, 3 questions left: (1000-700)/3 = 100m < 175 -> returns 175
      expect(calculateDynamicMax(700, 3)).toBe(175);
    });

    it("returns floor for even distribution below threshold", () => {
      // Leader at 500m, 5 questions left: (1000-500)/5 = 100m < 175 -> returns 175
      expect(calculateDynamicMax(500, 5)).toBe(175);
    });

    it("returns floor when many questions remain", () => {
      // Leader at 50m, 10 questions left: (1000-50)/10 = 95m < 175 -> returns 175
      expect(calculateDynamicMax(50, 10)).toBe(175);
    });

    it("returns floor for typical late game", () => {
      // Leader at 900m, 2 questions left: (1000-900)/2 = 50m < 175 -> returns 175
      expect(calculateDynamicMax(900, 2)).toBe(175);
    });

    it("boosts above 175m when catch-up needed", () => {
      // Leader at 500m, 2 questions left: (1000-500)/(2*0.66) = 379m > 175 -> returns 379
      expect(calculateDynamicMax(500, 2)).toBe(379);

      // Leader at 300m, 2 questions left: (1000-300)/(2*0.66) = 530m > 175 -> returns 530
      expect(calculateDynamicMax(300, 2)).toBe(530);

      // Leader at 0m, 4 questions left: 1000/(4*0.66) = 379m > 175 -> returns 379
      expect(calculateDynamicMax(0, 4)).toBe(379);
    });
  });

  describe("minimum floor is always 175m", () => {
    it("never returns below 175m", () => {
      // Even very small distances return 175
      expect(calculateDynamicMax(950, 1)).toBe(175);
      expect(calculateDynamicMax(975, 1)).toBe(175);
      expect(calculateDynamicMax(990, 1)).toBe(175);
    });

    it("returns 175m for most normal game scenarios", () => {
      const scenarios = [
        { leader: 0, questions: 10 },
        { leader: 100, questions: 9 },
        { leader: 200, questions: 8 },
        { leader: 300, questions: 7 },
        { leader: 400, questions: 6 },
        { leader: 500, questions: 5 },
        { leader: 600, questions: 4 },
        { leader: 700, questions: 3 },
        { leader: 800, questions: 2 },
        { leader: 900, questions: 1 },
      ];

      scenarios.forEach(({ leader, questions }) => {
        const cap = calculateDynamicMax(leader, questions);
        expect(cap).toBeGreaterThanOrEqual(175);
      });
    });
  });

  describe("edge cases", () => {
    it("handles leader at summit (all non-summited filtered)", () => {
      // All players summited: distance = 0 or negative, should return 175
      expect(calculateDynamicMax(1000, 5)).toBe(175);
    });

    it("handles leader beyond summit", () => {
      // Above summit (shouldn't happen, but handle gracefully)
      expect(calculateDynamicMax(1050, 5)).toBe(175);
    });

    it("handles 0 questions remaining", () => {
      // Last question edge case - return 175
      expect(calculateDynamicMax(500, 0)).toBe(175);
    });

    it("handles negative questions remaining", () => {
      // Edge case: return 175
      expect(calculateDynamicMax(500, -1)).toBe(175);
    });

    it("handles leader at 0 with few questions (boost scenario)", () => {
      // Start of short game: 1000/(4*0.66) = 379m (boost)
      expect(calculateDynamicMax(0, 4)).toBe(379);
    });

    it("handles leader at 0 with many questions", () => {
      // Start of long game: 1000/(10*0.66) = 152m < 175 -> 175
      expect(calculateDynamicMax(0, 10)).toBe(175);
    });
  });

  describe("realistic game scenarios", () => {
    it("early game: 175m floor allows good progress", () => {
      // Question 1 reveal: leader at ~100m, 9 questions left
      // (1000-100)/(9*0.66) = 152m < 175 -> returns 175
      expect(calculateDynamicMax(100, 9)).toBe(175);
    });

    it("mid game: 175m floor maintained", () => {
      // Question 5 reveal: leader at 500m, 5 questions left
      // (1000-500)/(5*0.66) = 152m < 175 -> returns 175
      expect(calculateDynamicMax(500, 5)).toBe(175);
    });

    it("late game with tight race: 175m floor maintained", () => {
      // Question 8 reveal: leader at 850m, 2 questions left
      // (1000-850)/(2*0.66) = 114m < 175 -> returns 175
      expect(calculateDynamicMax(850, 2)).toBe(175);
    });

    it("final question: 175m floor ensures easy summit", () => {
      // Question 9 reveal: leader at 975m, 1 question left
      // (1000-975)/(1*0.66) = 38m < 175 -> returns 175 (easy summit)
      expect(calculateDynamicMax(975, 1)).toBe(175);
    });

    it("catch-up scenario: boost above 175m", () => {
      // Leader very far ahead: everyone else far behind
      // If non-summited leader is at 200m with 2 questions left
      // (1000-200)/(2*0.66) = 606m > 175 -> returns 606 (major boost)
      expect(calculateDynamicMax(200, 2)).toBe(606);
    });
  });

  describe("rounding behavior", () => {
    it("rounds to nearest integer", () => {
      // 1000-333 = 667, 667/(3*0.66) = 337 -> rounds to 337
      expect(calculateDynamicMax(333, 3)).toBe(337);

      // 1000-250 = 750, 750/(3*0.66) = 379 -> returns 379
      expect(calculateDynamicMax(250, 3)).toBe(379);
    });

    it("always returns integer values", () => {
      const scenarios = [
        { leader: 123, questions: 2 },
        { leader: 456, questions: 2 },
        { leader: 100, questions: 3 },
      ];

      scenarios.forEach(({ leader, questions }) => {
        const cap = calculateDynamicMax(leader, questions);
        expect(Number.isInteger(cap)).toBe(true);
      });
    });
  });
});
