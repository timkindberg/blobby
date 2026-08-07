import { useTheme } from "../../theme";
import type { MountainMode } from "./types";

/**
 * Checkpoint marker with elevation labels on both sides.
 *
 * Structural: themes may recolor the line and labels (a pastel mountain needs
 * dark text where the alpine one needs white) but never remove them.
 */
export function CheckpointMarker({
  elevation,
  y,
  width,
  isSummit,
  mode,
}: {
  elevation: number;
  y: number;
  width: number;
  name?: string; // Kept for API compatibility but no longer used
  isSummit: boolean;
  mode: MountainMode;
}) {
  const isCompact = mode === "admin-preview";
  const { checkpoint } = useTheme().mountain;

  const lineColor = isSummit ? checkpoint.lineSummit : checkpoint.line;
  const labelColor = isSummit ? checkpoint.labelSummit : checkpoint.label;

  return (
    <g>
      {/* Horizontal line across mountain */}
      <line
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={lineColor}
        strokeWidth={isSummit ? 2 : 1}
        strokeDasharray={isSummit ? "none" : "8,6"}
      />

      {/* Left elevation label - with halo for visibility on the rock face */}
      {!isCompact && (
        <g>
          <text
            x={8}
            y={y + 4}
            fontSize="10"
            fill={checkpoint.labelShadow}
            textAnchor="start"
            fontWeight={isSummit ? "bold" : "normal"}
            opacity="0.5"
            transform="translate(1, 1)"
          >
            {elevation}m
          </text>
          <text
            x={8}
            y={y + 4}
            fontSize="10"
            fill={labelColor}
            textAnchor="start"
            fontWeight={isSummit ? "bold" : "normal"}
            data-elevation={elevation}
          >
            {elevation}m
          </text>
        </g>
      )}

      {/* Right elevation label - with halo for visibility on the rock face */}
      {!isCompact && (
        <g>
          <text
            x={width - 8}
            y={y + 4}
            fontSize="10"
            fill={checkpoint.labelShadow}
            textAnchor="end"
            fontWeight={isSummit ? "bold" : "normal"}
            opacity="0.5"
            transform="translate(1, 1)"
          >
            {elevation}m
          </text>
          <text
            x={width - 8}
            y={y + 4}
            fontSize="10"
            fill={labelColor}
            textAnchor="end"
            fontWeight={isSummit ? "bold" : "normal"}
            data-elevation={elevation}
          >
            {elevation}m
          </text>
        </g>
      )}
    </g>
  );
}
