# Updating OSAA601 V6

Edit `content.json`, then rebuild. It is the shared English/Arabic source. Do not edit generated pages individually: the next build overwrites `public/`.

From the repository root:

```sh
python3 website/build.py
python3 website/tests/build.test.py
node website/tests/desktop.test.cjs
node website/tests/premium.test.cjs
node website/tests/welcome.test.cjs
node website/tests/desktop-extras.test.cjs
node website/tests/starfall-engine.test.cjs
```

The build needs Python 3.9+ and its standard library. Tests also use Node.js. The deployed website needs neither. All public upload files are in `website/public/`.

## First screen and desktop guide

`welcome` holds the bilingual first-screen heading, three `paths`, guide summary, introduction and instruction arrays. Each path has an existing `service` slug, local `icon` name, bilingual `title` and plain-language `text`. Keep the instructions short and truthful. These links open existing service detail pages; they do not create new apps or clear visitor preferences. Profile's visible name is Start here; its stable ID remains `profile`. The phone home presents the main actions before the app grid.

## Professional content and services

`en` and `ar` contain profile copy, experience, education and general interface labels. Keep both translations accurate. `commercial_groups` maps the three customer-facing groups to `service_groups` slugs. Each of the seven service categories contains bilingual `title`, `problem`, `intro`, `fit`, `duration`, and `engagement`, plus `offers` (individual bilingual titles/descriptions), `deliverables` and `starting` (arrays per language).

Duration must say it is an estimate and depend on scope. Offer only services you can deliver. Do not turn software/game portfolio projects into paid development services or represent coursework as certification. Services are built at `/services/slug/` and `/ar/services/slug/`; the desktop opens the detail inside Work with me.

## Projects

`projects` includes the four existing cases. Preserve existing slugs when updating: links and saved histories use them. Each entry has `title`, `category`, `summary`, `objective`, `role`, `overview`, `status`, `stage_detail`, `focus`, `tags`, `kind`, `related_service`, and `media`.

`kind` is `professional`, `academic`, or `experiment`. `related_service` must be an existing service slug. `focus` contains EN/AR arrays; `tags` is a shared array. Clearly label concept work, draft work and prototypes. Describe your real contribution and publish results only with evidence. Do not publish private employer/customer screenshots or security documents.

Cases are built at `/work/slug/` and `/ar/work/slug/`. They stay in the Projects window with Back, Forward, Home and next-project navigation.

## Real screenshots, showreels and media

Place approved images under `assets/`, preferably resized WebP/JPEG with an appropriate pixel size and file weight. Use relative-to-site paths such as `/assets/my-approved-sample.webp`; external image hosting is intentionally not supported by the media renderer/CSP. The build checks that the file exists. Use original links for videos rather than third-party embeds.

The same media entry shape works in a project's `media`, top-level `studio_media`, `journeys.episodes`, and `journeys.gallery`:

```json
{
  "title": {"en": "Your actual sample title", "ar": "عنوان العينة الفعلية"},
  "description": {"en": "Your actual role and context.", "ar": "دورك الفعلي وسياق العمل."},
  "image": "/assets/my-approved-sample.webp",
  "alt": {"en": "A useful image description", "ar": "وصف مفيد للصورة"},
  "width": 1200,
  "height": 675,
  "url": "https://your-real-original-media-url.example/"
}
```

This is an editing example, not published content. Replace every sample value with real content. `image` and `url` are optional; image entries require bilingual alt text and correct positive dimensions. Original URLs must use HTTPS without embedded credentials. All titles/descriptions are escaped as plain text: HTML is not supported. Optional links open with safe external-link attributes.

## Journal and reasons to return

`journal` entries use `slug`, `category`, bilingual `title` and `excerpt`, `paragraphs` (EN/AR arrays), and `related` (an existing desktop screen, such as `arcade` or `service/cybersecurity`). Existing category identifiers are `security`, `creative`, and `site`; reuse these for the working topic filters. Use stable lowercase slugs with letters, numbers and hyphens. New entries get translated pages and launcher results automatically. Existing bookmarks remain valid if slugs stay stable.

The Profile desk brief currently features the second project (PotStation) and first Journal note. Reorder the project list or change the `featured` selection near the end of `home()` in `build.py` to choose another approved case. Put a genuine new Journal note first to update its featured link. No automatic feed or fictional publication dates are generated.

## Future Journeys

The introduction, status and honesty note are in `journeys`. Leave the planning status until genuine production exists. `formats` describes future ideas. `series` accepts:

```json
{
  "country": {"en": "Actual country or region", "ar": "الدولة أو المنطقة الفعلية"},
  "title": {"en": "Your actual series title", "ar": "عنوان سلسلتك الفعلي"},
  "description": {"en": "Accurate production context.", "ar": "سياق إنتاج دقيق."},
  "status": {"en": "Actual planning or release status", "ar": "حالة التخطيط أو النشر الفعلية"}
}
```

`episodes` and `gallery` use the media shape above. They are currently empty. Add real country-based episodes, trailers, production notes and images when approved; this version does not pretend to have a functioning travel tracker or world map. Keep client services prominent and keep personal/family details private.

## Google Workspace bookings

`booking_url` is currently `""`. In Google Calendar, create an appointment schedule and copy its **public booking page**. Set that exact HTTPS URL in `booking_url`, then rebuild. Supported hosts: `calendar.app.google` and `calendar.google.com`. Verify the schedule from a signed-out browser before publication. A missing/invalid link uses the working consultation email draft. This site never reads your private calendar or credentials.

`email` is `osaa@osaa601.com`. `inquiries` defines six bilingual email subjects. Email draft templates ask for organization, needs, deliverables, timing/timezone and public links. They do not send messages themselves. If changing contact details, also update `assets/osaa601-contact.vcf`. Keep Workspace DNS mail records unchanged when uploading the website.

## Cloudflare Pages Direct Upload

Build and upload the **contents** of `public/`, or the supplied `osaa601-v6-cloudflare.zip`. `index.html`, `_headers`, `_redirects`, and `assets/` must be at the upload root. Upload as a preview first, review both languages and mobile/desktop, then select production when ready. Do not upload source JSON, build scripts, tests or the source ZIP. No hosting change or paid backend is required.

Static routes, 404, robots, sitemap and security headers are included. Keep `domain` accurate if moving domains. Generated CSP hashes allow the exact structured-data scripts; do not add inline JavaScript or third-party trackers casually. Retain the prior Cloudflare deployment for rollback.

## Visitor preferences and game saves

Preserve the existing keys in `desktop-state.js`, `desktop-extras.js`, `audio.js`, and `starfall-engine.js`. In particular, `osaa601-starfall-save` must not be renamed or cleared. Desktop reset is separate from bookmarks/audio/game progress. Changing app root identifiers or project/note slugs can invalidate saved navigation. Test corrupt and blocked storage handling before changing persistence.

The game engine and renderer are unchanged. Do not replace the game files as part of routine content editing. Audio uses local Web Audio synthesis; original MP3 files were not supplied. All current artwork is decorative, not evidence of professional outcomes.
