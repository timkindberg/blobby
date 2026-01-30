/**
 * Elevation calculation utilities for the mountain climb game.
 *
 * Players gain elevation by answering questions correctly.
 * Scoring has two components:
 * 1. Base score from answer speed (linear 0-10s)
 * 2. Minority bonus for choosing less popular answers
 */

// Elevation constants
export const SUMMIT = 1000; // Max elevation (game ends)

/**
 * Calculate base elevation score based on answer speed.
 * Linear formula: 100 - (responseTimeSeconds * 10)
 *
 * 0.0s:   100m
 * 1.0s:   90m
 * 5.0s:   50m
 * 10s+:   0m
 *
 * @param answerTimeMs - Time to answer in milliseconds
 * @returns Base elevation score in meters (0-100)
 */
export function calculateBaseScore(answerTimeMs: number): number {
  const seconds = Math.max(0, answerTimeMs / 1000); // Handle negative times
  const baseScore = Math.max(0, 100 - seconds * 10);
  return Math.round(baseScore);
}

/**
 * Calculate minority bonus based on answer distribution.
 * Players who chose less popular answers get a bonus.
 *
 * aloneRatio = 1 - (playersOnMyLadder / totalAnswered)
 * minorityBonus = aloneRatio * 50
 *
 * Examples:
 * - 1 player chose this, 10 total: aloneRatio = 0.9, bonus = 45m
 * - 5 players chose this, 10 total: aloneRatio = 0.5, bonus = 25m
 * - 10 players chose this, 10 total: aloneRatio = 0.0, bonus = 0m
 *
 * @param playersOnMyLadder - Number of players who chose the same answer
 * @param totalAnswered - Total number of players who answered
 * @returns Minority bonus in meters (0-50)
 */
export function calculateMinorityBonus(
  playersOnMyLadder: number,
  totalAnswered: number
): number {
  if (totalAnswered === 0) return 0;
  const aloneRatio = 1 - playersOnMyLadder / totalAnswered;
  const minorityBonus = aloneRatio * 50;
  return Math.round(minorityBonus);
}

/**
 * Calculate total elevation gain combining base score and minority bonus.
 *
 * @param answerTimeMs - Time to answer in milliseconds
 * @param playersOnMyLadder - Number of players who chose the same answer
 * @param totalAnswered - Total number of players who answered
 * @returns Object with baseScore, minorityBonus, and total elevation gain
 */
export function calculateElevationGain(
  answerTimeMs: number,
  playersOnMyLadder: number,
  totalAnswered: number
): {
  baseScore: number;
  minorityBonus: number;
  total: number;
} {
  const baseScore = calculateBaseScore(answerTimeMs);
  const minorityBonus = calculateMinorityBonus(playersOnMyLadder, totalAnswered);
  return {
    baseScore,
    minorityBonus,
    total: baseScore + minorityBonus,
  };
}

/**
 * Calculate new elevation after gaining, capped at summit.
 */
export function applyElevationGain(currentElevation: number, gain: number): number {
  return Math.min(SUMMIT, currentElevation + gain);
}

/**
 * Check if player has reached the summit.
 */
export function hasReachedSummit(elevation: number): boolean {
  return elevation >= SUMMIT;
}
