/**
 * Elevation calculation utilities for the mountain climb game.
 *
 * SIMPLIFIED SCORING SYSTEM:
 * 1. Base elevation per correct answer = SUMMIT / (totalQuestions * summitThreshold)
 *    - With 25 questions and 75% threshold: 1000 / (25 * 0.75) = 53.33m per correct answer
 *    - A player needs 75% correct (19 of 25) to summit
 *
 * 2. First-answerer bonus (top 20% of correct answerers get bonus):
 *    - 1st correct = highest bonus
 *    - 2nd correct = 2nd highest bonus
 *    - Bonus pool per question is 20% of base elevation
 *    - Example: if base is 50m, bonus pool is 10m, first gets 4m, second 3m, etc.
 */

// Elevation constants
export const SUMMIT = 1000; // Max elevation (game ends)

// Default summit threshold (75% = player needs 75% correct to summit)
export const DEFAULT_SUMMIT_THRESHOLD = 0.75;

// Bonus pool as percentage of base elevation
const BONUS_POOL_PERCENTAGE = 0.20; // 20% of base as bonus pool

// Top percentage of correct answerers who get bonus
const BONUS_CUTOFF_PERCENTAGE = 0.20; // Top 20% get bonus

/**
 * Calculate base elevation gained per correct answer.
 *
 * Formula: SUMMIT / (totalQuestions * summitThreshold)
 *
 * Examples with 75% threshold:
 * - 10 questions: 1000 / (10 * 0.75) = 133.33m per correct answer
 * - 20 questions: 1000 / (20 * 0.75) = 66.67m per correct answer
 * - 25 questions: 1000 / (25 * 0.75) = 53.33m per correct answer
 * - 45 questions: 1000 / (45 * 0.75) = 29.63m per correct answer
 *
 * @param totalQuestions - Total number of questions in the game
 * @param summitThreshold - Percentage of correct answers needed to summit (0-1, default 0.75)
 * @returns Base elevation gain per correct answer in meters
 */
export function calculateBaseElevation(
  totalQuestions: number,
  summitThreshold: number = DEFAULT_SUMMIT_THRESHOLD
): number {
  if (totalQuestions <= 0) return 100; // Fallback for edge case
  if (summitThreshold <= 0 || summitThreshold > 1) summitThreshold = DEFAULT_SUMMIT_THRESHOLD;

  return SUMMIT / (totalQuestions * summitThreshold);
}

/**
 * Calculate first-answerer bonus based on answer position among correct answers.
 *
 * Top 20% of correct answerers get a bonus, with 1st getting the most.
 * Bonus pool is 20% of base elevation, distributed linearly.
 *
 * Example with 50 players, base 50m, bonus pool 10m:
 * - bonusCutoff = ceil(50 * 0.20) = 10 players get bonus
 * - 1st correct: 10/10 * 10m = 10m bonus
 * - 2nd correct: 9/10 * 10m = 9m bonus
 * - 10th correct: 1/10 * 10m = 1m bonus
 * - 11th+ correct: 0m bonus
 *
 * @param answerPosition - Position among correct answerers (1 = first, 2 = second, etc.)
 * @param totalPlayers - Total number of players in the session
 * @param baseElevation - Base elevation per correct answer
 * @returns First-answerer bonus in meters
 */
export function calculateFirstAnswererBonus(
  answerPosition: number,
  totalPlayers: number,
  baseElevation: number
): number {
  if (answerPosition <= 0 || totalPlayers <= 0 || baseElevation <= 0) return 0;

  const bonusPool = baseElevation * BONUS_POOL_PERCENTAGE;
  const bonusCutoff = Math.max(1, Math.ceil(totalPlayers * BONUS_CUTOFF_PERCENTAGE));

  if (answerPosition > bonusCutoff) return 0;

  // Linear scaling: 1st gets most, last in bonus range gets least
  const bonusRatio = (bonusCutoff - answerPosition + 1) / bonusCutoff;
  return Math.round(bonusPool * bonusRatio);
}

/**
 * Calculate total elevation gain for a correct answer.
 *
 * Combines base elevation with first-answerer bonus.
 *
 * @param isCorrect - Whether the answer was correct
 * @param answerPosition - Position among correct answerers (1 = first correct, etc.)
 * @param totalPlayers - Total number of players in the session
 * @param totalQuestions - Total number of questions in the game
 * @param summitThreshold - Percentage of correct answers needed to summit (0-1, default 0.75)
 * @returns Object with base, bonus, and total elevation gain
 */
export function calculateElevationGain(
  isCorrect: boolean,
  answerPosition: number,
  totalPlayers: number,
  totalQuestions: number,
  summitThreshold: number = DEFAULT_SUMMIT_THRESHOLD
): {
  base: number;
  bonus: number;
  total: number;
} {
  if (!isCorrect) {
    return { base: 0, bonus: 0, total: 0 };
  }

  const base = Math.round(calculateBaseElevation(totalQuestions, summitThreshold));
  const bonus = calculateFirstAnswererBonus(answerPosition, totalPlayers, base);

  return {
    base,
    bonus,
    total: base + bonus,
  };
}

/**
 * Calculate new elevation after gaining.
 * NOTE: Elevation is NOT capped at summit - players can exceed 1000m for bonus elevation.
 * Summit placement is determined by when players first cross the 1000m threshold.
 */
export function applyElevationGain(currentElevation: number, gain: number): number {
  return currentElevation + gain;
}

/**
 * Check if player has reached the summit.
 */
export function hasReachedSummit(elevation: number): boolean {
  return elevation >= SUMMIT;
}
