import { useTheme } from "../../theme";
import type { MountainMode } from "./types";

// Fixed stop positions - a theme supplies colors, never layout.
const ROCK_OFFSETS = ["0%", "15%", "35%", "60%", "85%", "100%"];
const ROCK_LAYER_OFFSETS = ["0%", "50%", "100%"];
const SKY_OFFSETS = ["0%", "50%", "100%"];
const SNOW_OFFSETS = ["0%", "30%", "60%", "100%"];
const SUN_GLOW_OFFSETS = ["0%", "40%", "70%", "100%"];
const SHADOW_OFFSETS = ["0%", "30%", "70%", "100%"];

// Speck placement for the surface texture pattern (40x40 tile).
// `rotate` only matters for hearts - a tilted scatter reads as hand-strewn.
const TEXTURE_SPECKS = [
  { cx: 8, cy: 8, grain: 0.5, dot: 2.2, rotate: -12 },
  { cx: 28, cy: 12, grain: 0.4, dot: 1.5, rotate: 14 },
  { cx: 16, cy: 24, grain: 0.6, dot: 2.6, rotate: -4 },
  { cx: 34, cy: 30, grain: 0.3, dot: 1.3, rotate: 22 },
  { cx: 6, cy: 36, grain: 0.5, dot: 1.9, rotate: -18 },
];

/**
 * Heart centred on (0,0), sized so `r` matches the radius a dot would use.
 * Kept as a path (not an emoji) so it inherits the theme's texture colors.
 */
function heartPath(r: number): string {
  const w = r * 1.15;
  const h = r * 1.1;
  return `M 0 ${h}
          C ${-w * 1.6} ${-h * 0.25} ${-w * 0.7} ${-h * 1.5} 0 ${-h * 0.45}
          C ${w * 0.7} ${-h * 1.5} ${w * 1.6} ${-h * 0.25} 0 ${h} Z`;
}

/**
 * SVG <defs> block for mountain gradients, patterns, and filters.
 * All colors come from the active theme's palette so a new theme re-skins the
 * whole mountain without touching any of the drawing code.
 */
export function MountainDefs({ mode }: { mode: MountainMode }) {
  const { mountain } = useTheme();

  return (
    <defs>
      {/* Rock face gradient - summit to base */}
      <linearGradient id={`mountain-gradient-${mode}`} x1="0%" y1="0%" x2="0%" y2="100%">
        {mountain.rock.map((color, i) => (
          <stop key={i} offset={ROCK_OFFSETS[i]} stopColor={color} />
        ))}
      </linearGradient>

      {/* Secondary rock layer gradient for depth */}
      <linearGradient id={`rock-layer-gradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
        {mountain.rockLayer.map((color, i) => (
          <stop key={i} offset={ROCK_LAYER_OFFSETS[i]} stopColor={color} />
        ))}
      </linearGradient>

      {/* Sky gradient for summit decoration */}
      <linearGradient id={`sky-gradient-${mode}`} x1="0%" y1="0%" x2="0%" y2="100%">
        {mountain.sky.map((color, i) => (
          <stop
            key={i}
            offset={SKY_OFFSETS[i]}
            stopColor={color}
            stopOpacity={i === mountain.sky.length - 1 ? 0.6 : undefined}
          />
        ))}
      </linearGradient>

      {/* Sun glow */}
      <radialGradient id={`sun-glow-${mode}`} cx="50%" cy="50%" r="50%">
        {mountain.sun.glow.map((color, i) => (
          <stop
            key={i}
            offset={SUN_GLOW_OFFSETS[i]}
            stopColor={color}
            stopOpacity={i === 2 ? 0.3 : i === 3 ? 0 : undefined}
          />
        ))}
      </radialGradient>

      {/* Snow gradient */}
      <linearGradient id={`snow-gradient-${mode}`} x1="0%" y1="0%" x2="0%" y2="100%">
        {mountain.snow.map((color, i) => (
          <stop
            key={i}
            offset={SNOW_OFFSETS[i]}
            stopColor={color}
            stopOpacity={i === mountain.snow.length - 1 ? 0.8 : undefined}
          />
        ))}
      </linearGradient>

      {/* Directional shadow gradient for depth - left side darker */}
      <linearGradient id={`rock-shadow-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
        {mountain.rockShadow.map((color, i) => (
          <stop key={i} offset={SHADOW_OFFSETS[i]} stopColor={color} />
        ))}
      </linearGradient>

      {/* Rock highlight gradient for exposed faces */}
      <linearGradient id={`rock-highlight-${mode}`} x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={mountain.rockHighlight[0]} stopOpacity="0.4" />
        <stop offset="50%" stopColor={mountain.rockHighlight[1]} stopOpacity="0.2" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>

      {/* Surface texture pattern - fine grain, polka dots, or nursery hearts */}
      <pattern id={`rock-texture-${mode}`} patternUnits="userSpaceOnUse" width="40" height="40">
        <rect width="40" height="40" fill="transparent" />
        {TEXTURE_SPECKS.map((speck, i) =>
          mountain.texture.kind === "hearts" ? (
            <path
              key={i}
              // Hearts need more area than a dot to be legible as a shape
              d={heartPath(speck.dot * 1.5)}
              fill={mountain.texture.colors[i]}
              transform={`translate(${speck.cx}, ${speck.cy}) rotate(${speck.rotate})`}
            />
          ) : (
            <circle
              key={i}
              cx={speck.cx}
              cy={speck.cy}
              r={mountain.texture.kind === "dots" ? speck.dot : speck.grain}
              fill={mountain.texture.colors[i]}
            />
          )
        )}
      </pattern>

      {/* Filter for subtle noise texture */}
      <filter id={`mountain-noise-${mode}`} x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}
