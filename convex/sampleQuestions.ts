// Re-exports and helper functions for sample questions in Convex
// The actual question bank is in lib/sampleQuestions.ts

import {
  sampleQuestions,
  type SampleQuestion,
  type QuestionCategory,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
} from "../lib/sampleQuestions";

// Re-export types and constants for use in Convex functions
export type { SampleQuestion, QuestionCategory };
export { CATEGORY_LABELS, ALL_CATEGORIES };

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Get a random selection of questions from the bank
 * @param count Number of questions to select (default 10)
 * @param categories Optional array of categories to filter by. If empty or undefined, all categories are used.
 */
export function getRandomQuestions(
  count: number = 10,
  categories?: QuestionCategory[]
): SampleQuestion[] {
  // Filter questions by category if specified
  const filteredQuestions =
    categories && categories.length > 0
      ? sampleQuestions.filter((q) => categories.includes(q.category))
      : sampleQuestions;

  // Shuffle and take the requested count
  const shuffled = shuffleArray(filteredQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get questions grouped by category
 * Useful for displaying category-based selection UI
 */
export function getQuestionsByCategory(): Record<QuestionCategory, SampleQuestion[]> {
  const grouped = {} as Record<QuestionCategory, SampleQuestion[]>;

  for (const category of ALL_CATEGORIES) {
    grouped[category] = sampleQuestions.filter((q) => q.category === category);
  }

  return grouped;
}

/**
 * Get count of questions per category
 */
export function getQuestionCountByCategory(): Record<QuestionCategory, number> {
  const counts = {} as Record<QuestionCategory, number>;

  for (const category of ALL_CATEGORIES) {
    counts[category] = sampleQuestions.filter((q) => q.category === category).length;
  }

  return counts;
}

/**
 * Get total question count
 */
export function getTotalQuestionCount(): number {
  return sampleQuestions.length;
}
