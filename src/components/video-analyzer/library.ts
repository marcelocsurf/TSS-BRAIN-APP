// TSS Model Library catalog.
// Drop .mp4 files into /public/tss-library/<category>/ and add an entry here.
// Missing files are handled gracefully by the UI.

export type ModelClip = {
  id: string;
  title: string;
  src: string; // path under /public
};

export type ModelCategory = {
  id: string;
  name: string;
  clips: ModelClip[];
};

export const LIBRARY: ModelCategory[] = [
  {
    id: "take-off",
    name: "Take Off",
    clips: [
      { id: "take-off-1", title: "Take Off — Model 1", src: "/tss-library/take-off/model-1.mp4" },
      { id: "take-off-2", title: "Take Off — Model 2", src: "/tss-library/take-off/model-2.mp4" },
    ],
  },
  {
    id: "bottom-turn",
    name: "Bottom Turn",
    clips: [
      { id: "bottom-turn-1", title: "Bottom Turn — Model 1", src: "/tss-library/bottom-turn/model-1.mp4" },
    ],
  },
  {
    id: "top-turn",
    name: "Top Turn",
    clips: [
      { id: "top-turn-1", title: "Top Turn — Model 1", src: "/tss-library/top-turn/model-1.mp4" },
    ],
  },
  {
    id: "cutback",
    name: "Cutback",
    clips: [
      { id: "cutback-1", title: "Cutback — Model 1", src: "/tss-library/cutback/model-1.mp4" },
    ],
  },
  {
    id: "floater",
    name: "Floater",
    clips: [
      { id: "floater-1", title: "Floater — Model 1", src: "/tss-library/floater/model-1.mp4" },
    ],
  },
  {
    id: "barrel-line",
    name: "Barrel Line",
    clips: [
      { id: "barrel-line-1", title: "Barrel Line — Model 1", src: "/tss-library/barrel-line/model-1.mp4" },
    ],
  },
  {
    id: "air",
    name: "Air",
    clips: [
      { id: "air-1", title: "Air — Model 1", src: "/tss-library/air/model-1.mp4" },
    ],
  },
];
