import { describe, it, expect } from "vitest";
import {
  calculateBaseElevation,
  calculateFirstAnswererBonus,
  calculateElevationGain,
  applyElevationGain,
  hasReachedSummit,
  SUMMIT,
  DEFAULT_SUMMIT_THRESHOLD,
} from "../../lib/elevation";

describe("calculateBaseElevation", () => {
  describe("with default 75% threshold", () => {
    it("returns ~133m for 10 questions", () => {
      // 1000 / (10 * 0.75) = 133.33
      const base = calculateBaseElevation(10);
      expect(base).toBeCloseTo(133.33, 1);
    });

    it("returns ~67m for 20 questions", () => {
      // 1000 / (20 * 0.75) = 66.67
      const base = calculateBaseElevation(20);
      expect(base).toBeCloseTo(66.67, 1);
    });

    it("returns ~53m for 25 questions", () => {
      // 1000 / (25 * 0.75) = 53.33
      const base = calculateBaseElevation(25);
      expect(base).toBeCloseTo(53.33, 1);
    });

    it("returns ~30m for 45 questions", () => {
      // 1000 / (45 * 0.75) = 29.63
      const base = calculateBaseElevation(45);
      expect(base).toBeCloseTo(29.63, 1);
    });
  });

  describe("with custom thresholds", () => {
    it("returns higher base with lower threshold (easier)", () => {
      // 1000 / (20 * 0.50) = 100m (50% threshold)
      const base50 = calculateBaseElevation(20, 0.50);
      expect(base50).toBeCloseTo(100, 1);

      // 1000 / (20 * 0.75) = 66.67m (75% threshold)
      const base75 = calculateBaseElevation(20, 0.75);
      expect(base75).toBeCloseTo(66.67, 1);

      expect(base50).toBeGreaterThan(base75);
    });

    it("returns lower base with higher threshold (harder)", () => {
      // 1000 / (20 * 1.0) = 50m (100% threshold - need all correct)
      const base100 = calculateBaseElevation(20, 1.0);
      expect(base100).toBeCloseTo(50, 1);
    });
  });

  describe("edge cases", () => {
    it("returns 100m fallback for 0 questions", () => {
      expect(calculateBaseElevation(0)).toBe(100);
    });

    it("returns 100m fallback for negative questions", () => {
      expect(calculateBaseElevation(-5)).toBe(100);
    });

    it("uses default threshold for invalid threshold values", () => {
      // Invalid threshold (0) should default to 0.75
      const baseInvalidZero = calculateBaseElevation(20, 0);
      const baseDefault = calculateBaseElevation(20, DEFAULT_SUMMIT_THRESHOLD);
      expect(baseInvalidZero).toBeCloseTo(baseDefault, 1);

      // Invalid threshold (negative) should default to 0.75
      const baseInvalidNeg = calculateBaseElevation(20, -0.5);
      expect(baseInvalidNeg).toBeCloseTo(baseDefault, 1);

      // Invalid threshold (> 1) should default to 0.75
      const baseInvalidHigh = calculateBaseElevation(20, 1.5);
      expect(baseInvalidHigh).toBeCloseTo(baseDefault, 1);
    });
  });
});

describe("calculateFirstAnswererBonus", () => {
  describe("with 50 players", () => {
    it("gives max bonus to 1st correct answerer", () => {
      // base = 50m, bonusPool = 10m (20%)
      // bonusCutoff = ceil(50 * 0.20) = 10 players
      // 1st: (10-1+1)/10 * 10 = 10m
      const bonus = calculateFirstAnswererBonus(1, 50, 50);
      expect(bonus).toBe(10);
    });

    it("gives proportional bonus to 5th correct answerer", () => {
      // bonusCutoff = 10
      // 5th: (10-5+1)/10 * 10 = 6m
      const bonus = calculateFirstAnswererBonus(5, 50, 50);
      expect(bonus).toBe(6);
    });

    it("gives minimum bonus to 10th correct answerer", () => {
      // 10th: (10-10+1)/10 * 10 = 1m
      const bonus = calculateFirstAnswererBonus(10, 50, 50);
      expect(bonus).toBe(1);
    });

    it("gives no bonus to 11th+ correct answerers", () => {
      expect(calculateFirstAnswererBonus(11, 50, 50)).toBe(0);
      expect(calculateFirstAnswererBonus(20, 50, 50)).toBe(0);
      expect(calculateFirstAnswererBonus(50, 50, 50)).toBe(0);
    });
  });

  describe("with 10 players", () => {
    it("gives bonus to top 20% (2 players)", () => {
      // bonusCutoff = ceil(10 * 0.20) = 2 players
      // base = 50m, bonusPool = 10m
      // 1st: (2-1+1)/2 * 10 = 10m
      // 2nd: (2-2+1)/2 * 10 = 5m
      // 3rd: 0m
      expect(calculateFirstAnswererBonus(1, 10, 50)).toBe(10);
      expect(calculateFirstAnswererBonus(2, 10, 50)).toBe(5);
      expect(calculateFirstAnswererBonus(3, 10, 50)).toBe(0);
    });
  });

  describe("with 2 players", () => {
    it("at least 1 player gets bonus", () => {
      // bonusCutoff = ceil(2 * 0.20) = 1 player (minimum)
      // 1st: (1-1+1)/1 * bonusPool = full bonus
      // 2nd: 0
      const bonus1st = calculateFirstAnswererBonus(1, 2, 50);
      const bonus2nd = calculateFirstAnswererBonus(2, 2, 50);
      expect(bonus1st).toBeGreaterThan(0);
      expect(bonus2nd).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("returns 0 for invalid position", () => {
      expect(calculateFirstAnswererBonus(0, 10, 50)).toBe(0);
      expect(calculateFirstAnswererBonus(-1, 10, 50)).toBe(0);
    });

    it("returns 0 for 0 players", () => {
      expect(calculateFirstAnswererBonus(1, 0, 50)).toBe(0);
    });

    it("returns 0 for 0 base elevation", () => {
      expect(calculateFirstAnswererBonus(1, 10, 0)).toBe(0);
    });

    it("rounds to integer", () => {
      // Verify rounding works for non-even numbers
      const bonus = calculateFirstAnswererBonus(3, 17, 53);
      expect(Number.isInteger(bonus)).toBe(true);
    });
  });
});

describe("calculateElevationGain", () => {
  describe("correct answers", () => {
    it("returns base + bonus for 1st correct answer", () => {
      // 20 questions, 10 players, 75% threshold
      // base = 1000 / (20 * 0.75) = 66.67 -> 67m (rounded)
      // bonusCutoff = ceil(10 * 0.20) = 2
      // bonusPool = 67 * 0.20 = 13.4
      // 1st bonus: (2-1+1)/2 * 13.4 = 13.4 -> 13m
      const result = calculateElevationGain(true, 1, 10, 20);
      expect(result.base).toBe(67);
      expect(result.bonus).toBe(13);
      expect(result.total).toBe(80);
    });

    it("returns base + smaller bonus for 2nd correct answer", () => {
      // 2nd bonus: (2-2+1)/2 * 13.4 = 6.7 -> 7m
      const result = calculateElevationGain(true, 2, 10, 20);
      expect(result.base).toBe(67);
      expect(result.bonus).toBe(7);
      expect(result.total).toBe(74);
    });

    it("returns base only (no bonus) for late correct answers", () => {
      const result = calculateElevationGain(true, 5, 10, 20);
      expect(result.base).toBe(67);
      expect(result.bonus).toBe(0);
      expect(result.total).toBe(67);
    });
  });

  describe("incorrect answers", () => {
    it("returns 0 for all components", () => {
      const result = calculateElevationGain(false, 1, 10, 20);
      expect(result.base).toBe(0);
      expect(result.bonus).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe("summit threshold variations", () => {
    it("50% threshold (easy) gives higher base", () => {
      // 1000 / (20 * 0.50) = 100m
      const result = calculateElevationGain(true, 5, 10, 20, 0.50);
      expect(result.base).toBe(100);
    });

    it("100% threshold (hard) gives lower base", () => {
      // 1000 / (20 * 1.0) = 50m
      const result = calculateElevationGain(true, 5, 10, 20, 1.0);
      expect(result.base).toBe(50);
    });
  });

  describe("game pacing scenarios", () => {
    it("player reaching 75% correct summits with default threshold", () => {
      // 20 questions, 75% threshold, player gets 15 correct (75%)
      // base = 67m per correct
      // 15 * 67 = 1005m >= 1000m summit
      let elevation = 0;
      for (let i = 0; i < 15; i++) {
        const result = calculateElevationGain(true, 5, 50, 20); // mid-pack answer
        elevation += result.total;
      }
      expect(elevation).toBeGreaterThanOrEqual(SUMMIT);
    });

    it("player reaching 60% correct does NOT summit with default threshold", () => {
      // 20 questions, 75% threshold, player gets 12 correct (60%)
      // 12 * 67 = 804m < 1000m
      let elevation = 0;
      for (let i = 0; i < 12; i++) {
        const result = calculateElevationGain(true, 5, 50, 20); // mid-pack answer
        elevation += result.total;
      }
      expect(elevation).toBeLessThan(SUMMIT);
    });

    it("fast answerer gets bonus elevation advantage", () => {
      // Compare 1st vs 10th correct answerer over 10 questions
      let elevationFast = 0;
      let elevationSlow = 0;

      for (let i = 0; i < 10; i++) {
        elevationFast += calculateElevationGain(true, 1, 50, 20).total;
        elevationSlow += calculateElevationGain(true, 15, 50, 20).total;
      }

      // Fast answerer should have meaningful advantage
      expect(elevationFast).toBeGreaterThan(elevationSlow);
      expect(elevationFast - elevationSlow).toBeGreaterThan(50); // At least 50m difference
    });
  });
});

describe("applyElevationGain", () => {
  it("adds gain to current elevation", () => {
    expect(applyElevationGain(100, 50)).toBe(150);
  });

  it("allows exceeding summit (no cap)", () => {
    expect(applyElevationGain(950, 100)).toBe(1050);
  });

  it("allows continued gains above summit", () => {
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

  it("returns true above summit", () => {
    expect(hasReachedSummit(SUMMIT + 1)).toBe(true);
    expect(hasReachedSummit(1500)).toBe(true);
  });
});

describe("constants", () => {
  it("has expected summit value", () => {
    expect(SUMMIT).toBe(1000);
  });

  it("has expected default threshold", () => {
    expect(DEFAULT_SUMMIT_THRESHOLD).toBe(0.75);
  });
});
