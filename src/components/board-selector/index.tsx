'use client';

import dynamic from 'next/dynamic';

// Client-only, lazy-loaded so the calculator JS only downloads when opened —
// zero bundle cost on the host page until used.
const BoardSelector = dynamic(() => import('./BoardSelector'), { ssr: false });

export default BoardSelector;
