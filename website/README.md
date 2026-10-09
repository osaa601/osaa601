# Osaa601 portfolio

Professional English/Arabic portfolio with light/dark themes and original fantasy pixel art. Static files run on the existing Cloudflare Pages project `osaa601`; no paid hosting, database, or build dependency is required.

## Edit and preview

Edit `content.json` for bios, services, project descriptions, social links, and translations. Update `assets/style.css` for design changes, then run:

```sh
python3 website/build.py
python3 -m http.server 8080 --directory website/public
```

Open `http://localhost:8080/` or `/ar/`. The generated `public/` directory contains the complete uploadable site. Theme selection follows the device until the visitor makes a saved choice. The contact button opens the visitor's email app; this site does not collect form submissions.

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

The contact address currently remains `osaa601@gmail.com`. Google Workspace can supply an address on your domain later. Update `email` only after the mailbox works; keep existing Workspace mail records intact. Booking can be added after an actual public appointment link has been created.

There are no trackers, remote fonts, autoplay audio, embedded videos, or cookies for analytics. A visitor's explicit theme preference is stored locally. Metadata, language alternates, sitemap, 404 page, mobile navigation, keyboard controls, and Cloudflare security headers are included.
