# Evidence · UX/SEO/conversion pass (PR from `claude/typhoon-ux-seo-conversion`)

Review material only. Never merge this branch; delete it once the PR is decided.

- `pairs/`: before (live `main@6871de1`) and after (Vercel preview `b83df31`; the final head `145b936` only adds a click-modifier guard in the consent dialog, which changes nothing visible) side by side, with the same viewport, scroll position and live data.
- `originals/before|after/`: the single captures in original resolution (JPEG q90).
- `e2e/`: journey checks on the final preview `145b936` (Chromium, Firefox, WebKit). `/api/booking` was always intercepted and nothing was sent.
- `lighthouse/`: local Lighthouse medians. B5/BF = main, A5/AF = branch, A6 = a reverted experiment, LIVE/PREVIEW = CDN runs.
- `reviews/`: the round-1 council critiques (OpenAI, Google, xAI) and every final and re-check review.
