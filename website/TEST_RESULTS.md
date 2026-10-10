# V6 verification — 10 October 2026

The complete generated static package was built and checked before packaging. All commands below passed. Behavioral integration uses a simulated DOM and Web Audio fixture; this is not a claim of visual browser QA or measured Core Web Vitals.

| Check | Evidence |
|---|---|
| `python3 website/build.py` | 42 EN/AR pages, 404, sitemap, robots, local assets and Cloudflare headers generated. |
| `python3 website/tests/build.test.py` | All 42 pages have locale/direction, descriptions, canonical/alternate URLs, social metadata and real fallback content. Local asset/link and icon references resolve. Exact JSON-LD CSP hashes match; header lines fit the build limit. Safe text/URL handling and valid/invalid Google booking URLs tested. |
| `node website/tests/desktop.test.cjs` | 12 language/width combinations: 320, 768, 1024, 1280, 1920 and 2560px in EN/AR. Same-window details, independent histories, close/minimize/taskbar, audio/game continuity, Journal bookmarks, archive rewards, resizing/snapping, language geometry, consultation email, explicit session restore, arrangement/reset and direct project URLs passed. |
| `node website/tests/premium.test.cjs` | 16 language/size combinations listed below. Three-interaction client path, browser/local history ownership, project filters, focus activation, search inert background/selection, six inquiry templates, vCard link, planning-only Journeys, held touch move/attack and save continuity passed. Five direct service/note/Journeys/Contact paths and forced mount-failure fallback passed. |
| `node website/tests/desktop-extras.test.cjs` | Archive persistence, reward locks, bookmarks, corrupt/blocked storage, Arabic normalization and clamped/snap geometry passed. |
| `node website/tests/starfall-engine.test.cjs` | All three maps/quest locations reachable; continuous movement, collision, sword combat, dash, damage, enemy projectiles, complete quest, upgrades, defeat recovery, saved/corrupt/blocked storage passed. |
| Standalone HTML integration | Local-file mount, Hire → service, EN/AR switching, retained detail and local history wrapper passed. No external script/stylesheet references remain in the standalone preview. |
| Preservation | Git blob hashes match the inspected V5 branch for source and public `starfall-engine.js`, `starfall-game.js`, `hero-day.webp`, `hero-night.webp` and `social.jpg`. |

## Integration viewport matrix

Each size was exercised in both languages. The fixture supplies viewport geometry for state/layout calculations; it does not render CSS pixels.

| Device class | Width × height |
|---|---|
| Small phone | 320 × 568 |
| Phone | 390 × 844 |
| Portrait tablet | 768 × 1024 |
| Landscape tablet | 1024 × 768 |
| Laptop | 1366 × 768 |
| Full HD | 1920 × 1080 |
| QHD | 2560 × 1440 |
| Ultrawide | 3440 × 1440 |

## Manual release review still required

Browser automation and a screen reader are unavailable in this environment. Real rendered spacing/contrast, focus announcements, pointer resizing, actual device sound, email-app behavior, external links, Calendar availability and loading/Core Web Vitals have not been verified on real devices.

Before publishing a Cloudflare preview to production:

1. Review light/dark themes, English/Arabic and maximized/restored windows in a desktop browser and on a phone. Test browser zoom and reduced motion.
2. Tab through Hire, search, window controls and service inquiries. Check titles/selection/focus with a screen reader. Confirm the phone's active app is reachable and other windows stay out of the way.
3. Open two apps, navigate details, and use each app's Back/Forward/Home plus browser Back/Forward. Drag, resize, snap, minimize, close and reopen.
4. Start music explicitly, change language and confirm uninterrupted playback. Open Starfall Vale, move/attack with keyboard and touch, switch language, save/reload and confirm progress. Confirm background/focus loss pauses the game.
5. Open inquiry drafts and confirm recipient/subject/body. If a real booking URL is later added, verify it signed out. Inspect the no-JavaScript page and a direct deep link.
6. Run browser Lighthouse/PageSpeed on the deployed preview and verify the final content/media permissions before production upload.

## Content/configuration limits

No public booking URL or verified screenshots/showreel files were provided. Email fallback is active; media/travel collections remain honestly empty. The site has no sending form, tracking backend, private calendar access or automated content feed. Saved progress and preferences are local to the visitor's browser.

## V6.1 welcome update

The updated builder/static route checks passed. `node website/tests/welcome.test.cjs` passed in EN/AR at 320, 390, 768 and 1920px: three actual service/inquiry paths, Start here, guide → desktop, mobile hiring/project actions, home-scroll reset when opening an app, and locale/engine continuity. The standalone preview also passed with `FULLSCREEN_PREVIEW` set to its absolute path. The existing desktop regression suite was rerun against the updated content and controls; its obsolete skill-chip assertion now verifies the three substantive service paths. No game engine or audio source changed. The visual/browser/screen-reader limits above still apply.
