import type { BlobShape } from "../lib/blobGenerator";

/**
 * Blob body geometry.
 *
 * Pure lookups describing where things are on each body shape inside the
 * 100x100 viewBox. Shared by Blob.tsx (base parts) and BlobThemeAccessories.tsx
 * (themed parts) so a diaper and a bowtie agree on where the body actually is.
 */

export interface EyePositions {
  left: [number, number];
  right: [number, number];
}

export function getBodyPath(shape: BlobShape): string {
  switch (shape) {
    case "round":
      return "M50 15 C80 15 90 40 90 55 C90 75 75 88 50 88 C25 88 10 75 10 55 C10 40 20 15 50 15";
    case "tall":
      return "M50 8 C70 8 78 25 78 45 C78 70 68 92 50 92 C32 92 22 70 22 45 C22 25 30 8 50 8";
    case "wide":
      return "M50 25 C85 25 95 45 95 58 C95 75 80 85 50 85 C20 85 5 75 5 58 C5 45 15 25 50 25";
    case "bean":
      return "M45 12 C70 12 85 30 82 55 C80 75 65 90 45 88 C25 86 12 70 15 50 C18 30 25 12 45 12";
    case "pear":
      return "M50 10 C65 10 72 20 72 35 C72 50 80 70 80 78 C80 90 65 92 50 92 C35 92 20 90 20 78 C20 70 28 50 28 35 C28 20 35 10 50 10";
    case "square":
      return "M25 20 C25 15 75 15 75 20 L78 75 C78 88 22 88 22 75 L25 20";
    case "ghost":
      return "M50 10 C75 10 85 30 85 50 L85 80 L75 75 L65 85 L55 75 L45 85 L35 75 L25 85 L15 75 L15 50 C15 30 25 10 50 10";
    case "droplet":
      return "M50 8 C55 8 60 15 65 30 C75 55 80 75 70 85 C60 92 40 92 30 85 C20 75 25 55 35 30 C40 15 45 8 50 8";
    default:
      return "M50 15 C80 15 90 40 90 55 C90 75 75 88 50 88 C25 88 10 75 10 55 C10 40 20 15 50 15";
  }
}

export function getEyePositions(shape: BlobShape): EyePositions {
  switch (shape) {
    case "round": return { left: [35, 45], right: [65, 45] };
    case "tall": return { left: [38, 38], right: [62, 38] };
    case "wide": return { left: [32, 50], right: [68, 50] };
    case "bean": return { left: [32, 42], right: [58, 40] };
    case "pear": return { left: [38, 32], right: [62, 32] };
    case "square": return { left: [35, 42], right: [65, 42] };
    case "ghost": return { left: [35, 38], right: [65, 38] };
    case "droplet": return { left: [40, 45], right: [60, 45] };
    default: return { left: [35, 45], right: [65, 45] };
  }
}

/** Y coordinate of the top of the body (where hats, hair and crowns sit). */
export function getTopY(shape: BlobShape): number {
  switch (shape) {
    case "tall": return 8;
    case "wide": return 25;
    case "pear": return 10;
    case "droplet": return 8;
    case "ghost": return 10;
    default: return 15;
  }
}

/** Y coordinate where the body meets the ground (where a diaper sits). */
export function getBodyBottomY(shape: BlobShape): number {
  switch (shape) {
    case "tall": return 92;
    case "wide": return 85;
    case "pear": return 91;
    case "droplet": return 90;
    case "ghost": return 82; // wavy hem — stay above the deepest scallop
    case "square": return 86;
    case "bean": return 88;
    default: return 88;
  }
}

/** Shape-specific sizing multipliers for accessories. */
export function getShapeDimensions(shape: BlobShape): { width: number; headWidth: number; centerX: number } {
  switch (shape) {
    case "tall": return { width: 0.7, headWidth: 24, centerX: 50 };
    case "wide": return { width: 1.2, headWidth: 40, centerX: 50 };
    case "pear": return { width: 0.65, headWidth: 22, centerX: 50 };
    case "droplet": return { width: 0.6, headWidth: 20, centerX: 50 };
    case "ghost": return { width: 0.9, headWidth: 32, centerX: 50 };
    case "bean": return { width: 0.85, headWidth: 30, centerX: 45 };
    case "square": return { width: 0.85, headWidth: 30, centerX: 50 };
    case "round": return { width: 1.0, headWidth: 35, centerX: 50 };
    default: return { width: 1.0, headWidth: 35, centerX: 50 };
  }
}

/**
 * Actual body edge positions at a given Y coordinate, used by accessories that
 * wrap around the body (headphones, bandanas) or are held at its side.
 */
export function getBodyEdges(shape: BlobShape, y: number): { left: number; right: number } {
  switch (shape) {
    case "wide": {
      // Body goes from x=5 to x=95, widest in the middle (y~58)
      // At top (y=25) it's narrower, at y=50 it's widest
      const t = Math.max(0, Math.min(1, (y - 25) / 35)); // 0 at y=25, 1 at y=60
      const halfWidth = 30 + t * 15; // 30 at top, up to 45 at widest
      return { left: 50 - halfWidth, right: 50 + halfWidth };
    }
    case "ghost": {
      // Body from x=15 to x=85
      const t = Math.max(0, Math.min(1, (y - 10) / 40)); // 0 at top, 1 at y=50
      const halfWidth = 20 + t * 15; // starts narrow, gets wider
      return { left: 50 - halfWidth, right: 50 + halfWidth };
    }
    case "round": {
      // Body from x=10 to x=90
      const halfWidth = 35;
      return { left: 50 - halfWidth, right: 50 + halfWidth };
    }
    case "tall": {
      // Body from x=22 to x=78
      const halfWidth = 26;
      return { left: 50 - halfWidth, right: 50 + halfWidth };
    }
    case "bean": {
      // Asymmetric - centered around x=45
      return { left: 18, right: 78 };
    }
    case "pear": {
      // Narrow at top, wide at bottom
      const t = Math.max(0, Math.min(1, (y - 10) / 60));
      const halfWidth = 20 + t * 10;
      return { left: 50 - halfWidth, right: 50 + halfWidth };
    }
    case "square": {
      // Body from x=22 to x=78
      return { left: 24, right: 76 };
    }
    case "droplet": {
      // Narrow at top, wider at bottom
      const t = Math.max(0, Math.min(1, (y - 8) / 60));
      const halfWidth = 12 + t * 18;
      return { left: 50 - halfWidth, right: 50 + halfWidth };
    }
    default:
      return { left: 20, right: 80 };
  }
}
