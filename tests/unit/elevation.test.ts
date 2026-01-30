import { describe, it, expect } from "vitest";
import {
  calculateElevationGain,
  calculateBaseScore,
  calculateMinorityBonus,
  applyElevationGain,
  hasReachedSummit,
  SUMMIT,
} from "../../lib/elevation";

describe("calculateBaseScore", () => {
  describe("linear timing formula (0-10 seconds)", () => {
    it("returns 100m for instant answer (0ms)", () => {
      expect(calculateBaseScore(0)).toBe(100);
    });

    it("returns 90m for 1 second", () => {
      expect(calculateBaseScore(1000)).toBe(90);
    });

    it("returns 50m for 5 seconds", () => {
      expect(calculateBaseScore(5000)).toBe(50);
    });

    it("returns 0m for 10 seconds", () => {
      expect(calculateBaseScore(10000)).toBe(0);
    });

    it("returns 0m for anything over 10 seconds", () => {
      expect(calculateBaseScore(15000)).toBe(0);
      expect(calculateBaseScore(60000)).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("handles negative time (treats as instant)", () => {
      expect(calculateBaseScore(-1000)).toBe(100);
    });

    it("returns integer values (rounded)", () => {
      const times = [1234, 2567, 4890, 7123, 9456];
      times.forEach((time) => {
        const score = calculateBaseScore(time);
        expect(Number.isInteger(score)).toBe(true);
      });
    });

    it("decreases linearly from 0-10s", () => {
      const times = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
      const scores = times.map(calculateBaseScore);

      // Each subsequent score should be exactly 10 less
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBe(scores[i - 1]! - 10);
      }
    });
  });
});

describe("calculateMinorityBonus", () => {
  describe("bonus calculation", () => {
    it("gives max bonus (50m) when alone", () => {
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
  describe("combined scoring", () => {
    it("combines base score and minority bonus", () => {
      // Fast answer (0s) + alone (1/10): 100 + 45 = 145m
      const result = calculateElevationGain(0, 1, 10);
      expect(result.baseScore).toBe(100);
      expect(result.minorityBonus).toBe(45);
      expect(result.total).toBe(145);
    });

    it("fast answer in majority group", () => {
      // Fast answer (0s) + majority (10/10): 100 + 0 = 100m
      const result = calculateElevationGain(0, 10, 10);
      expect(result.baseScore).toBe(100);
      expect(result.minorityBonus).toBe(0);
      expect(result.total).toBe(100);
    });

    it("slow answer alone", () => {
      // Slow answer (10s+) + alone (1/10): 0 + 45 = 45m
      const result = calculateElevationGain(15000, 1, 10);
      expect(result.baseScore).toBe(0);
      expect(result.minorityBonus).toBe(45);
      expect(result.total).toBe(45);
    });

    it("medium speed, medium minority", () => {
      // Medium speed (5s) + half chose (5/10): 50 + 25 = 75m
      const result = calculateElevationGain(5000, 5, 10);
      expect(result.baseScore).toBe(50);
      expect(result.minorityBonus).toBe(25);
      expect(result.total).toBe(75);
    });
  });

  describe("realistic game scenarios", () => {
    it("fast player in small minority gets huge bonus", () => {
      // 1s response, only 2 out of 20 players chose this
      const result = calculateElevationGain(1000, 2, 20);
      expect(result.baseScore).toBe(90);
      expect(result.minorityBonus).toBe(45); // 90% alone
      expect(result.total).toBe(135);
    });

    it("slow player in majority gets minimal points", () => {
      // 8s response, 15 out of 20 players chose this
      const result = calculateElevationGain(8000, 15, 20);
      expect(result.baseScore).toBe(20);
      expect(result.minorityBonus).toBe(13); // Only 25% alone
      expect(result.total).toBe(33);
    });
  });
});

describe("applyElevationGain", () => {
  it("adds gain to current elevation", () => {
    expect(applyElevationGain(100, 50)).toBe(150);
  });

  it("caps at summit when gain would exceed", () => {
    expect(applyElevationGain(950, 100)).toBe(SUMMIT);
  });

  it("stays at summit if already at summit", () => {
    expect(applyElevationGain(SUMMIT, 100)).toBe(SUMMIT);
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
