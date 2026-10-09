# Osaa601 portfolio

Professional English/Arabic portfolio presented as an interactive desktop, with light/dark themes and original fantasy pixel art. Icons open draggable windows with minimize, maximize, close, and taskbar controls. Each project opens in its own window with a separate taskbar entry. Back, Forward, Home, and breadcrumbs sit inside each window and connect seven apps: Profile, Services, Projects, Studio, Contact, Links, and Music. Static files run on the existing Cloudflare Pages project `osaa601`; no paid hosting, database, or build dependency is required.

## Edit and preview

Edit `content.json` for bios, services, project descriptions, social links, and translations. Update `assets/style.css` for design changes, then run:

```sh
python3 website/build.py
python3 -m http.server 8080 --directory website/public
```

Open `http://localhost:8080/` or `/ar/`. The generated `public/` directory contains the complete uploadable site. Theme selection follows the device until the visitor makes a saved choice. The contact button opens the visitor's email app; this site does not collect form submissions.

The desktop is the only layout, including direct project URLs. Phones use an app home screen and fitted windows; tablets use a touch-friendly app dock and movable windows; desktop computers use freely draggable windows. Drag any restored window by its title bar with a mouse or touch. Phone windows can move within the available screen space. Window titles also accept arrow keys; maximize fits a window to the available app area. Minimize and reopen windows using the taskbar. Without JavaScript, a compact desktop-styled card provides email and Linktree access. Search engines can read the included content and case-study metadata.

The Links app includes all 17 destinations listed on the owner's Linktree, plus Linktree itself. Profile cards and app controls use local vector icons; no external icon service is required.

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

There are no trackers, remote fonts, autoplay audio, embedded videos, or cookies for analytics. A visitor's explicit theme preference is stored locally. Metadata, language alternates, sitemap, 404 page, responsive desktop navigation, keyboard controls, and Cloudflare security headers are included.

## Music and interface sounds

The desktop bar provides a persistent Play/Pause button. The Music app includes two original, synthesized ambient loops: Blue Hour and Moonlit Quest. Play/Pause, previous/next, track selection, seek, volume, and music mute controls stay available inside its window. Minimizing or closing the Music window preserves playback; pausing stops it. Theme changes select the matching daylight or nighttime loop. The M shortcut toggles music when the visitor is not editing a field. Interface sounds have a separate toggle in the top bar and Music app. Music starts only after an explicit user action; interface sounds respond to clicks. Volume and interface-sound preferences are stored locally.

The original upload contains references to lofi.mp3, dark.mp3, and effect MP3s, but does not contain their audio bytes. The replacement uses Web Audio synthesis and makes no external audio requests. Original MP3 tracks can be reinstated when available.
