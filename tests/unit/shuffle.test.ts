import { describe, test, expect } from "vitest";
import { hashString, shuffleWithSeed, shuffleOptions } from "../../lib/shuffle";

describe("hashString", () => {
  test("produces consistent hashes", () => {
    expect(hashString("ABCD-0")).toBe(hashString("ABCD-0"));
    expect(hashString("ABCD-1")).toBe(hashString("ABCD-1"));
  });

  test("produces different hashes for different inputs", () => {
    expect(hashString("ABCD-0")).not.toBe(hashString("ABCD-1"));
    expect(hashString("ABCD-0")).not.toBe(hashString("EFGH-0"));
  });
});

describe("shuffleWithSeed", () => {
  test("produces same shuffle for same seed", () => {
    const items = ["A", "B", "C", "D"];
    const seed = 12345;

    const shuffle1 = shuffleWithSeed(items, seed);
    const shuffle2 = shuffleWithSeed(items, seed);

    expect(shuffle1).toEqual(shuffle2);
  });

  test("produces different shuffles for different seeds", () => {
    const items = ["A", "B", "C", "D"];

    const shuffle1 = shuffleWithSeed(items, 12345);
    const shuffle2 = shuffleWithSeed(items, 67890);

    // Very unlikely to be the same
    expect(shuffle1).not.toEqual(shuffle2);
  });

  test("does not modify original array", () => {
    const items = ["A", "B", "C", "D"];
    const original = [...items];

    shuffleWithSeed(items, 12345);

    expect(items).toEqual(original);
  });

  test("contains all original elements", () => {
    const items = ["A", "B", "C", "D"];
    const shuffled = shuffleWithSeed(items, 12345);

    expect(shuffled.sort()).toEqual([...items].sort());
  });
});

describe("shuffleOptions", () => {
  const options = [
    { text: "Option A" },
    { text: "Option B" },
    { text: "Option C" },
    { text: "Option D" },
  ];

  test("produces consistent shuffle for same session and question", () => {
    const result1 = shuffleOptions(options, "ABCD", 0);
    const result2 = shuffleOptions(options, "ABCD", 0);

    const texts1 = result1.shuffledOptions.map((o) => o.option.text);
    const texts2 = result2.shuffledOptions.map((o) => o.option.text);

    expect(texts1).toEqual(texts2);
  });

  test("produces different shuffle for different questions", () => {
    const result1 = shuffleOptions(options, "ABCD", 0);
    const result2 = shuffleOptions(options, "ABCD", 1);

    const texts1 = result1.shuffledOptions.map((o) => o.option.text);
    const texts2 = result2.shuffledOptions.map((o) => o.option.text);

    // Very unlikely to be the same order
    expect(texts1).not.toEqual(texts2);
  });

  test("produces different shuffle for different sessions", () => {
    const result1 = shuffleOptions(options, "ABCD", 0);
    const result2 = shuffleOptions(options, "WXYZ", 0);

    const texts1 = result1.shuffledOptions.map((o) => o.option.text);
    const texts2 = result2.shuffledOptions.map((o) => o.option.text);

    // Very unlikely to be the same order
    expect(texts1).not.toEqual(texts2);
  });

  test("getOriginalIndex returns correct mapping", () => {
    const result = shuffleOptions(options, "ABCD", 0);

    // Verify that getting the original index and looking up the option gives us
    // the option at that shuffled position
    result.shuffledOptions.forEach((item, shuffledIdx) => {
      const originalIdx = result.getOriginalIndex(shuffledIdx);
      expect(options[originalIdx]).toEqual(item.option);
    });
  });

  test("getShuffledIndex returns correct mapping", () => {
    const result = shuffleOptions(options, "ABCD", 0);

    // If the correct answer is at original index 2, we should be able to find
    // where it ended up in the shuffled array
    options.forEach((_, originalIdx) => {
      const shuffledIdx = result.getShuffledIndex(originalIdx);
      expect(result.shuffledOptions[shuffledIdx]?.originalIndex).toBe(originalIdx);
    });
  });

  test("shuffledOptions includes all options", () => {
    const result = shuffleOptions(options, "ABCD", 0);

    expect(result.shuffledOptions.length).toBe(options.length);

    const shuffledTexts = result.shuffledOptions.map((o) => o.option.text).sort();
    const originalTexts = options.map((o) => o.text).sort();
    expect(shuffledTexts).toEqual(originalTexts);
  });

  test("round-trip: original -> shuffled -> original", () => {
    const result = shuffleOptions(options, "TEST", 5);

    // For each original index, get the shuffled index, then get the original back
    for (let i = 0; i < options.length; i++) {
      const shuffled = result.getShuffledIndex(i);
      const original = result.getOriginalIndex(shuffled);
      expect(original).toBe(i);
    }
  });
});
