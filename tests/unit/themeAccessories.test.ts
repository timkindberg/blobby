import { describe, expect, test } from "vitest";
import { generateBlob, generateThemeAccessories } from "../../src/lib/blobGenerator";
import { THEMES } from "../../src/theme/registry";
import type { ThemeAccessorySpec } from "../../src/theme/types";

const babyShower = THEMES.baby_shower;
const classic = THEMES.classic;

const NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry",
  "Ivy", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Pete",
];

function accessoriesFor(name: string): ThemeAccessorySpec[] {
  return generateThemeAccessories(
    name,
    babyShower.id,
    babyShower.blobAccessories,
    generateBlob(name).accessory
  );
}

describe("generateThemeAccessories", () => {
  test("is deterministic for the same name", () => {
    const first = accessoriesFor("Alice");
    const second = accessoriesFor("Alice");

    expect(first).toEqual(second);
  });

  test("normalizes case and whitespace like the base blob does", () => {
    expect(accessoriesFor("Charlie")).toEqual(accessoriesFor("  charlie  "));
  });

  test("gives every blob at least one accessory when the theme asks for one", () => {
    for (const name of NAMES) {
      expect(accessoriesFor(name).length).toBeGreaterThanOrEqual(1);
    }
  });

  test("never exceeds the theme's max count, plus its always-on items", () => {
    const ceiling =
      babyShower.blobAccessories.maxCount +
      (babyShower.blobAccessories.always?.length ?? 0);

    for (const name of NAMES) {
      expect(accessoriesFor(name).length).toBeLessThanOrEqual(ceiling);
    }
  });

  test("gives every blob the theme's always-on items", () => {
    for (const name of NAMES) {
      const ids = accessoriesFor(name).map((a) => a.id);
      for (const item of babyShower.blobAccessories.always ?? []) {
        expect(ids).toContain(item.id);
      }
    }
  });

  test("never puts two accessories in the same slot", () => {
    for (const name of NAMES) {
      const accessories = accessoriesFor(name);
      const slots = accessories.map((a) => a.slot);
      expect(new Set(slots).size).toBe(slots.length);
    }
  });

  test("renders back-to-front: body, hands, face, then head", () => {
    const order = [
      "bottom",
      "chest",
      "hand-left",
      "hand-right",
      "cheeks",
      "mouth",
      "head",
    ];

    for (const name of NAMES) {
      const indices = accessoriesFor(name).map((a) => order.indexOf(a.slot));
      const sorted = [...indices].sort((a, b) => a - b);
      expect(indices).toEqual(sorted);
    }
  });

  test("produces variety across players", () => {
    const combos = new Set(
      NAMES.map((name) => accessoriesFor(name).map((a) => a.id).join(","))
    );

    // 16 names should not all land on the same accessory set
    expect(combos.size).toBeGreaterThan(3);
  });

  test("skips accessories that collide with the base blob accessory", () => {
    // A bowtie already occupies the chest, so the bib must never be chosen.
    const withBowtie = generateThemeAccessories(
      "Anyone",
      babyShower.id,
      babyShower.blobAccessories,
      "bowtie"
    );

    expect(withBowtie.some((a) => a.id === "bib")).toBe(false);
  });

  test("returns nothing for a theme with no accessory pool", () => {
    for (const name of NAMES) {
      const accessories = generateThemeAccessories(
        name,
        classic.id,
        classic.blobAccessories,
        generateBlob(name).accessory
      );
      expect(accessories).toEqual([]);
    }
  });

  test("uses a separate seed stream per theme", () => {
    // Same pool, different theme id => different (but stable) picks for someone
    const asBabyShower = NAMES.map((n) =>
      generateThemeAccessories(n, "baby_shower", babyShower.blobAccessories, "none")
        .map((a) => a.id)
        .join(",")
    );
    const asClassicId = NAMES.map((n) =>
      generateThemeAccessories(n, "classic", babyShower.blobAccessories, "none")
        .map((a) => a.id)
        .join(",")
    );

    expect(asBabyShower).not.toEqual(asClassicId);
  });
});

describe("theme registry", () => {
  test("no theme lists the same accessory twice", () => {
    for (const theme of Object.values(THEMES)) {
      const ids = [
        ...(theme.blobAccessories.always ?? []),
        ...theme.blobAccessories.pool,
      ].map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test("always-on items never compete for the same slot", () => {
    for (const theme of Object.values(THEMES)) {
      const slots = (theme.blobAccessories.always ?? []).map((a) => a.slot);
      expect(new Set(slots).size).toBe(slots.length);
    }
  });

  test("a slot with several candidates actually varies between players", () => {
    // The pool offers a rattle or a teddy in the left hand; across a roster
    // both should show up, otherwise the alternates are dead weight.
    const heldLeft = new Set(
      NAMES.map(
        (name) => accessoriesFor(name).find((a) => a.slot === "hand-left")?.id
      ).filter(Boolean)
    );

    expect(heldLeft.size).toBeGreaterThan(1);
  });

  test("themes never change the base blob", () => {
    // The base generator takes no theme, so enabling one can't shift a blob's
    // body, eyes, hair or accessory. Guard the contract explicitly.
    const before = generateBlob("Alice");
    accessoriesFor("Alice");
    const after = generateBlob("Alice");

    expect(after).toEqual(before);
  });
});
