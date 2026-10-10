# Osaa601 portfolio

Professional English/Arabic portfolio presented as an interactive desktop, with light/dark themes and original fantasy pixel art. Icons open eleven windows: Start here (Profile), Services, Projects, Studio, Contact, Links, Music, Starfall Vale, Journal, Future Journeys, and Desktop settings. Each window has minimize, maximize, close, taskbar controls, four corner resize handles, and a layout menu. Project details open inside Projects; service details open inside Services. Back, Forward, Home, and breadcrumbs use a separate history for each window, preserving other open windows and their pages. Home returns to that app's index. The explicit Show desktop control minimizes all windows. Static files run on the existing Cloudflare Pages project `osaa601`; no paid hosting, database, or build dependency is required.

## Edit and preview

Edit `content.json` for bios, `service_groups`, project descriptions, social links, and translations. Update `assets/style.css`, `assets/desktop.css`, and `assets/premium.css` for design changes, then run:

```sh
python3 website/build.py
python3 -m http.server 8080 --directory website/public
```

Open `http://localhost:8080/` or `/ar/`. The generated `public/` directory contains the complete uploadable site. Theme selection follows the device until the visitor makes a saved choice. The contact button opens the visitor's email app; this site does not collect form submissions.

The desktop is the only layout, including direct project URLs. Phones use an app home screen and fitted windows; tablets use a touch-friendly app dock and movable windows; desktop computers use freely draggable windows. Drag any restored window by its title bar with a mouse or touch. Phone windows can move within the available screen space. Window titles also accept arrow keys; maximize fits a window to the available app area. Minimize and reopen windows using the taskbar. Without JavaScript, a semantic fallback provides services, cases, Journal notes, route-specific detail and real inquiry links. It also stays visible if startup fails. Search engines can read the included content and case-study metadata.

The Links app includes all 17 destinations listed on the owner's Linktree, plus Linktree itself. Profile cards and app controls use local vector icons; no external icon service is required.

The scroll area fills every window, including maximized windows; its scrollbar stays at the window edge. A bounded inner page keeps text readable. Container queries respond to the actual window width, expanding the profile into two columns and service/social grids on wider windows. Narrow windows retain one or two columns independently of the browser viewport. The profile banner reuses the bundled day/night fantasy artwork and follows theme changes.

## Deploy by uploading files

Build first. In Cloudflare, open **Workers & Pages → osaa601 → Create deployment**. Upload the **contents** of `website/public`, with `index.html` at the upload root. Select preview for review. A production upload replaces the currently served site. Keep the previous Cloudflare deployment for rollback.

Do not upload `content.json`, `build.py`, or the whole repository. The current root README and JSON feeds remain separate from this replacement frontend.

## Deploy through GitHub Actions

The workflow at `.github/workflows/cloudflare-pages.yml` deploys to the existing Direct Upload project. The workflow needs two repository Actions secrets:

- `CLOUDFLARE_ACCOUNT_ID`: the account ID containing the `osaa601` Pages project.
- `CLOUDFLARE_API_TOKEN`: a token with **Account → Cloudflare Pages → Edit**, restricted to that account.

Enter secrets directly in GitHub **Settings → Secrets and variables → Actions**. Never put the token in source code, content, or chat.

After this workflow exists on `main`, use the Actions tab to run it with `target=preview`, selecting the redesign branch if it has not yet been merged. The workflow prints the preview URL. `target=production` publishes the selected source to the project's production branch `main`. Once configured, changes merged into `main` under `website/` automatically publish to production.

Confirm that the project's production branch is `main` in Cloudflare before using the automated production workflow. Do not merge to `main` with deployment secrets configured until the content and preview have been approved.

Cloudflare guide: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

## Content review before launch

Confirm name spelling, current role and dates, graduation year, project descriptions, and all profile URLs. The included case studies describe responsibilities, an academic project, a documentation draft, and an Unreal prototype. Replace or expand them with your approved evidence when available. Artwork is decorative and is not project evidence.

The contact address is `osaa@osaa601.com`, as supplied by the owner. Keep existing Google Workspace mail records intact. Contact includes a consultation request button with a translated email draft asking for the topic, needs, preferred dates/times, and timezone. To use Workspace bookings, create an Appointment schedule in Google Calendar, set availability and meeting details, and copy its public booking-page link. Set `booking_url` in `content.json` to that HTTPS link, then rebuild. Accepted hosts are `calendar.app.google` and `calendar.google.com`; invalid/missing links retain the email fallback. No private calendar, account credentials, or fabricated availability are included in the site. See https://support.google.com/calendar/answer/10729749 and https://workspace.google.com/resources/appointment-scheduling/.

Services include 38 offerings in seven categories: cybersecurity; networks and systems; security governance and advisory; IT support and Google Workspace; video and media; content and online presence; and training and documentation. Three commercial groups organize the seven categories. Each category explains the customer problem, fit, scope, example deliverables, starting information, duration estimates and engagement options. A persistent Hire control leads to the catalog and a scoped email inquiry within three interactions. Security testing requires an agreed authorized scope. Compliance work is readiness support, not certification. Personal game/VR experiments appear in the creative profile; software development is not offered as a paid service. Profile sections distinguish professional work, education/coursework, creative interests, and hobbies.

There are no trackers, remote fonts, autoplay audio, embedded videos, or cookies for analytics. A visitor's explicit theme preference is stored locally. Metadata, language alternates, sitemap, 404 page, responsive desktop navigation, keyboard controls, and Cloudflare security headers are included.

## Music and interface sounds

The bottom taskbar provides a persistent Play/Pause button and a speaker button beside the clock. The speaker button opens an audio panel with a volume slider, music mute, an interface-sound toggle, and a shortcut to the Music player. The Music app includes two original, synthesized ambient loops: Blue Hour and Moonlit Quest. Play/Pause, previous/next, track selection, seek, volume, and music mute controls stay available inside its window. Minimizing or closing the Music window preserves playback; pausing stops it. Theme changes select the matching daylight or nighttime loop. The M shortcut toggles music when the visitor is not editing a field. Interface sounds have a separate toggle in the taskbar audio panel and Music app. Music starts only after an explicit user action; interface sounds respond to clicks. Volume and interface-sound preferences are stored locally.

Switching English/Arabic replaces the desktop content in the same page and keeps the existing audio and game engines running. The current track, exact playback position, play/pause state, volume, music mute, and interface-sound setting are preserved. Open and minimized windows, window positions, maximized state, each window's navigation history, and Starfall Vale progress are retained. Both languages are included in each static page, so switching requires no page reload or content request. The language URL and metadata update together. Old UI listeners and timers are removed without closing the audio context.

The original upload contains references to lofi.mp3, dark.mp3, and effect MP3s, but does not contain their audio bytes. The replacement uses Web Audio synthesis and makes no external audio requests. Original MP3 tracks can be reinstated when available.

## Starfall Vale and checks

Starfall Vale is an original real-time action RPG inspired by classic handheld adventures. Explore Bluehaven Village, Whisperwood, and Moonfall Temple. Talk to the elder, find the guarded Moon Key, unlock the temple, defeat its Warden, recover the Moon Seal, and return home. Sword attacks follow the player's facing direction and have a cooldown. Dash consumes a regenerating charge and grants brief invulnerability. Slimes telegraph melee strikes; wisps and the Warden fire projectiles. Treasure, a heart vessel, coin rewards, a healer, and a smith's sword upgrade support the quest. Defeat returns the player to the village while preserving equipment and quest progress.

Arrows/WASD move continuously; Space/J/Z attacks; Shift/K dashes; E/Enter interacts; P/Escape pauses. Held touch controls and native action buttons are included. A pixel-art canvas follows the player and uses a smaller camera viewport in narrow windows. Gameplay pauses when its window is inactive, minimized, or closed, when the browser tab is hidden, or when the browser loses focus. Language switching reuses the same game state and cancels old animation loops/listeners. Progress saves locally every two seconds and on quest events, window changes, and page exit, using the `osaa601-starfall-save` key. Blocked storage allows session-only play. No external sprites, copyrighted game assets, accounts, or remote game services are used.

From the repository root, run:

```sh
python3 website/build.py
python3 website/tests/build.test.py
node website/tests/desktop.test.cjs
node website/tests/premium.test.cjs
node website/tests/starfall-engine.test.cjs
node website/tests/desktop-extras.test.cjs
```

The simulated DOM checks cover English/Arabic at six viewport widths (320–2560px), local window histories, same-window detail views, language/audio/game continuity, close/minimize/taskbar behavior, theme-synchronized artwork, and direct project routes. Engine tests cover reachability of all three maps and quest locations, continuous/diagonal movement, collision, facing-based sword attacks, cooldowns, dash/invulnerability, enemy warnings/projectiles, the complete quest, upgrades, defeat recovery, save restoration, corrupt values, and blocked storage. These checks do not replace visual browser review or listening to audio on a real device.

## Desktop tools and reasons to return

Drag a restored window's corner with a pointer or use its arrow keys (Shift makes a larger step). The layout menu offers left/right or top/bottom snapping, default size/centering, larger/smaller, and move buttons. Title bars still support arrow-key movement and double-click maximization. Drag a title to the left/right/bottom edge to snap, or to the top edge to maximize. On phones, half-screen snapping fits the whole app area. Desktop settings can arrange open windows, restore the last saved session, or reset only the desktop. Geometry and window open/minimized state save under `osaa601-desktop-layout`. A fresh visit remembers geometry and starts with Profile (desktop/tablet) or the app home (phone); restoring every previous window is explicit. English/Arabic preserves custom sizes and snap modes. Reset does not erase music preferences, bookmarks, archive rewards, or RPG progress.

The top bar has a Search launcher and a Settings shortcut. Ctrl/Cmd K opens search, arrows choose a result, Enter opens it, and Escape closes it. Search indexes the current language's app pages, project details, service details, and Journal notes. Arabic letter/diacritic normalization improves matching. Results navigate in the existing owner window. The launcher traps Tab focus while open, pauses the RPG, and leaves audio playing.

Profile uses an original compass/star emblem, an O601 signature, and three skill chips. The desktop background and Apps menu show Osama Waer's name. These decorations describe identity; they are not credentials or evidence of client work.

Journal starts with three bilingual, undated notes: useful security reports, editing for story, and the desktop's design. Notes open inside Journal and have their own Back/Forward history. Visitors can filter by topic and bookmark notes. `journal` in `content.json` holds the editable titles, excerpts, paragraphs, categories, related app screens, and stable slugs. Publish real new notes by editing this source and rebuilding; no automatic publishing or fabricated activity stream is implied.

Five optional archive seals appear at the bottom of Profile, Services, Projects, Studio, and Journal. Three unlock Royal Blue wallpaper; all five unlock Moonlit Purple. Completing Starfall Vale unlocks Starlight. Desktop settings shows badge progress and wallpaper choices in both light and dark themes. Bookmarks, seal progress, wallpaper choice, and RPG completion save on the visitor's device under `osaa601-archive`; they survive language switches and revisits. With blocked browser storage, features work for the current session only. No sign-in, cross-device synchronization, or remote tracking is required.

Desktop regression checks additionally cover the launcher and same-window results, RPG search pause, journal filters/bookmarks, seal and completion rewards, resize/snap geometry, language preservation, consultation email fallback, saved-session restore, arrangement, and reset. Pure extras tests cover corrupt/blocked storage, reward locks, Arabic normalization, and viewport bounds. Visual browser review remains required before publishing.

## V6 delivery

There are 42 bilingual public routes, plus 404, sitemap and local assets. Public app roots, service details, project cases and Journal notes open the matching desktop screen. The semantic fallback uses those ordinary URLs. Browser Back/Forward and local app histories restore the owning window without closing unrelated apps. Explicit saved-session restore retains valid trails and scroll positions. Search isolates background focus and announces selection.

Projects have professional/academic/experiment filters and actual objective, contribution, status and methods. Future Journeys is marked in planning, with empty editable collections for real future series, episodes and galleries. Studio and projects support approved local images and HTTPS original-media links. No verified showreel/screenshot files were provided, so none are fabricated.

Read [AUDIT.md](AUDIT.md) for source findings, [CHANGELOG.md](CHANGELOG.md) for changes, [EDITING.md](EDITING.md) for content/booking/deployment instructions and [TEST_RESULTS.md](TEST_RESULTS.md) for evidence and verification limits. The delivered Cloudflare ZIP is the contents of `public/`, ready for Direct Upload. The source ZIP includes the builder, content, assets, tests and generated site.

V6.1 improves first-visit orientation with three concrete service paths, an expandable desktop guide, and a phone home with clear hiring/project/start actions before the app grid. `welcome` in `content.json` contains editable bilingual orientation copy. No tutorial overlay, visit-tracking key or new application was added.
