# Zentry

Landing page for Zentry, zero-knowledge privacy infrastructure for Solana. Live domain: https://zentry-shield.xyz

Built with Vite, React 19 and TypeScript. Carousels use Swiper 8, and the shield scene uses three.js (loaded lazily).
The product dashboard lives at `/app` (React Router, Reown AppKit for Solana wallets, TanStack Query for live data).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Dashboard (`/app`)

Copy `.env.example` to `.env.local` and fill it in (`.env.local` is gitignored; keep keys out of `.env`, which is committed):

| Variable | Required | What it does |
|---|---|---|
| `VITE_REOWN_PROJECT_ID` | Yes | Reown (WalletConnect) project ID from cloud.reown.com. Add `zentry-shield.xyz` and `localhost` to the project's allowed domains. Without it the dashboard shows a setup screen. |
| `VITE_SOLANA_RPC_URL` | Recommended | Dedicated mainnet RPC (Helius, Triton, QuickNode...). Without it, reads go through Reown's shared RPC, which often returns only recent transaction history. |
| `VITE_SOLANA_DEVNET_RPC_URL` | No | Same, for devnet. |

| Page | Route | Data |
|---|---|---|
| Overview | `/app` | Balance, exposure score, privacy agent suggestion, recent activity, network load |
| Private TX | `/app/private-tx` | Composer on real balances, destination checks against your history, live fee estimate, Approve (wallet signature) |
| Shield Vault | `/app/vault` | Time-lock composer on real balances, Approve (wallet signature) |
| Exposure | `/app/exposure` | Privacy report for your wallet or any pasted address (`?address=`) |
| Activity | `/app/activity` | Transaction history with linking details flagged |
| Assets | `/app/assets` | SOL and SPL balances, Jupiter prices |
| Network | `/app/network` | Live TPS, fees, crowd size, program status (works without a wallet) |

**Approve** asks the wallet to sign a plain-text message describing the request (`signMessage`, no transaction). Signed approvals are kept in the browser per wallet and cluster (`src/app/lib/approvals.ts`) and listed under Approvals. No funds move: executing private transfers and vault locks needs the Zentry program and relayers, which are not deployed yet.

## Where things live

| What | File |
|---|---|
| Domain, site name, X profile | `.env` (`VITE_SITE_URL`) and `src/data/site.ts` |
| All page copy, nav and footer links | `src/data/content.ts` |
| SEO tags, Open Graph, JSON-LD | `index.html` (uses `%VITE_SITE_URL%`) |
| robots.txt, sitemap.xml, manifest | `public/` |
| Design tokens (colours, type, spacing) | `src/styles/tokens.css` |
| Routes | `src/router.tsx` |
| Dashboard (pages, data, styles) | `src/app/` |
| Solana logo (official file, unmodified) | `src/assets/chains/` (sources in `SOURCES.md`) |

The domain also appears literally in `public/robots.txt`, `public/sitemap.xml`, `vercel.json` and `netlify.toml`. Update those too if it changes.

## Logo and icons

The logo, favicon, OG image and app icons are generated from one script:

```bash
node scripts/build-logo.mjs
```

It writes `public/brand/*`, `public/favicon.svg`, `public/og-image.png`, the app icons and `src/data/logo.ts`.

## Deploy (Vercel)

`vercel.json` sets the Vite build (`npm ci`, `npm run build`, output `dist`), the single-page rewrite so `/app/*` routes load, a `www` to apex redirect, security and cache headers, and `noindex` for `/app`. Node 22 is required (`engines` in `package.json`).

1. In Vercel, choose **Add New → Project**, import `Trixen-AI/nix` from GitHub. The Vite preset and the settings above are picked up automatically.
2. Under **Settings → Environment Variables**, add these for **Production** and **Preview**:

   | Name | Value | Needed |
   |---|---|---|
   | `VITE_REOWN_PROJECT_ID` | Your project ID from cloud.reown.com | Required. Without it the dashboard shows a setup screen. |
   | `VITE_SOLANA_RPC_URL` | A mainnet RPC URL, e.g. `https://mainnet.helius-rpc.com/?api-key=...` | Recommended. Full transaction history for Activity and Exposure. |
   | `VITE_SOLANA_DEVNET_RPC_URL` | A devnet RPC URL | Optional. Leave unset to use Reown's devnet RPC. |
   | `VITE_SITE_URL` | `https://zentry-shield.xyz` | Optional. Already set in the committed `.env`. |

   `VITE_*` values are built into the browser bundle, so they are visible to visitors. Lock them down at the provider: allow `zentry-shield.xyz` (and `localhost`) in the Reown project, and restrict the RPC key to the same domains in Helius.
3. Deploy. Changing an environment variable needs a redeploy to take effect.
4. Under **Settings → Domains**, add `zentry-shield.xyz` and `www.zentry-shield.xyz`, then set the DNS records Vercel shows (A record for the apex, CNAME for `www`).

## Deploy (Netlify)

`netlify.toml` already sets the build command (`npm run build`), the publish folder (`dist`), Node 22, a www to apex redirect and security and cache headers.

1. In Netlify, choose **Add new site → Import an existing project** and pick this GitHub repo.
2. Under **Site configuration → Environment variables**, add `VITE_REOWN_PROJECT_ID` (and `VITE_SOLANA_RPC_URL` if you have one).
3. Keep the detected settings and deploy.
4. Under **Domain management**, add `zentry-shield.xyz` (and `www.zentry-shield.xyz`), then point the domain's DNS at Netlify.
