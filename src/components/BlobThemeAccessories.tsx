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
 * Themed blob accessories (currently the Baby set).
 *
 * Two positioning strategies, depending on how the item is worn:
 *
 *  - WORN items (diaper, bib, bonnet) are drawn deliberately oversized and
 *    clipped to the body path. The silhouette does the fitting, so they hug all
 *    eight body shapes without eight sets of hand-tuned coordinates.
 *  - HELD / FACE items (bottle, rattle, teddy, blocks, binky, cheeks) are
 *    placed from the body edges and eye line, and scale down on narrow bodies
 *    so they never overhang.
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
    case "booties": return <Booties {...props} />;
    case "bib": return <Bib {...props} />;
    case "rattle": return <Rattle {...props} />;
    case "teddy": return <Teddy {...props} />;
    case "bottle": return <Bottle {...props} />;
    case "blocks": return <Blocks {...props} />;
    case "cheeks": return <Cheeks {...props} />;
    case "binky": return <Binky {...props} />;
    case "bonnet": return <Bonnet {...props} />;
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
const BLUE_EDGE = "#5E9BCE";
const CREAM = "#FFE2A8";
const CREAM_EDGE = "#E9C077";
const MINT = "#B7E6D3";
const TEDDY = "#D3A97F";
const TEDDY_EDGE = "#A87C55";

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

/**
 * Rosy cheeks — worn by every baby blob. Two soft blushes just below and
 * outside the eyes, clamped inside the silhouette on narrow bodies.
 */
function Cheeks({ bodyShape, eyes }: PartProps) {
  const { headWidth } = getShapeDimensions(bodyShape);
  const scale = headWidth / 35;
  const rx = 5 * scale;
  const ry = 3.4 * scale;

  const blush = (eye: [number, number], direction: -1 | 1) => {
    const y = eye[1] + 9 * scale;
    const edges = getBodyEdges(bodyShape, y);
    const wanted = eye[0] + direction * 5 * scale;
    // Keep the whole blush inside the body edge at this height.
    const cx = Math.min(edges.right - rx - 1, Math.max(edges.left + rx + 1, wanted));
    return { cx, cy: y };
  };

  const left = blush(eyes.left, -1);
  const right = blush(eyes.right, 1);

  return (
    <g opacity="0.55">
      <ellipse cx={left.cx} cy={left.cy} rx={rx} ry={ry} fill={PINK_EDGE} />
      <ellipse cx={right.cx} cy={right.cy} rx={rx} ry={ry} fill={PINK_EDGE} />
    </g>
  );
}

/**
 * Bonnet — a soft cap over the top of the head. Like the diaper, the crown is
 * overdrawn and clipped to the silhouette; the brim and ties are drawn outside
 * the clip so the hat reads as sitting ON the blob rather than painted into it.
 */
function Bonnet({ bodyShape, eyes, clipId }: PartProps) {
  const { centerX } = getShapeDimensions(bodyShape);
  const topY = getTopY(bodyShape);
  const bottomY = getBodyBottomY(bodyShape);
  // Depth is capped by the EYE line, not just the body height: on a short,
  // wide blob the eyes sit low in a small body, and a height-derived brim
  // lands right across the face. The clearance covers the brim's dip (5) and
  // the scalloped hem (3.4) plus the top of the eye itself.
  const eyeTop = Math.min(eyes.left[1], eyes.right[1]);
  const brimY = Math.max(
    topY + 6,
    Math.min(topY + Math.min(16, (bottomY - topY) * 0.28), eyeTop - 14)
  );
  const edges = getBodyEdges(bodyShape, brimY);

  return (
    <>
      {/* Crown, trimmed to the silhouette */}
      <g clipPath={`url(#${clipId})`}>
        <rect x={-10} y={topY - 25} width={120} height={brimY - topY + 25} fill={CLOTH} />
        {/* Shading so the white cap has some form */}
        <ellipse cx={centerX} cy={topY - 2} rx={40} ry={12} fill={CLOTH_SHADE} opacity="0.7" />
        {/* Scalloped hem, the giveaway that it's a bonnet and not a beanie */}
        {[-2, -1, 0, 1, 2].map((i) => (
          <circle key={i} cx={centerX + i * 9} cy={brimY - 2} r="3.4" fill={CLOTH} />
        ))}
      </g>

      {/* Brim - a lens poking out past the head on both sides */}
      <path
        d={`M ${edges.left - 2} ${brimY - 1}
            Q ${centerX} ${brimY + 5} ${edges.right + 2} ${brimY - 1}
            Q ${centerX} ${brimY - 5} ${edges.left - 2} ${brimY - 1} Z`}
        fill={PINK}
        stroke={PINK_EDGE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Chin ties */}
      <path
        d={`M ${edges.left + 1} ${brimY + 2} q -3 6 1 10`}
        fill="none"
        stroke={PINK_EDGE}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d={`M ${edges.right - 1} ${brimY + 2} q 3 6 -1 10`}
        fill="none"
        stroke={PINK_EDGE}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Pom on top */}
      <circle cx={centerX} cy={topY - 1} r="3.6" fill={PINK} stroke={PINK_EDGE} strokeWidth="1" />
    </>
  );
}

/**
 * Booties — a pair of little shoes poking out under the blob. Centred as a
 * pair rather than pinned to the body edges: on a wide body, edge-anchored
 * feet end up a body-width apart and read as two stray objects.
 */
function Booties({ bodyShape }: PartProps) {
  const { centerX } = getShapeDimensions(bodyShape);
  const bottomY = getBodyBottomY(bodyShape);
  const edges = getBodyEdges(bodyShape, bottomY - 3);
  // Small enough that both shoes always sit within the silhouette.
  const w = Math.min(13, (edges.right - edges.left) * 0.34);
  const h = w * 0.52;
  const y = bottomY - h * 0.35;

  const bootie = (dir: -1 | 1, key: string) => {
    const cx = centerX + dir * w * 0.56;
    return (
      <g key={key}>
        {/* Shoe: flat heel, rounded toe pointing outward */}
        <path
          d={`M ${cx - dir * w * 0.42} ${y - h * 0.5}
              L ${cx + dir * w * 0.1} ${y - h * 0.5}
              Q ${cx + dir * w * 0.58} ${y - h * 0.5} ${cx + dir * w * 0.58} ${y + h * 0.1}
              Q ${cx + dir * w * 0.58} ${y + h * 0.5} ${cx + dir * w * 0.1} ${y + h * 0.5}
              L ${cx - dir * w * 0.42} ${y + h * 0.5}
              Q ${cx - dir * w * 0.58} ${y} ${cx - dir * w * 0.42} ${y - h * 0.5} Z`}
          fill={MINT}
          stroke="#7FC9AC"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Ankle cuff */}
        <rect
          x={cx - w * 0.3}
          y={y - h * 1.15}
          width={w * 0.6}
          height={h * 0.7}
          rx={h * 0.3}
          fill={CLOTH}
          stroke={CLOTH_EDGE}
          strokeWidth="0.9"
        />
        {/* Pom on the toe */}
        <circle cx={cx + dir * w * 0.32} cy={y - h * 0.28} r={w * 0.13} fill={PINK} />
      </g>
    );
  };

  return (
    <g>
      {bootie(-1, "left")}
      {bootie(1, "right")}
    </g>
  );
}

/** Teddy bear — hugged at the body's left side. */
function Teddy({ bodyShape, eyes }: PartProps) {
  const y = mouthLine(eyes) + 20;
  const edges = getBodyEdges(bodyShape, y);
  const x = Math.max(edges.left + 4, 15);

  return (
    <g transform={`translate(${x}, ${y}) rotate(-14) scale(1.15)`}>
      {/* Body + arms */}
      <ellipse cx="0" cy="4" rx="5.2" ry="5.6" fill={TEDDY} stroke={TEDDY_EDGE} strokeWidth="0.9" />
      <circle cx="-5" cy="3" r="2.2" fill={TEDDY} stroke={TEDDY_EDGE} strokeWidth="0.8" />
      <circle cx="5" cy="3" r="2.2" fill={TEDDY} stroke={TEDDY_EDGE} strokeWidth="0.8" />
      {/* Ears */}
      <circle cx="-4.2" cy="-8.6" r="2.6" fill={TEDDY} stroke={TEDDY_EDGE} strokeWidth="0.8" />
      <circle cx="4.2" cy="-8.6" r="2.6" fill={TEDDY} stroke={TEDDY_EDGE} strokeWidth="0.8" />
      {/* Head */}
      <circle cx="0" cy="-5.5" r="5.4" fill={TEDDY} stroke={TEDDY_EDGE} strokeWidth="0.9" />
      <ellipse cx="0" cy="-3.6" rx="2.6" ry="2" fill="#F6E3CE" />
      <circle cx="0" cy="-4.4" r="0.9" fill={TEDDY_EDGE} />
      <circle cx="-2" cy="-7" r="0.8" fill="#4A3524" />
      <circle cx="2" cy="-7" r="0.8" fill="#4A3524" />
    </g>
  );
}

/** Stacking blocks — held at the body's right side. */
function Blocks({ bodyShape, eyes }: PartProps) {
  const y = mouthLine(eyes) + 16;
  const edges = getBodyEdges(bodyShape, y);
  const x = Math.min(edges.right - 4, 79);

  return (
    <g transform={`translate(${x}, ${y}) rotate(9) scale(1.1)`}>
      {/* Lower block */}
      <rect x="-6" y="0" width="12" height="12" rx="2.4" fill={BLUE} stroke={BLUE_EDGE} strokeWidth="1" />
      <text
        x="0"
        y="9"
        fontSize="8.5"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        B
      </text>
      {/* Upper block, offset like a real stack */}
      <rect x="-4.6" y="-9.6" width="9.6" height="9.6" rx="2" fill={CREAM} stroke={CREAM_EDGE} strokeWidth="1" />
      <text
        x="0.2"
        y="-2.4"
        fontSize="7"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        fill={CREAM_EDGE}
        textAnchor="middle"
      >
        A
      </text>
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
