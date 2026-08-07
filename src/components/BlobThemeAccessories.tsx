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
// Bib fabric is buttermilk, not white: the diaper below it is white, and two
// white garments touching read as one shapeless blob.
const BIB_CLOTH = "#FFF3D9";
const TEDDY = "#D3A97F";
const TEDDY_EDGE = "#A87C55";

/** Lowest eye baseline — bean blobs have slightly uneven eyes. */
function mouthLine(eyes: EyePositions): number {
  return Math.max(eyes.left[1], eyes.right[1]);
}

type Point = [number, number];

/** Point at `t` along a quadratic Bézier - used to space scallops on a curve. */
function quadPoint(p0: Point, c: Point, p1: Point, t: number): Point {
  const inv = 1 - t;
  return [
    inv * inv * p0[0] + 2 * inv * t * c[0] + t * t * p1[0],
    inv * inv * p0[1] + 2 * inv * t * c[1] + t * t * p1[1],
  ];
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

  // The bib occupies the band between the mouth and the nappy: it starts below
  // where a binky hangs and its hem meets the diaper's waistband. Anchoring to
  // both is what keeps it off the face on every body shape.
  const waistY = bottomY - Math.max(16, (bottomY - topY) * 0.27);

  // Size the bib against the mouth/waist band first...
  const anchorTop = Math.max(
    mouthLine(eyes) + 12, // floor, for bodies too short to fit the ideal
    Math.min(mouthLine(eyes) + 21, waistY - 14)
  );
  const depth = Math.max(14, waistY + 3 - anchorTop);

  // ...then slide the whole thing down onto the belly, keeping its height.
  // Deriving the hem from the shifted top instead would just squash it.
  const shift = Math.min(10, Math.max(0, bottomY - 2 - (anchorTop + depth)));
  const top = anchorTop + shift;

  // Wide, like a real bib - but not so wide it becomes the whole torso.
  const w = Math.min(halfWidthAt(bodyShape, top + 8) * 0.78, 19);

  const left = centerX - w;
  const right = centerX + w;
  const shoulderR = w * 0.34;

  // Rounded shoulders, a neckline that SCOOPS down between them, round hem.
  // The scoop has to be an open curve rather than a punched hole: a closed
  // circle at the top centre fills with body colour and reads as a snout.
  const outline = `M ${left} ${top + shoulderR}
    Q ${left} ${top} ${left + shoulderR} ${top}
    Q ${centerX} ${top + w * 0.5} ${right - shoulderR} ${top}
    Q ${right} ${top} ${right} ${top + shoulderR}
    L ${right} ${top + depth * 0.42}
    Q ${right} ${top + depth} ${centerX} ${top + depth}
    Q ${left} ${top + depth} ${left} ${top + depth * 0.42}
    Z`;

  const heartY = top + depth * 0.55;
  const s = w * 0.36;

  // Open path for the trim: top edge and sides only, so the scalloped hem
  // below can supply the bottom edge.
  const upperTrim = `M ${left} ${top + depth * 0.42}
    L ${left} ${top + shoulderR}
    Q ${left} ${top} ${left + shoulderR} ${top}
    Q ${centerX} ${top + w * 0.5} ${right - shoulderR} ${top}
    Q ${right} ${top} ${right} ${top + shoulderR}
    L ${right} ${top + depth * 0.42}`;

  // Scallops sampled along the hem curve. Fabric stays near-white for contrast
  // on every blob colour; the scallops and straps are what stop a pale shape
  // under two eyes from reading as an open mouth.
  const hemStart: Point = [right, top + depth * 0.42];
  const hemMid: Point = [centerX, top + depth];
  const hemEnd: Point = [left, top + depth * 0.42];
  const scallops: Point[] = [
    ...[0.35, 0.7, 1].map((t) => quadPoint(hemStart, [right, top + depth], hemMid, t)),
    ...[0.3, 0.65].map((t) => quadPoint(hemMid, [left, top + depth], hemEnd, t)),
  ];
  const scallopR = w * 0.12;

  return (
    <g clipPath={`url(#${clipId})`}>
      {/* Scallops first: the body fill below hides the arcs that fall inside
          the bib, leaving only the bumps along the hem. */}
      {scallops.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={scallopR}
          fill={BIB_CLOTH}
          stroke={PINK_EDGE}
          strokeWidth="1.3"
        />
      ))}
      <path d={outline} fill={BIB_CLOTH} />
      <path
        d={upperTrim}
        fill="none"
        stroke={PINK_EDGE}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Neck strap. Each side runs from the bib's shoulder OUT to the body's
          edge, where the clip cuts it off - so it reads as passing behind the
          neck. Stopping short (as it used to) just looks like two horns. */}
      {[-1, 1].map((dir) => {
        const startX = centerX + dir * (w - shoulderR);
        const endY = top - 7;
        const bodyEdges = getBodyEdges(bodyShape, endY);
        const endX = (dir < 0 ? bodyEdges.left : bodyEdges.right) + dir * 2;
        return (
          <path
            key={dir}
            d={`M ${startX} ${top + 1}
                Q ${startX + (endX - startX) * 0.55} ${top - 6} ${endX} ${endY}`}
            fill="none"
            stroke={PINK_EDGE}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      {/* Heart motif */}
      <path
        d={`M${centerX} ${heartY + s * 0.3}
            C${centerX - s} ${heartY - s * 0.7} ${centerX - s * 1.4} ${heartY + s * 0.2} ${centerX} ${heartY + s * 1.1}
            C${centerX + s * 1.4} ${heartY + s * 0.2} ${centerX + s} ${heartY - s * 0.7} ${centerX} ${heartY + s * 0.3}`}
        fill={PINK}
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

  // The cap's edge is an ARC, not a horizontal line: high across the forehead,
  // dropping past the cheeks at the sides, the way a bonnet frames a face. A
  // straight edge with a lens under it is what made this read as a visor.
  //
  // Both heights are fractions of the FOREHEAD (top of head to top of eye), so
  // the cap covers the same proportion of every body shape and the frill can't
  // land on the eyes.
  const eyeTop = Math.min(eyes.left[1], eyes.right[1]);
  const forehead = Math.max(12, eyeTop - topY);
  const foreheadY = topY + forehead * 0.38;
  const sideY = topY + forehead * 0.64;
  // Control point chosen so the curve passes exactly through foreheadY at the
  // centre (quadratic midpoint = (P0 + 2C + P1) / 4).
  const control = 2 * foreheadY - sideY;

  // The arc runs between the body's own edges, so the frill can never end up
  // as loose rings floating beside the head.
  const edges = getBodyEdges(bodyShape, sideY);
  const arcLeft: Point = [edges.left, sideY];
  const arcRight: Point = [edges.right, sideY];
  const arcControl: Point = [centerX, control];
  const crownEdge = `L ${arcRight[0]} ${arcRight[1]} Q ${centerX} ${control} ${arcLeft[0]} ${arcLeft[1]}`;

  const frill = [0.14, 0.28, 0.42, 0.58, 0.72, 0.86].map((t) =>
    quadPoint(arcLeft, arcControl, arcRight, t)
  );

  const capClipId = `${clipId}-cap`;

  return (
    <>
      <defs>
        {/* Restricts the silhouette outline below to the cap area only */}
        <clipPath id={capClipId}>
          <rect x={-10} y={topY - 25} width={120} height={sideY - topY + 25} />
        </clipPath>
      </defs>

      {/* Crown, trimmed to the silhouette */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M ${edges.left - 14} ${topY - 25} L ${edges.right + 14} ${topY - 25}
              L ${edges.right + 14} ${sideY} ${crownEdge}
              L ${edges.left - 14} ${sideY} Z`}
          fill={CLOTH}
        />
        {/* Shading so the white cap has some form */}
        <ellipse cx={centerX} cy={topY - 1} rx={40} ry={12} fill={CLOTH_SHADE} opacity="0.7" />
      </g>

      {/* Keep the blob's edge visible - a white cap on a white background
          otherwise looks like the top of the head was erased. */}
      <path
        d={getBodyPath(bodyShape)}
        fill="none"
        stroke={CLOTH_EDGE}
        strokeWidth="1.6"
        clipPath={`url(#${capClipId})`}
      />

      {/* Frill framing the face */}
      {frill.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="3.4"
          fill={CLOTH}
          stroke={PINK_EDGE}
          strokeWidth="1.1"
        />
      ))}
      {/* Redraw the crown a hair higher to hide the frill's inner arcs, so
          only the scalloped bumps show below the cap edge. */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M ${edges.left - 14} ${topY - 25} L ${edges.right + 14} ${topY - 25}
              L ${edges.right + 14} ${sideY - 1.5}
              L ${arcRight[0]} ${arcRight[1] - 1.5}
              Q ${centerX} ${control - 1.5} ${arcLeft[0]} ${arcLeft[1] - 1.5}
              L ${edges.left - 14} ${sideY - 1.5} Z`}
          fill={CLOTH}
        />
      </g>

      {/* Chin ties hanging from where the frill meets the body */}
      {[-1, 1].map((dir) => (
        <path
          key={dir}
          d={`M ${dir < 0 ? edges.left + 2 : edges.right - 2} ${sideY}
              q ${dir * 2} 6 ${dir * -1.5} 11`}
          fill="none"
          stroke={PINK_EDGE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}

      {/* Little bow on top, instead of a pom - poms read as beanies */}
      <g transform={`translate(${centerX}, ${topY + 1})`}>
        <path d="M 0 0 L -6 -3.4 L -6 3.4 Z" fill={PINK} stroke={PINK_EDGE} strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M 0 0 L 6 -3.4 L 6 3.4 Z" fill={PINK} stroke={PINK_EDGE} strokeWidth="0.9" strokeLinejoin="round" />
        <circle cx="0" cy="0" r="1.7" fill={PINK_EDGE} />
      </g>
    </>
  );
}

/**
 * Booties — the blob is sitting on its bottom with both legs out, so what you
 * see is the SOLE of each foot, angled away from the body at the lower sides.
 *
 * Drawn side-on and standing (the obvious reading) it just looked like the
 * blob was balancing on two shoes.
 */
function Booties({ bodyShape }: PartProps) {
  const { centerX } = getShapeDimensions(bodyShape);
  const bottomY = getBodyBottomY(bodyShape);
  const footY = bottomY - 4;
  const edges = getBodyEdges(bodyShape, footY);
  const w = Math.min(15, (edges.right - edges.left) * 0.38);
  // Spread from the CENTRE, not the silhouette: on a round or wide body the
  // edge at this height is the widest point, which parks the feet up at the
  // waist like flippers instead of out in front of the bottom.
  // Enough that the two ankle cuffs sit side by side rather than overlapping
  // into one blob in the middle, but close enough to still read as a pair.
  const spread = w * 1.0;

  const bootie = (dir: -1 | 1, key: string) => {
    const cx = centerX + dir * spread;
    return (
      // Mirroring instead of rotating the other way keeps one drawing for both
      // feet. Toe tips slightly UP and out, the way feet sit when a baby is
      // sitting down with its legs in front.
      // Rotated so the toe points mostly UP and slightly outward - the way a
      // sitting baby's feet stick up in front of it. Laid flat, the pair reads
      // as shoes on the floor with the blob standing on them.
      <g key={key} transform={`translate(${cx}, ${footY}) scale(${dir}, 1) rotate(-68)`}>
        {/* A bootie's signature is an L: an ankle shaft with a foot running
            forward at the bottom. Stack a cuff on a box instead and you get a
            container; draw the sole face-on and you get a mitt. */}
        <path
          d={`M ${-w * 0.42} ${-w * 0.4}
              L ${w * 0.16} ${-w * 0.4}
              L ${w * 0.16} ${-w * 0.12}
              C ${w * 0.36} ${-w * 0.14} ${w * 0.54} ${-w * 0.02} ${w * 0.56} ${w * 0.16}
              C ${w * 0.58} ${w * 0.34} ${w * 0.48} ${w * 0.46} ${w * 0.3} ${w * 0.46}
              Q 0 ${w * 0.64} ${-w * 0.3} ${w * 0.46}
              C ${-w * 0.42} ${w * 0.46} ${-w * 0.46} ${w * 0.38} ${-w * 0.46} ${w * 0.24}
              Z`}
          fill={MINT}
          stroke="#7FC9AC"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Sole. Bulged rather than flat, and taken further up the sides, so it
            reads as the rounded underside of the shoe tipping toward us. */}
        <path
          d={`M ${-w * 0.46} ${w * 0.22}
              L ${w * 0.575} ${w * 0.22}
              C ${w * 0.57} ${w * 0.4} ${w * 0.46} ${w * 0.46} ${w * 0.3} ${w * 0.46}
              Q 0 ${w * 0.64} ${-w * 0.3} ${w * 0.46}
              C ${-w * 0.42} ${w * 0.46} ${-w * 0.46} ${w * 0.38} ${-w * 0.46} ${w * 0.22}
              Z`}
          fill="#7FC9AC"
        />
        {/* Folded-over knitted cuff at the top of the shaft. Pink, not white:
            it sits against the (white) nappy, where white disappears. */}
        <rect
          x={-w * 0.52}
          y={-w * 0.62}
          width={w * 0.78}
          height={w * 0.28}
          rx={w * 0.11}
          fill={PINK}
          stroke={PINK_EDGE}
          strokeWidth="0.9"
        />
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
