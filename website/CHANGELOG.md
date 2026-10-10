# Changelog

## V6.2 — 2026-10-10

- Animated the retained fantasy wallpaper with slow landscape movement, clouds and valley mist. Night mode adds stars, fireflies and an occasional shooting star.
- Added a bilingual Living wallpaper pause/enable control in Desktop settings. Its optional preference saves under `osaa601-wallpaper-motion`; existing game, audio and archive keys are untouched.
- Paused background animation while the tab is hidden or browser loses focus; reduced-motion preferences disable it. Phones display fewer decorative particles.
- Used local CSS transform/opacity animation without video files, remote requests, timers or another JavaScript animation loop. Decorative layers cannot intercept clicks.
- Added tests for pause persistence, language cleanup, visibility/focus transitions, day/night changes, reduced-motion startup and standalone preview controls.

## V6.1 — 2026-10-10

- Added three prominent starting paths that explain cybersecurity, infrastructure and media work in plain language and open the matching service in the existing Services window.
- Relabeled the Profile app as Start here while keeping its stable internal identifier and saved state.
- Added an expandable bilingual desktop guide with navigation, taskbar, search, music and optional game instructions. It can return visitors to the app desktop without an intrusive tour or consent prompt.
- Reworked the phone home into a readable introduction with Work with me, See my work and Start here actions before the app icons. Flow layout prevents a longer bilingual introduction from overlapping the grid.
- Refined introduction typography, spacing and service path cards; retained the day/night artwork and all existing engines.
- Added welcome-flow tests for both languages at phone, tablet and desktop widths, plus the standalone preview.

## V6 — 2026-10-10

- Reorganized Work with me into Cybersecurity & GRC, Infrastructure & Security Operations, and Media & Content Production. Retained all 38 offerings across seven service categories.
- Added service problems, suitable clients, duration estimates, engagement descriptions, example deliverables and contextual email inquiries. Added the five-step remote process and limited recurring advisory option; no fixed prices or guaranteed results.
- Strengthened Osama Waer / OSAA601 identity and contact visibility on desktop and phone. Added six inquiry topics and a downloadable business contact card.
- Added Future Journeys, explicitly marked in planning, with editable future series, episodes and galleries. Added Studio production workflow and a route to this creative direction.
- Expanded four existing cases with objective, actual role, evidence/status, methods, related services and next-project navigation. Added persistent project filters.
- Generated 42 public English/Arabic routes with titles, descriptions, canonical URLs, language alternates, sharing metadata and sitemap coverage.
- Added a rich semantic fallback for disabled JavaScript or startup failure. Native fallback links reach actual generated pages.
- Improved desktop composition, mobile identity/home layout, window content spacing, touch targets, container layouts and reduced-motion treatment.
- Corrected browser history ownership and kept independent window histories. Extended explicit session restore to retain valid trails and scroll position without replacing existing storage keys.
- Improved search keyboard selection, selection announcements and background focus isolation.
- Added editable local media rendering, URL validation and missing-image checks. Kept Cloudflare CSP hash lines bounded as new content is added.
- Added integration checks across eight viewport sizes in both languages, direct-route/failure checks and static security/link checks.

## Compatibility

Starfall Vale engine/UI and original binary artwork are unchanged. Game progress, audio state across language switching, desktop settings, bookmarks and archive rewards use their existing storage. A new optional key, `osaa601-project-filter`, saves only the archive filter. A visit still starts in Profile on larger devices or the phone home; restoring all prior windows is explicit. Root repository feeds remain unchanged.

Consultation continues to use email because no public Google Calendar booking link has been supplied. There are no invented media samples, credentials, testimonials or completed travel episodes.
