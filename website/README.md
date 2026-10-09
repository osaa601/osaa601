# Osaa601 portfolio

Professional English/Arabic portfolio presented as an interactive desktop, with light/dark themes and original fantasy pixel art. Icons open eight draggable windows: Profile, Services, Projects, Studio, Contact, Links, Music, and Starfall Vale. Each window has minimize, maximize, close, and taskbar controls. Project details open inside Projects; service details open inside Services. Back, Forward, Home, and breadcrumbs use a separate history for each window, preserving other open windows and their pages. Home returns to that app's index. The explicit Show desktop control minimizes all windows. Static files run on the existing Cloudflare Pages project `osaa601`; no paid hosting, database, or build dependency is required.

## Edit and preview

Edit `content.json` for bios, `service_groups`, project descriptions, social links, and translations. Update `assets/style.css` and `assets/desktop.css` for design changes, then run:

```sh
python3 website/build.py
python3 -m http.server 8080 --directory website/public
```

Open `http://localhost:8080/` or `/ar/`. The generated `public/` directory contains the complete uploadable site. Theme selection follows the device until the visitor makes a saved choice. The contact button opens the visitor's email app; this site does not collect form submissions.

The desktop is the only layout, including direct project URLs. Phones use an app home screen and fitted windows; tablets use a touch-friendly app dock and movable windows; desktop computers use freely draggable windows. Drag any restored window by its title bar with a mouse or touch. Phone windows can move within the available screen space. Window titles also accept arrow keys; maximize fits a window to the available app area. Minimize and reopen windows using the taskbar. Without JavaScript, a compact desktop-styled card provides email and Linktree access. Search engines can read the included content and case-study metadata.

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

The contact address is `osaa@osaa601.com`, as supplied by the owner. Keep existing Google Workspace mail records intact. Booking can be added after an actual public appointment link has been created.

Services include 38 offerings in seven categories: cybersecurity; networks and systems; security governance and advisory; IT support and Google Workspace; video and media; content and online presence; and training and documentation. Each category explains the work, example deliverables, and starting information needed from a client. Security testing requires an agreed authorized scope. Compliance work is readiness support, not certification. Personal game/VR experiments appear in the creative profile; software development is not offered as a paid service. Profile sections distinguish professional work, education/coursework, creative interests, and hobbies.

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
node website/tests/desktop.test.cjs
node website/tests/starfall-engine.test.cjs
```

The simulated DOM checks cover English/Arabic at six viewport widths (320–2560px), local window histories, same-window detail views, language/audio/game continuity, close/minimize/taskbar behavior, theme-synchronized artwork, and direct project routes. Engine tests cover reachability of all three maps and quest locations, continuous/diagonal movement, collision, facing-based sword attacks, cooldowns, dash/invulnerability, enemy warnings/projectiles, the complete quest, upgrades, defeat recovery, save restoration, corrupt values, and blocked storage. These checks do not replace visual browser review or listening to audio on a real device.
