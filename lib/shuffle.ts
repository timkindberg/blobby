/**
 * Seeded deterministic shuffle utilities.
 *
 * Used to randomize answer order while keeping all views in sync.
 * The same seed always produces the same shuffle order.
 */

/**
 * Simple string hash function (djb2 variant).
 * Converts a string to a numeric hash for use as a shuffle seed.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  // Ensure positive number
  return Math.abs(hash);
}

/**
 * Shuffle an array deterministically using a seed.
 * Uses Fisher-Yates shuffle with a seeded PRNG.
 *
 * @param items - Array of items to shuffle
 * @param seed - Numeric seed for the PRNG
 * @returns A new shuffled array (original is not modified)
 */
export function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  // Simple linear congruential generator (LCG) PRNG
  // Uses the same constants as the task recommendation
  let currentSeed = seed;
  const seededRandom = (): number => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  };

  // Fisher-Yates shuffle
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled;
}

/**
 * Represents a shuffled option with its original and shuffled positions.
 */
export interface ShuffledOption<T> {
  /** The option data */
  option: T;
  /** The original index in the unshuffled array */
  originalIndex: number;
  /** The index in the shuffled array */
  shuffledIndex: number;
}

/**
 * Shuffle options and return both the shuffled array and mapping info.
 *
 * @param options - Array of options to shuffle
 * @param sessionCode - Session code (e.g., "ABCD")
 * @param questionIndex - Zero-based question index
 * @returns Object with shuffled options and utility functions
 */
export function shuffleOptions<T>(
  options: T[],
  sessionCode: string,
  questionIndex: number
): {
  /** Options in shuffled order with mapping info */
  shuffledOptions: ShuffledOption<T>[];
  /** Get the original index from a shuffled index */
  getOriginalIndex: (shuffledIndex: number) => number;
  /** Get the shuffled index of the correct answer given its original index */
  getShuffledIndex: (originalIndex: number) => number;
  /** The seed used for this shuffle (for debugging) */
  seed: number;
} {
  // Create seed from session code + question index
  const seedString = `${sessionCode}-${questionIndex}`;
  const seed = hashString(seedString);

  // Create array of indices [0, 1, 2, ...]
  const indices = options.map((_, i) => i);

  // Shuffle the indices
  const shuffledIndices = shuffleWithSeed(indices, seed);

  // Build the shuffled options with mapping
  const shuffledOptions: ShuffledOption<T>[] = shuffledIndices.map(
    (originalIndex, shuffledIndex) => ({
      option: options[originalIndex]!,
      originalIndex,
      shuffledIndex,
    })
  );

  // Build reverse lookup (original -> shuffled)
  const originalToShuffled = new Map<number, number>();
  shuffledIndices.forEach((originalIndex, shuffledIndex) => {
    originalToShuffled.set(originalIndex, shuffledIndex);
  });

  return {
    shuffledOptions,
    getOriginalIndex: (shuffledIndex: number): number => {
      return shuffledOptions[shuffledIndex]?.originalIndex ?? shuffledIndex;
    },
    getShuffledIndex: (originalIndex: number): number => {
      return originalToShuffled.get(originalIndex) ?? originalIndex;
    },
    seed,
  };
}
