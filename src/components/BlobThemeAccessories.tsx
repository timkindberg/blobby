import type { BlobShape } from "../lib/blobGenerator";
import type { ThemeAccessoryId, ThemeAccessorySpec } from "../theme/types";
import {
  getBodyBottomY,
  getBodyEdges,
  getBodyPath,
  getShapeDimensions,
  getTopY,
  type EyePositions,
} from "./blobGeometry";

/**
 * Themed blob accessories (currently the Baby Shower set).
 *
 * Two positioning strategies, depending on how the item is worn:
 *
 *  - WORN items (diaper, bib) are drawn deliberately oversized and clipped to
 *    the body path. The silhouette does the fitting, so they hug all eight
 *    body shapes without eight sets of hand-tuned coordinates.
 *  - HELD / FACE items (bottle, rattle, binky) are placed from the body edges
 *    and eye line, and scale down on narrow bodies so they never overhang.
 *
 * Everything is drawn in the blob's 0-100 viewBox, so it scales with `size`:
 * the same paths serve the 32px mountain blobs and the 120px lobby blob.
 */

interface BlobThemeAccessoriesProps {
  accessories: ThemeAccessorySpec[];
  bodyShape: BlobShape;
  eyes: EyePositions;
  /** Clip path matching the body silhouette, for worn items. */
  clipId: string;
}

export function BlobThemeAccessories({
  accessories,
  bodyShape,
  eyes,
  clipId,
}: BlobThemeAccessoriesProps) {
  if (accessories.length === 0) return null;

  return (
    <>
      {accessories.map((accessory) => (
        <ThemeAccessoryPart
          key={accessory.id}
          id={accessory.id}
          bodyShape={bodyShape}
          eyes={eyes}
          clipId={clipId}
        />
      ))}
    </>
  );
}

interface PartProps {
  bodyShape: BlobShape;
  eyes: EyePositions;
  clipId: string;
}

function ThemeAccessoryPart({ id, ...props }: PartProps & { id: ThemeAccessoryId }) {
  switch (id) {
    case "diaper": return <Diaper {...props} />;
    case "bib": return <Bib {...props} />;
    case "rattle": return <Rattle {...props} />;
    case "bottle": return <Bottle {...props} />;
    case "binky": return <Binky {...props} />;
    default: return null;
  }
}

// Shared nursery palette for the themed parts.
const CLOTH = "#FFFFFF";
const CLOTH_SHADE = "#F3ECF9";
const CLOTH_EDGE = "#DCCBEC";
const PINK = "#FFC6DD";
const PINK_EDGE = "#EE85B2";
const BLUE = "#8FC3EE";
const CREAM = "#FFE2A8";
const CREAM_EDGE = "#E9C077";

/** Lowest eye baseline — bean blobs have slightly uneven eyes. */
function mouthLine(eyes: EyePositions): number {
  return Math.max(eyes.left[1], eyes.right[1]);
}

/** Half-width of the body at a given height. */
function halfWidthAt(bodyShape: BlobShape, y: number): number {
  const edges = getBodyEdges(bodyShape, y);
  return (edges.right - edges.left) / 2;
}

/**
 * Diaper — the bottom of the body, filled. Clipped to the silhouette, so the
 * nappy's outline IS the blob's outline: a perfect fit on every shape.
 */
function Diaper({ bodyShape, clipId }: PartProps) {
  const topY = getTopY(bodyShape);
  const bottomY = getBodyBottomY(bodyShape);
  const waistY = bottomY - Math.max(16, (bottomY - topY) * 0.27);
  const edges = getBodyEdges(bodyShape, waistY);
  const nappyClipId = `${clipId}-nappy`;

  // Overdrawn well past the body on all sides; the clip trims it to shape.
  const bandTop = `M -10 ${waistY + 3} Q 50 ${waistY - 4} 110 ${waistY + 3}`;

  return (
    <>
      <defs>
        {/* Restricts the silhouette outline below to the nappy area only */}
        <clipPath id={nappyClipId}>
          <rect x={-10} y={waistY + 2} width={120} height={bottomY - waistY + 14} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Nappy */}
        <path d={`${bandTop} L 110 ${bottomY + 15} L -10 ${bottomY + 15} Z`} fill={CLOTH} />
        {/* Soft shading along the hem so the white isn't a flat block */}
        <ellipse
          cx="50"
          cy={bottomY + 6}
          rx="46"
          ry={(bottomY - waistY) * 0.5}
          fill={CLOTH_SHADE}
          opacity="0.75"
        />
        {/* Waistband - tinted so the diaper still reads at 32px on the mountain */}
        <path
          d={`${bandTop} L 110 ${waistY + 10} Q 50 ${waistY + 3} -10 ${waistY + 10} Z`}
          fill={PINK}
        />
        {/* Tape tabs */}
        <circle cx={edges.left + 6} cy={waistY + 5.5} r="2" fill={BLUE} />
        <circle cx={edges.right - 6} cy={waistY + 5.5} r="2" fill={CLOTH} />
      </g>

      {/* Keep the blob's edge visible — a white nappy on a white background
          would otherwise look like the bottom of the blob was erased. */}
      <path
        d={getBodyPath(bodyShape)}
        fill="none"
        stroke={CLOTH_EDGE}
        strokeWidth="1.6"
        clipPath={`url(#${nappyClipId})`}
      />
    </>
  );
}

/**
 * Bib — hangs from a scooped neckline under the face. Clipped to the body so
 * it can never spill past the silhouette on narrow shapes.
 */
function Bib({ bodyShape, eyes, clipId }: PartProps) {
  const { centerX } = getShapeDimensions(bodyShape);
  const topY = getTopY(bodyShape);
  const bottomY = getBodyBottomY(bodyShape);
  const neckY = mouthLine(eyes) + 12;

  // Width follows the body; depth stops above where a diaper's waistband sits.
  const w = Math.min(halfWidthAt(bodyShape, neckY + 10) * 0.82, 20);
  const neckW = w * 0.46;
  const maxDepth = bottomY - Math.max(16, (bottomY - topY) * 0.27) - neckY + 7;
  const depth = Math.max(16, Math.min(w * 1.9, maxDepth));

  const heartY = neckY + depth * 0.62;
  const s = w * 0.28;

  return (
    <g clipPath={`url(#${clipId})`}>
      {/* Neck tie - bows UP, like a strap passing behind the neck. Bowing the
          other way just reads as a big smile above a chin. */}
      <path
        d={`M ${centerX - w * 0.95} ${neckY + 1} Q ${centerX} ${neckY - 6} ${centerX + w * 0.95} ${neckY + 1}`}
        fill="none"
        stroke={PINK_EDGE}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d={`M ${centerX - neckW} ${neckY}
            C ${centerX - w} ${neckY + depth * 0.3} ${centerX - w} ${neckY + depth * 0.78} ${centerX} ${neckY + depth}
            C ${centerX + w} ${neckY + depth * 0.78} ${centerX + w} ${neckY + depth * 0.3} ${centerX + neckW} ${neckY}
            Q ${centerX} ${neckY + 4} ${centerX - neckW} ${neckY}
            Z`}
        fill="#FFF2F8"
        stroke={PINK_EDGE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Heart motif */}
      <path
        d={`M${centerX} ${heartY + s * 0.3}
            C${centerX - s} ${heartY - s * 0.7} ${centerX - s * 1.4} ${heartY + s * 0.2} ${centerX} ${heartY + s * 1.1}
            C${centerX + s * 1.4} ${heartY + s * 0.2} ${centerX + s} ${heartY - s * 0.7} ${centerX} ${heartY + s * 0.3}`}
        fill={PINK_EDGE}
      />
    </g>
  );
}

/** Binky — pacifier shield over the mouth, ring hanging below. */
function Binky({ bodyShape, eyes }: PartProps) {
  const { centerX } = getShapeDimensions(bodyShape);
  const eyeY = mouthLine(eyes);

  // Shrink on narrow bodies (droplet, tall) so the shield stays on the face.
  const rx = Math.min(9, halfWidthAt(bodyShape, eyeY + 13) * 0.55);
  const ry = rx * 0.7;
  const scale = rx / 9;

  // Lift it if the ring would dangle off a short body (wide, ghost).
  const ringR = 5.4 * scale;
  const ringCy = ry + 4.5 * scale + ringR;
  const y = Math.min(eyeY + 12, getBodyBottomY(bodyShape) - 3 - ringCy - ringR);

  return (
    <g>
      {/* Ring below the shield - the strongest "this is a pacifier" cue */}
      <circle
        cx={centerX}
        cy={y + ringCy}
        r={ringR}
        fill="none"
        stroke={PINK_EDGE}
        strokeWidth={2.2 * scale}
      />
      <rect
        x={centerX - 1.7 * scale}
        y={y + ry - 1}
        width={3.4 * scale}
        height={5 * scale}
        fill={PINK_EDGE}
      />
      {/* Shield */}
      <ellipse cx={centerX} cy={y} rx={rx} ry={ry} fill={PINK} stroke={PINK_EDGE} strokeWidth="1.3" />
      {/* Center button, not a light inner ellipse - that read as a snout */}
      <circle cx={centerX} cy={y} r={rx * 0.3} fill="#FFF6FA" stroke={PINK_EDGE} strokeWidth={0.9 * scale} />
    </g>
  );
}

/**
 * Baby bottle — held at the body's right side, tipped so the teat points UP
 * and AWAY from the blob (holding it, not drinking from it).
 */
function Bottle({ bodyShape, eyes }: PartProps) {
  const y = mouthLine(eyes) + 16;
  const edges = getBodyEdges(bodyShape, y);
  const x = Math.min(edges.right - 3, 80);

  return (
    <g transform={`translate(${x}, ${y}) rotate(26) scale(1.4)`}>
      {/* Teat + collar (top, angled away from the body) */}
      <ellipse cx="0" cy="-11" rx="2.6" ry="3.4" fill="#F7CDA8" stroke="#DFA97F" strokeWidth="0.5" />
      <rect x="-3.6" y="-8.5" width="7.2" height="3.2" rx="1.2" fill={PINK} stroke={PINK_EDGE} strokeWidth="0.6" />
      {/* Bottle body */}
      <rect x="-5" y="-5.5" width="10" height="16" rx="3.5" fill="#EAF4FF" stroke="#7FAFD9" strokeWidth="1" />
      {/* Milk */}
      <rect x="-3.6" y="0.5" width="7.2" height="9" rx="2.6" fill="#FFFBF0" />
      {/* Measurement marks */}
      <line x1="1.8" y1="-2.5" x2="3.8" y2="-2.5" stroke="#7FAFD9" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="1.8" y1="0.5" x2="3.8" y2="0.5" stroke="#7FAFD9" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  );
}

/** Rattle — held at the body's left side, ball up and away. */
function Rattle({ bodyShape, eyes }: PartProps) {
  const y = mouthLine(eyes) + 19;
  const edges = getBodyEdges(bodyShape, y);
  const x = Math.max(edges.left + 3, 14);

  return (
    <g transform={`translate(${x}, ${y}) rotate(-24) scale(1.3)`}>
      {/* Handle */}
      <rect x="-1.7" y="-2" width="3.4" height="12" rx="1.7" fill={CREAM} stroke={CREAM_EDGE} strokeWidth="0.8" />
      <circle cx="0" cy="10.5" r="2.4" fill={CREAM} stroke={CREAM_EDGE} strokeWidth="0.8" />
      {/* Ball */}
      <circle cx="0" cy="-6" r="6" fill={PINK} stroke={PINK_EDGE} strokeWidth="1" />
      <circle cx="-2" cy="-8" r="1.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="2.2" cy="-4.5" r="1" fill="#FFFFFF" opacity="0.6" />
    </g>
  );
}
