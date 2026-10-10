# OSAA601 source review — 10 October 2026

The inspected source is the existing V5 static desktop on the redesign branch, not a fresh template. The live domain still serves the previous production site. V6 upgrades `website/`; the repository's root feeds and original artwork are retained. This review covers supplied code and content, not private employer systems or unprovided samples.

| Actual finding in V5 | Implemented V6 change |
|---|---|
| Seven service categories were presented as a flat catalog. Client problems, timing estimates and the remote engagement process were not explained consistently. | Three commercial groups contain the seven detailed categories and 38 offerings. Each detail explains the problem, suitability, scope, deliverables, starting information, estimated duration and engagement format. Persistent Work with me opens the catalog; a category opens its email inquiry within three interactions. |
| The identity was present, but commercial next steps competed with desktop exploration. | A persistent Hire control, stronger bilingual introduction, mobile identity panel, contextual inquiry links and a defined project/monthly advisory path improve the route to contact. |
| Project pages had summaries and status, but objective and actual contribution needed more structure. | Four cases now separate objective, role, documented status, methods, related service and next project. Professional, academic and independent work can be filtered. |
| The future adventure brand had no dedicated home. | Future Journeys has an honest planning introduction, three proposed formats and editable series/episode/gallery collections. None are populated with invented travel. |
| Services, Journal and app roots lacked independent public routes. Most links depended on JavaScript navigation. | 42 EN/AR routes include seven service details, four cases, three notes and app roots in each language. Metadata and sitemap cover every route. |
| The no-JavaScript rescue card offered little professional information. | A readable semantic fallback includes real services, cases, Journal notes, contact actions and route-specific detail with ordinary links. It is hidden only after successful desktop mounting. Failed startup removes the partial shell and leaves this information visible. |
| Browser history did not carry enough information to restore the owning window's history reliably. | History records owner and trail position. Local and browser Back/Forward preserve unrelated windows. Explicit session restoration now includes valid navigation trails and scroll positions. |
| Search trapped keyboard focus but background controls were not made inert; keyboard selection could leave the visible results area. | Background regions are inert while search is open; selected results scroll into view, native buttons expose their selected state and a live region announces selection. |
| Desktop sizing and narrower navigation needed adjustment. | Wider defaults, icon clearance, window container layouts, compact phone navigation, one visible phone app, larger touch targets and reduced-motion styling are implemented. |
| Media and future content could not be added consistently from source. | Structured local images and safe original links are supported for cases, Studio and Journeys. Missing local media makes the build fail. Images are lazy loaded; no remote embeds are fetched. |

## Evidence boundaries

Existing professional responsibilities are described without invented client outcomes. PotStation remains academic work. ISMS remains a prepared draft with implementation on hold. The Unreal prototype remains in development. Coursework is not represented as professional certification. No paid software-development service was added. Security engagements require an agreed authorized scope; compliance support does not imply certification.

No verified case screenshots or showreel files were supplied. The original day/night artwork is decorative. Project `media`, `studio_media`, and travel collections remain empty until approved evidence is added. The site links to the existing real social destinations. It contains no invented testimonials, awards, completed episodes or popularity statistics.

Google Calendar booking is not configured: `booking_url` is empty. The visible consultation action opens a translated email draft. Topic-specific links and a public business vCard work without a backend. No message is sent automatically and there is no simulated submission.

## Preserved foundation

Starfall Vale's engine, renderer, maps, combat, quests, upgrades and save format remain byte-for-byte unchanged from the inspected branch. The key remains `osaa601-starfall-save`. Existing audio synthesis, archive seals, Journal bookmarks, wallpaper rewards and preference keys are retained. English/Arabic switches reuse audio and game instances. Original hero images and social artwork remain unchanged.

The static package uses local assets, no paid backend, no analytics tracker, no remote font and no embedded third-party player. Build rendering escapes text and validates URL schemes; Cloudflare CSP hashes permit the exact JSON-LD scripts without enabling arbitrary inline JavaScript. The source supports direct upload with `index.html` at the ZIP root.

## Remaining verification limits

Automated simulated-DOM and engine tests exercise behavior, not browser pixels. This environment has no browser automation or screen reader. Real browser rendering, device audio, actual email applications, Google Calendar availability, external destination availability and Core Web Vitals have not been measured. Complete the brief release review in TEST_RESULTS.md before replacing production.
