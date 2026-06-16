"use client";

import dynamic from "next/dynamic";

// Konva needs the browser (window), so load the analyzer client-only.
// Import this wrapper anywhere (e.g. a page or a modal) to embed the tool.
const VideoAnalyzer = dynamic(() => import("./VideoAnalyzer"), { ssr: false });

export default VideoAnalyzer;
