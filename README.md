# Nix Shield

Landing page for Nix Shield, zero-knowledge privacy infrastructure. Live domain: https://nixshield.org

Built with Vite, React 19 and TypeScript. Carousels use Swiper 8, and the shield scene uses three.js (loaded lazily).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Where things live

| What | File |
|---|---|
| Domain, site name, X profile | `.env` (`VITE_SITE_URL`) and `src/data/site.ts` |
| All page copy, nav and footer links | `src/data/content.ts` |
| SEO tags, Open Graph, JSON-LD | `index.html` (uses `%VITE_SITE_URL%`) |
| robots.txt, sitemap.xml, manifest | `public/` |
| Design tokens (colours, type, spacing) | `src/styles/tokens.css` |
| Chain logos (official files, unmodified) | `src/assets/chains/` (sources in `SOURCES.md`) |

The domain also appears literally in `public/robots.txt`, `public/sitemap.xml` and `netlify.toml`. Update those too if it changes.

## Logo and icons

The logo, favicon, OG image and app icons are generated from one script:

```bash
node scripts/build-logo.mjs
```

It writes `public/brand/*`, `public/favicon.svg`, `public/og-image.png`, the app icons and `src/data/logo.ts`.

## Deploy (Netlify)

`netlify.toml` already sets the build command (`npm run build`), the publish folder (`dist`), Node 22, a www to apex redirect and security and cache headers.

1. In Netlify, choose **Add new site → Import an existing project** and pick this GitHub repo.
2. Keep the detected settings and deploy.
3. Under **Domain management**, add `nixshield.org` (and `www.nixshield.org`), then point the domain's DNS at Netlify.
