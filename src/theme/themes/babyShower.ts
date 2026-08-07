import type { Theme } from "../types";

/**
 * Baby Shower — the mountain becomes a soft pastel blanket: powder blue base,
 * lilac mid, blush summit, whipped-cream snow cap and polka-dot texture.
 * Every structural element (checkpoint lines, elevation labels, snow cap,
 * summit flag) is still there, just recolored for a light background.
 */
export const babyShowerTheme: Theme = {
  id: "baby_shower",
  label: "Baby Shower",
  emoji: "🍼",
  description: "Pastel nursery mountain. Blobs get diapers, binkies, bibs, bottles and rattles.",

  blobAccessories: {
    // One item per slot, so any combination of picks stays readable.
    pool: [
      { id: "diaper", slot: "bottom" },
      // A bowtie already sits on the chest.
      { id: "bib", slot: "chest", conflictsWith: ["bowtie"] },
      { id: "rattle", slot: "hand-left" },
      { id: "bottle", slot: "hand-right" },
      { id: "binky", slot: "mouth" },
    ],
    minCount: 1,
    maxCount: 3,
  },

  mountain: {
    // Blush summit → lilac → powder blue base. Deep enough at each stop to
    // keep the silhouette readable against the pale sky.
    rock: ["#F7CFE4", "#EFC6E2", "#DDBEEC", "#CBB0E4", "#B3C0E8", "#96A9DC"],
    rockLayer: ["#EBD9F5", "#DCD0F0", "#C6D2EE"],
    rockHighlight: ["#FFFFFF", "#FFF4FA"],
    rockShadow: [
      "rgba(146,116,178,0.28)",
      "rgba(146,116,178,0.12)",
      "rgba(146,116,178,0)",
      "rgba(146,116,178,0.14)",
    ],
    detail: {
      shadow: "#C9B2E4",
      crack: "#B092D6",
      ledgeHighlight: "#FFFFFF",
      streak: "#B79FD9",
    },
    texture: {
      kind: "dots",
      colors: [
        "rgba(255,255,255,0.75)",
        "rgba(255,182,214,0.45)",
        "rgba(255,255,255,0.6)",
        "rgba(174,208,246,0.45)",
        "rgba(255,255,255,0.7)",
      ],
      opacity: 0.4,
    },
    // Cream → pink → powder blue at the summit line, so the blush peak reads.
    sky: ["#FFF3DE", "#FFDDEE", "#BFDCFF"],
    sun: {
      rays: "#FFD6E8",
      core: "#FFFBEA",
      glow: ["#FFFDF6", "#FFF0D6", "#FFD3E6", "#FFB8D9"],
    },
    snow: ["#FFFFFF", "#FFF6FB", "#FFE9F4", "#FFDCEC"],
    snowHighlight: "#FFFFFF",
    distantMountains: ["#C9B6E8", "#B5A2DC"],
    cloud: { body: "#FFFFFF", shadow: "rgba(255,190,215,0.45)" },
    checkpoint: {
      // Dark-on-light: the pastel rock face needs ink, not white.
      line: "rgba(122,92,158,0.45)",
      lineSummit: "#D2649B",
      label: "#5B4A7A",
      labelSummit: "#C2185B",
      labelShadow: "#FFFFFF",
    },
    flag: {
      fabric: "#FF9EC7",
      highlight: "#FFD6E8",
      pole: "#D3B08C",
      finial: "#FFE08A",
    },
    skyPanel: {
      background: "rgba(92, 62, 112, 0.6)",
      border: "rgba(255, 255, 255, 0.3)",
      title: "rgba(255,255,255,0.85)",
      text: "#FFFFFF",
    },
  },
};
