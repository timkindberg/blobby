import type { Theme } from "../types";

/**
 * Classic — the original alpine look: dark granite, cold blue sky, white snow.
 * These are the exact colors the mountain shipped with, lifted into data.
 */
export const classicTheme: Theme = {
  id: "classic",
  label: "Classic",
  emoji: "⛰️",
  description: "The original alpine mountain — dark granite and cold blue sky.",

  blobAccessories: {
    pool: [],
    minCount: 0,
    maxCount: 0,
  },

  mountain: {
    rock: ["#2d3748", "#3a3f4a", "#4a5568", "#3a3f4a", "#2d3748", "#1a202c"],
    rockLayer: ["#4a5568", "#3a3f4a", "#2d3748"],
    rockHighlight: ["#a0aec0", "#718096"],
    rockShadow: [
      "rgba(0,0,0,0.4)",
      "rgba(0,0,0,0.15)",
      "rgba(0,0,0,0)",
      "rgba(0,0,0,0.2)",
    ],
    detail: {
      shadow: "#0a0c10",
      crack: "#1a202c",
      ledgeHighlight: "#5a6577",
      streak: "#0a0c10",
    },
    texture: {
      kind: "grain",
      colors: [
        "rgba(0,0,0,0.05)",
        "rgba(80,90,100,0.06)",
        "rgba(0,0,0,0.04)",
        "rgba(100,110,120,0.05)",
        "rgba(0,0,0,0.04)",
      ],
      opacity: 0.3,
    },
    sky: ["#1e3a5f", "#4a7eb3", "#87CEEB"],
    sun: {
      rays: "#FFD700",
      core: "#FFF8DC",
      glow: ["#FFFEF0", "#FFE4B5", "#FFA500", "#FF8C00"],
    },
    snow: ["#FFFFFF", "#F7FAFC", "#E2E8F0", "#CBD5E0"],
    snowHighlight: "#FFFFFF",
    distantMountains: ["#9EB3C8", "#8BA3B8"],
    cloud: { body: "#FFFFFF", shadow: "rgba(150,180,200,0.3)" },
    checkpoint: {
      line: "rgba(255,255,255,0.45)",
      lineSummit: "#FFD700",
      label: "#FFFFFF",
      labelSummit: "#FFD700",
      labelShadow: "#000000",
    },
    // Hemp rope and weathered wood - the original look.
    rope: { rail: "#A67C3D", rung: "#7a6540" },
    flag: {
      fabric: "#E63946",
      highlight: "#F4A4A8",
      pole: "#5C4033",
      finial: "#FFD700",
    },
    skyPanel: {
      background: "rgba(0, 20, 50, 0.55)",
      border: "rgba(255, 255, 255, 0.15)",
      title: "rgba(255,255,255,0.8)",
      text: "#FFFFFF",
    },
  },
};
