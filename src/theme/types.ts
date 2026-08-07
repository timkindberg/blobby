import type { ThemeId } from "../../lib/themes";
import type { Accessory } from "../lib/blobGenerator";
import type { SoundPack } from "../lib/soundManager";

/**
 * The shape of a theme.
 *
 * A theme is pure data: a palette plus a pool of decorative blob accessories.
 * Nothing here is allowed to remove or move gameplay visuals — checkpoints,
 * ropes, blobs and elevation labels always render, a theme only recolors them.
 * That constraint is what keeps "add a theme" a one-file change.
 */

// Fixed-length color tuples so a new theme can't silently under-supply a gradient.
type Colors2 = [string, string];
type Colors3 = [string, string, string];
type Colors4 = [string, string, string, string];
type Colors5 = [string, string, string, string, string];
type Colors6 = [string, string, string, string, string, string];

/**
 * Where a themed accessory attaches to a blob. At most one accessory per slot,
 * so two picks never fight over the same pixels.
 */
export type ThemeAccessorySlot =
  | "bottom"
  | "feet"
  | "chest"
  | "hand-left"
  | "hand-right"
  | "cheeks"
  | "mouth"
  | "head";

/** Every themed accessory across all themes. */
export type ThemeAccessoryId =
  | "diaper"
  | "bib"
  | "rattle"
  | "bottle"
  | "binky"
  | "bonnet"
  | "teddy"
  | "booties"
  | "blocks"
  | "cheeks";

export interface ThemeAccessorySpec {
  id: ThemeAccessoryId;
  slot: ThemeAccessorySlot;
  /** Base (non-themed) accessories this would visually collide with. */
  conflictsWith?: Accessory[];
}

export interface ThemeBlobAccessories {
  /**
   * Worn by every blob in the theme (subject to `conflictsWith`), before the
   * random picks. For the signature detail a theme wants on all of them.
   */
  always?: ThemeAccessorySpec[];
  /** Candidates. Picks are deterministic per player name. */
  pool: ThemeAccessorySpec[];
  /**
   * Minimum / maximum *randomly picked* accessories per blob, counted in
   * distinct slots and clamped to what the pool can fill. `always` items are
   * on top of these.
   */
  minCount: number;
  maxCount: number;
}

export interface MountainPalette {
  /** Rock face gradient, summit → base (6 stops). */
  rock: Colors6;
  /** Secondary rock layer used for depth (3 stops). */
  rockLayer: Colors3;
  /** Exposed-face highlight gradient (2 stops). */
  rockHighlight: Colors2;
  /** Directional shadow gradient, left → right (4 rgba stops). */
  rockShadow: Colors4;
  /** Surface detail strokes drawn over the rock face. */
  detail: {
    /** Drop shadow under cracks and ledges. */
    shadow: string;
    /** Crack / fissure stroke. */
    crack: string;
    /** Top edge of a ledge hint. */
    ledgeHighlight: string;
    /** Vertical depth streaks. */
    streak: string;
  };
  /**
   * Repeating surface texture. `grain` = fine noise specks, `dots` = polka
   * dots, `hearts` = scattered nursery hearts.
   */
  texture: {
    kind: "grain" | "dots" | "hearts";
    colors: Colors5;
    /** Opacity of the texture overlay across the whole rock face. */
    opacity: number;
  };
  /** Sky gradient above the summit (3 stops). */
  sky: Colors3;
  sun: {
    rays: string;
    core: string;
    /** Radial glow (4 stops, outermost fades out). */
    glow: Colors4;
  };
  /** Summit snow cap gradient (4 stops). */
  snow: Colors4;
  /** Bright highlight streak on the snow cap. */
  snowHighlight: string;
  /** Distant mountain silhouettes: [far, near]. */
  distantMountains: Colors2;
  cloud: { body: string; shadow: string };
  /** Elevation checkpoint lines and labels. Always rendered — recolor only. */
  checkpoint: {
    line: string;
    lineSummit: string;
    label: string;
    labelSummit: string;
    /** Halo drawn behind labels so they stay readable on the rock face. */
    labelShadow: string;
  };
  /**
   * Rope ladders players climb. Only the neutral (pre-reveal) state is themed;
   * correct green and wrong grey stay semantic in every theme.
   */
  rope: { rail: string; rung: string };
  flag: { fabric: string; highlight: string; pole: string; finial: string };
  /** Question panel floating in the sky (spectator mode). */
  skyPanel: { background: string; border: string; title: string; text: string };
}

export interface Theme {
  id: ThemeId;
  /** Shown in the host's theme picker. */
  label: string;
  emoji: string;
  description: string;
  /** How the game sounds. Defaults to the standard pack. */
  soundPack?: SoundPack;
  blobAccessories: ThemeBlobAccessories;
  mountain: MountainPalette;
}
