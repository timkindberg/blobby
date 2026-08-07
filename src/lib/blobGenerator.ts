/**
 * Blob Creature Avatar Generator
 *
 * Generates deterministic blob creature configs from player names.
 * Same name = same blob every time.
 */

import type { ThemeId } from "../../lib/themes";
import type {
  ThemeAccessorySlot,
  ThemeAccessorySpec,
  ThemeBlobAccessories,
} from "../theme/types";

export interface BlobConfig {
  name: string;
  body: {
    shape: BlobShape;
    color: string;
    highlightColor: string;
  };
  eyes: {
    style: EyeStyle;
    color: string;
  };
  features: {
    rosyCheeks: boolean;
    hair: HairStyle;
  };
  accessory: Accessory;
  seed: number;
}

export type BlobShape = "round" | "tall" | "wide" | "bean" | "pear" | "square" | "ghost" | "droplet";
export type EyeStyle = "dots" | "wide" | "sleepy" | "excited" | "angry" | "wink" | "dizzy" | "hearts" | "side-eye" | "sparkle";
export type HairStyle = "none" | "tuft" | "spiky" | "curly" | "swoosh" | "ponytail" | "single-curl";
export type Accessory = "none" | "hat" | "bow" | "glasses" | "bandana" | "monocle" | "bowtie" | "crown" | "headphones" | "flower";

// Color palettes - each blob gets one palette
const PALETTES = [
  { main: "#FF6B6B", highlight: "#FF8E8E" }, // Coral
  { main: "#4ECDC4", highlight: "#7EDDD6" }, // Teal
  { main: "#45B7D1", highlight: "#6FC9DE" }, // Sky
  { main: "#96CEB4", highlight: "#B3DBCA" }, // Sage
  { main: "#FFEAA7", highlight: "#FFF0C4" }, // Butter
  { main: "#DDA0DD", highlight: "#E8BFE8" }, // Plum
  { main: "#98D8C8", highlight: "#B5E4D8" }, // Mint
  { main: "#F7DC6F", highlight: "#F9E79F" }, // Sunshine
  { main: "#BB8FCE", highlight: "#D2B4DE" }, // Lavender
  { main: "#85C1E9", highlight: "#A9D4F0" }, // Periwinkle
  { main: "#F8B500", highlight: "#FACF5A" }, // Mango
  { main: "#FF7675", highlight: "#FF9494" }, // Salmon
  { main: "#74B9FF", highlight: "#93C9FF" }, // Cornflower
  { main: "#A29BFE", highlight: "#B8B3FE" }, // Iris
  { main: "#FD79A8", highlight: "#FD9BBD" }, // Pink
  { main: "#00CEC9", highlight: "#33D9D5" }, // Cyan
  { main: "#E17055", highlight: "#E8907A" }, // Terracotta
  { main: "#00B894", highlight: "#33C9AB" }, // Emerald
  { main: "#FDCB6E", highlight: "#FDD98B" }, // Honey
  { main: "#6C5CE7", highlight: "#8A7EEB" }, // Violet
];

const BODY_SHAPES: BlobShape[] = ["round", "tall", "wide", "bean", "pear", "square", "ghost", "droplet"];
const EYE_STYLES: EyeStyle[] = ["dots", "wide", "sleepy", "excited", "angry", "wink", "dizzy", "hearts", "side-eye", "sparkle"];
const HAIR_STYLES: HairStyle[] = ["none", "none", "none", "tuft", "spiky", "curly", "swoosh", "ponytail", "single-curl"]; // weighted toward none
const ACCESSORIES: Accessory[] = [
  "none", "none", "none", "none", // 40% none
  "hat", "bow", "glasses", "bandana", "monocle", "bowtie", "crown", "headphones", "flower"
];

/**
 * Simple string hash function (djb2 variant)
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Seeded random number generator (Mulberry32)
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick a random item from an array using seeded random
 */
function pick<T>(arr: readonly T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)]!;
}

/**
 * Get a display-safe name: trimmed and truncated with ellipsis if over 10 chars
 */
export function getDisplayName(name: string, maxLength = 10): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 1) + "…";
}

/**
 * Generate a blob config from a player name
 */
export function generateBlob(name: string): BlobConfig {
  const seed = hashString(name.toLowerCase().trim());
  const random = seededRandom(seed);

  const palette = pick(PALETTES, random);
  const bodyShape = pick(BODY_SHAPES, random);
  const eyeStyle = pick(EYE_STYLES, random);
  const hairStyle = pick(HAIR_STYLES, random);
  const accessory = pick(ACCESSORIES, random);

  // Eye color - always dark or contrasting, never matches body
  const eyeColors = ["#2C3E50", "#1A1A2E", "#34495E", "#2D3436", "#5D4E60"];
  const eyeColor = pick(eyeColors, random);

  // Rosy cheeks - 30% chance
  const rosyCheeks = random() < 0.3;

  return {
    name,
    body: {
      shape: bodyShape,
      color: palette.main,
      highlightColor: palette.highlight,
    },
    eyes: {
      style: eyeStyle,
      color: eyeColor,
    },
    features: {
      rosyCheeks,
      hair: hairStyle,
    },
    accessory,
    seed,
  };
}

// Render order for themed accessories: back-to-front on the blob, so a bib
// layers over a diaper and a binky stays on top of everything.
const SLOT_RENDER_ORDER: Record<ThemeAccessorySlot, number> = {
  bottom: 0,
  feet: 1, // over the nappy - shoes are in front of what they poke out of
  chest: 2,
  "hand-left": 3,
  "hand-right": 4,
  cheeks: 5,
  mouth: 6,
  head: 7,
};

/**
 * Pick a blob's themed accessories — deterministic from the player name,
 * exactly like the rest of its look.
 *
 * Seeded from `name + themeId` rather than reusing the base blob's seed, so:
 *  - turning a theme on never changes the base blob (same name = same body,
 *    eyes, hair, accessory as before), and
 *  - two themes give the same player different-but-stable accessories.
 *
 * Picks are one-per-slot, so accessories never stack on the same spot, and
 * anything that would collide with the blob's base accessory is dropped.
 */
export function generateThemeAccessories(
  name: string,
  themeId: ThemeId,
  spec: ThemeBlobAccessories,
  baseAccessory: Accessory
): ThemeAccessorySpec[] {
  const wearable = (item: ThemeAccessorySpec) =>
    !item.conflictsWith?.includes(baseAccessory);

  const bySlot = new Map<ThemeAccessorySlot, ThemeAccessorySpec>();

  // Always-on items claim their slots first — a theme's signature detail
  // shouldn't be at the mercy of the dice.
  for (const item of spec.always ?? []) {
    if (wearable(item) && !bySlot.has(item.slot)) bySlot.set(item.slot, item);
  }

  const available = spec.pool.filter(wearable);
  if (available.length === 0 || spec.maxCount <= 0) {
    return sortBySlot([...bySlot.values()]);
  }

  const random = seededRandom(hashString(`${name.toLowerCase().trim()}::${themeId}`));

  // Shuffle a copy, then walk it — taking the first item for each new slot.
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  // A pool can offer several items per slot (rattle OR teddy in a hand), so
  // the ceiling is the number of distinct fillable slots, not the pool size.
  const fillableSlots = new Set(
    available.map((item) => item.slot).filter((slot) => !bySlot.has(slot))
  ).size;
  const max = Math.min(spec.maxCount, fillableSlots);
  const min = Math.max(0, Math.min(spec.minCount, max));
  const count = min + Math.floor(random() * (max - min + 1));

  const picked = new Set<ThemeAccessorySlot>();
  for (const item of shuffled) {
    if (picked.size >= count) break;
    if (bySlot.has(item.slot)) continue; // taken by `always` or an earlier pick
    bySlot.set(item.slot, item);
    picked.add(item.slot);
  }

  return sortBySlot([...bySlot.values()]);
}

function sortBySlot(accessories: ThemeAccessorySpec[]): ThemeAccessorySpec[] {
  return accessories.sort(
    (a, b) => SLOT_RENDER_ORDER[a.slot] - SLOT_RENDER_ORDER[b.slot]
  );
}
