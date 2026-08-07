import type { Theme } from "../types";

/**
 * Baby — the mountain as a nursery: cotton-candy summit, lilac mid, powder
 * blue base, whipped-cream snow cap and a rock face scattered with hearts.
 * Every structural element (checkpoint lines, elevation labels, snow cap,
 * summit flag) is still there, just recolored for a light background.
 *
 * The stored id is still `baby_shower` — renaming it would invalidate the
 * theme field on every existing session document, and the id is never shown.
 */
export const babyTheme: Theme = {
  id: "baby_shower",
  label: "Baby",
  emoji: "👶",
  description:
    "Nursery mountain, and every blob is a baby: rosy cheeks plus bonnets, diapers, booties, binkies, bibs, bottles, rattles, teddies and blocks. Music-box and baby-babble sounds.",

  // Music box, rattles, coos and squeaky toys instead of synth blips.
  soundPack: "baby",

  blobAccessories: {
    // Rosy cheeks and a nappy on everyone: these two carry the theme, and
    // make the roster read as babies rather than blobs holding baby props.
    // Everything else is dressing.
    always: [
      { id: "cheeks", slot: "cheeks" },
      { id: "diaper", slot: "bottom" },
    ],
    // Several candidates per slot, so a crowd of blobs looks like a nursery
    // instead of the same three items repeated.
    pool: [
      // Own slot, so the always-on nappy doesn't block them.
      { id: "booties", slot: "feet" },
      // A bowtie already sits on the chest.
      { id: "bib", slot: "chest", conflictsWith: ["bowtie"] },
      { id: "rattle", slot: "hand-left" },
      { id: "teddy", slot: "hand-left" },
      { id: "bottle", slot: "hand-right" },
      { id: "blocks", slot: "hand-right" },
      { id: "binky", slot: "mouth" },
      // Anything already on the head would fight with a bonnet.
      {
        id: "bonnet",
        slot: "head",
        conflictsWith: ["hat", "crown", "bow", "bandana", "flower", "headphones"],
      },
    ],
    // On top of the always-on cheeks and nappy, so 3 is already a lot of baby.
    minCount: 2,
    maxCount: 3,
  },

  mountain: {
    // Cotton-candy summit → lilac → powder blue base. Deep enough at each stop
    // to keep the silhouette readable against the pale sky.
    rock: ["#FFD6EA", "#F8C8E6", "#E4BCEE", "#CDB2E8", "#B3C4EC", "#94ABE0"],
    rockLayer: ["#F4E2FA", "#E2D4F4", "#C9D6F2"],
    rockHighlight: ["#FFFFFF", "#FFF4FA"],
    rockShadow: [
      "rgba(146,116,178,0.26)",
      "rgba(146,116,178,0.11)",
      "rgba(146,116,178,0)",
      "rgba(146,116,178,0.13)",
    ],
    detail: {
      shadow: "#D2BCE9",
      crack: "#B99BDC",
      ledgeHighlight: "#FFFFFF",
      streak: "#C0A8DF",
    },
    texture: {
      // Little hearts all over the mountain face.
      kind: "hearts",
      colors: [
        "rgba(255,255,255,0.8)",
        "rgba(255,170,208,0.55)",
        "rgba(255,255,255,0.65)",
        "rgba(168,206,246,0.5)",
        "rgba(183,230,211,0.5)",
      ],
      opacity: 0.6,
    },
    // Buttercream → blush → powder blue at the summit line, so the pink peak reads.
    sky: ["#FFF6E4", "#FFDCEF", "#C2E4FF"],
    sun: {
      rays: "#FFD0E4",
      core: "#FFFCEF",
      glow: ["#FFFDF8", "#FFF1DC", "#FFD3E6", "#FFB6D8"],
    },
    snow: ["#FFFFFF", "#FFF7FC", "#FFEAF5", "#FFDBEE"],
    snowHighlight: "#FFFFFF",
    distantMountains: ["#D3C0EE", "#BCA9E2"],
    cloud: { body: "#FFFFFF", shadow: "rgba(255,186,214,0.45)" },
    checkpoint: {
      // Dark-on-light: the pastel rock face needs ink, not white.
      line: "rgba(122,92,158,0.45)",
      lineSummit: "#D2649B",
      label: "#5B4A7A",
      labelSummit: "#C2185B",
      labelShadow: "#FFFFFF",
    },
    // Candy-stripe ladder instead of hemp rope.
    rope: { rail: "#F09BC4", rung: "#8ED6BC" },
    flag: {
      fabric: "#FF9EC7",
      highlight: "#FFD6E8",
      pole: "#D3B08C",
      finial: "#FFE08A",
    },
    // Milk-white panels with ink text - the alpine navy slab reads as a hole
    // punched in a pastel mountain. Also drives the answer pills (Rope.tsx).
    skyPanel: {
      background: "rgba(255, 252, 254, 0.93)",
      border: "rgba(238, 133, 178, 0.55)",
      title: "#A87BBE",
      text: "#4A3A63",
    },
  },
};
