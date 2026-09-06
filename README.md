# resourcible.www

Static squeeze page for Resourcible — helping founders and operators turn a real
annoyance into a scalable, commercial, investible product.

## Structure

Plain HTML/CSS/JS, no build step:

- `index.html` — the page (hero, audience segments, offer, email/contact capture)
- `styles.css`
- `script.js` — posts the capture form to a form-endpoint service
- `robots.txt`, `sitemap.xml` — SEO basics
- `.github/workflows/pages.yml` — deploys the site to GitHub Pages on push to `main`

## Hosting on GitHub Pages

1. Push this repo to GitHub (already done via `origin`).
2. In the repo Settings → Pages, set **Source** to **GitHub Actions**.
3. Push to `main` — the included workflow (`.github/workflows/pages.yml`) builds and
   deploys automatically.
4. Optional: add a custom domain in Settings → Pages, and create a `CNAME` file here
   with that domain.

## Lead capture

The email/contact form in `script.js` posts to a `FORM_ENDPOINT`. This is a static
site with no backend, so it relies on a third-party form endpoint (e.g.
[Formspree](https://formspree.io)):

1. Create a free form at Formspree (or similar) and copy your form endpoint URL.
2. Replace `FORM_ENDPOINT` in `script.js` with that URL.
3. Submissions will land in your Formspree dashboard/email — no server required.
