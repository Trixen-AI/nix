import type { IconName } from '@/components/ui/Icon';
import { SITE_DOMAIN, SITE_NAME, SITE_URL, X_URL } from '@/data/site';

// Dashboard routes (React Router, see src/router.tsx).
export const DASHBOARD_URL = '/app';
export const APP_URL = '/app/private-tx';
export const VAULT_URL = '/app/vault';
export const EXPOSURE_URL = '/app/exposure';
export const NETWORK_URL = '/app/network';
export const CONTACT_URL = '#contact';

export type NavLink = { label: string; href: string; external?: boolean; icon?: IconName };

export const NAV_PROTOCOL: { title: string; links: NavLink[] }[] = [
  {
    title: 'Transact',
    links: [
      { label: 'Private TX', href: APP_URL, icon: 'lock' },
      { label: 'Mixer', href: `${APP_URL}?tier=ghost`, icon: 'swirl' },
      { label: 'Bridge', href: NETWORK_URL, icon: 'bridge' },
    ],
  },
  {
    title: 'Protect',
    links: [
      { label: 'Shield Vault', href: VAULT_URL, icon: 'shield' },
      { label: 'Flash batching', href: '#modules', icon: 'bolt' },
      { label: 'Privacy agent', href: EXPOSURE_URL, icon: 'bot' },
    ],
  },
  {
    title: 'Observe',
    links: [
      { label: 'Dashboard', href: DASHBOARD_URL, icon: 'grid' },
      { label: 'Activity', href: '/app/activity', icon: 'chart' },
    ],
  },
];

export const NAV_NETWORK: NavLink[] = [
  { label: 'Network status', href: NETWORK_URL },
  { label: 'Built on Solana', href: '#chains' },
  { label: 'Privacy agent', href: EXPOSURE_URL },
];

export const NAV_RESOURCES: NavLink[] = [
  { label: 'Documentation', href: '#docs', external: true },
  { label: 'Whitepaper', href: '#whitepaper', external: true },
  { label: 'API', href: '#api' },
  { label: 'zksona CLI', href: '#cli' },
  { label: 'Bug bounty', href: '#bounty' },
];

export const HERO = {
  eyebrow: '#00 / private transfers on Solana',
  title: ['Your wallet,', 'off the record.'],
  body: 'ZKSona sends SOL and SPL tokens with a zero-knowledge proof instead of a public trail. The network checks the math. Nobody reads the story.',
  stats: [
    { label: 'Volume shielded', value: '$86.40', tip: 'Average fee: $0.12 per transfer' },
    { label: 'Private transfers', value: '42', tip: 'Every one under $100' },
  ],
  cta: 'Pick a tier',
};

export const INTRO = {
  eyebrow: '#03 / how it stays quiet',
  title: 'The chain only needs the proof',
  body: 'Public ledgers keep who paid whom, how much and when, for good. ZKSona hands the network a zk-SNARK that says the transfer is valid and keeps everything else with you. Relayers carry it across, so no line runs from your wallet to theirs.',
};

export const TIERS = {
  eyebrow: '#05 / tiers',
  title: 'Three levels of quiet',
  body: 'Choose per transfer. Each step up adds hops, a proof or a random wait.',
  cards: [
    {
      label: 'Standard',
      title: 'Break the direct link',
      body: 'Two independent relayers between you and the recipient. Quick, low cost, and the direct link is gone.',
      mock: { hops: 2, amount: '25.00', time: '~40s', zk: false, delay: false },
    },
    {
      label: 'Enhanced',
      title: 'Hide who and how much',
      body: 'Five relayers plus a zero-knowledge proof, so sender, receiver and amount never appear together.',
      mock: { hops: 5, amount: '60.00', time: '~3 min', zk: true, delay: false },
    },
    {
      label: 'Ghost',
      title: 'Beat timing analysis',
      body: 'Ten relayers, a proof and a random wait, so even timing cannot tie what left to what arrived.',
      mock: { hops: 10, amount: '95.00', time: 'randomised', zk: true, delay: true },
    },
  ],
};

export const MODULES = {
  eyebrow: '#04 / modules',
  title: 'Six moving parts, one quiet transfer',
  body: 'Each part removes one clue an observer could use. Use one, or let ZKSona stack all six.',
  cards: [
    {
      n: '001',
      icon: 'lock' as IconName,
      title: 'Proofs, not receipts',
      body: 'zk-SNARK circuits confirm a transfer is valid while sender, receiver and amount stay sealed.',
    },
    {
      n: '002',
      icon: 'swirl' as IconName,
      title: 'Relay mixer',
      body: 'Transfers hop through independent relayers, so deposits and withdrawals never share a visible line.',
    },
    {
      n: '003',
      icon: 'shield' as IconName,
      title: 'Shield Vault',
      body: 'Park assets behind a time lock you set. The balance stays sealed until the date you picked.',
    },
    {
      n: '004',
      icon: 'bridge' as IconName,
      title: 'Inbound bridge',
      body: 'Bring assets onto Solana straight into a shielded pool instead of a public wallet.',
    },
    {
      n: '005',
      icon: 'bot' as IconName,
      title: 'Privacy agent',
      body: 'Reads your own exposure and the live network, then suggests a tier and a good moment to send.',
    },
    {
      n: '006',
      icon: 'bolt' as IconName,
      title: 'Flash batching',
      body: 'Transfers settle in tight batches with MEV protection, so bots cannot front-run what they cannot read.',
    },
  ],
};

export const SPLIT = {
  problem: {
    eyebrow: '#02 / the problem',
    title: 'Every address is a paper trail',
    body: 'Explorers, analytics desks and trading bots index each wallet you touch. One reused address can connect your salary, savings and spending in an afternoon. ZKSona swaps what they read for commitments and proofs: the books still balance, the story stays with you.',
    rows: [
      { a: ['From', '7xKq...9fPd'], c: ['Amount', '18 USDC'] },
      { a: ['To', 'Dh3v...Qm2A'], c: ['Token', 'USDC'] },
      { a: ['Commitment', 'zk:7c1e...f0'], c: ['Amount', '••••••••'] },
      { a: ['From', 'Bq9T...4LkE'], c: ['Amount', '0.4 SOL'] },
      { a: ['To', 'Hn6W...c3R8'], c: ['Token', 'SOL'] },
    ],
  },
  control: {
    eyebrow: '#02 / custody',
    title: 'Nobody holds your keys but you',
    body: 'ZKSona never takes custody. Proofs are built on your device, relayers only carry sealed payloads, and every circuit and contract is open to audit. If a tool protects your privacy, you should be able to check it.',
  },
};

export const STORIES = {
  eyebrow: '#06 / walkthrough',
  title: 'One module at a time',
  body: 'What each part does, and the command that starts it.',
  slides: [
    {
      tag: 'Private TX',
      href: APP_URL,
      title: 'Private TX: one signature, no trail',
      body: 'Pick the asset, the recipient and a tier, then sign once. Proof, hops and settlement run behind that single approval.',
      prompt: '$ zksona send --to 7xKq... --amount 25 --tier enhanced',
      tint: 'orange',
    },
    {
      tag: 'Mixer',
      href: `${APP_URL}?tier=ghost`,
      title: 'Relay mixer: many hops, no line',
      body: 'Deposits join a shared pool, relayers pass them along, and withdrawals leave with nothing pointing back.',
      prompt: '$ zksona mix --hops 5',
      tint: 'sky',
    },
    {
      tag: 'Shield Vault',
      href: VAULT_URL,
      title: 'Shield Vault: out of sight until you say so',
      body: 'Lock assets with a release date. The balance stays sealed until then, and only your key opens it.',
      prompt: '$ zksona vault lock --until 2026-12-31',
      tint: 'mint',
    },
    {
      tag: 'Bridge',
      href: NETWORK_URL,
      title: 'Inbound bridge: arrive already private',
      body: 'Assets coming onto Solana land in a shielded pool, not a public wallet, so the trail starts cold.',
      prompt: '$ zksona bridge --to solana --asset USDC',
      tint: 'orange',
    },
    {
      tag: 'Privacy agent',
      href: EXPOSURE_URL,
      title: 'Privacy agent: advice from your own data',
      body: 'It scores what your history gives away and checks how busy the network is, then suggests a tier and a time.',
      prompt: '$ zksona agent --scan my-wallet',
      tint: 'sky',
    },
    {
      tag: 'Network',
      href: NETWORK_URL,
      title: 'Network watch: see the crowd, not the people',
      body: 'Live load, fees and crowd size for Solana, so you know when a transfer has the most company.',
      prompt: '$ zksona stats --network mainnet',
      tint: 'mint',
    },
  ],
};

export const DEV = {
  eyebrow: '#07 / cli',
  titleAccent: 'Stay quiet from the terminal',
  titleRest: 'with one command',
  body: 'The zksona CLI opens a sealed session on Solana, loads the circuits and joins the relayer network. Script it, pipe it, schedule it.',
  cardTitle: 'zksona CLI · sealed session',
  docs: 'Docs',
};

export const MARQUEE = {
  label: '#01 / settles on Solana',
};

export const CTA = {
  eyebrow: '#08 / contact',
  title: 'Building something that should stay private? Tell us about it.',
  button: 'Send message',
  form: {
    titleLabel: 'Title',
    titlePlaceholder: 'Integration, audit, partnership...',
    messageLabel: 'Message',
    messagePlaceholder: 'A few lines about what you are building',
  },
  sent: 'Message noted. This preview does not send anything yet.',
};

export type FooterGroup = { title: string; links: NavLink[] };

export const FOOTER: FooterGroup[][] = [
  [
    {
      title: 'Protocol',
      links: [
        { label: 'Home', href: '#top' },
        { label: 'Dashboard', href: DASHBOARD_URL },
        { label: 'Private TX', href: APP_URL },
        { label: 'Mixer', href: `${APP_URL}?tier=ghost` },
        { label: 'Network status', href: NETWORK_URL },
      ],
    },
  ],
  [
    {
      title: 'Privacy',
      links: [
        { label: 'Shield Vault', href: VAULT_URL },
        { label: 'Bridge', href: '#modules' },
        { label: 'Exposure scan', href: EXPOSURE_URL },
        { label: 'Activity', href: '/app/activity' },
        { label: 'Flash batching', href: '#modules' },
      ],
    },
  ],
  [
    {
      title: 'Community',
      links: [{ label: 'X', href: X_URL, external: true }],
    },
  ],
  [
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs', external: true },
        { label: 'Whitepaper', href: '#whitepaper', external: true },
        { label: 'API', href: '#api' },
        { label: 'Bug bounty', href: '#bounty' },
      ],
    },
  ],
  [
    {
      title: 'Legal',
      links: [
        { label: 'Terms', href: '#terms' },
        { label: 'Privacy policy', href: '#privacy' },
        { label: 'Brand assets', href: `${SITE_URL}/brand/logo.svg` },
        { label: 'Contact', href: CONTACT_URL },
      ],
    },
  ],
];

export const FOOTER_LINE = `2026 ${SITE_NAME.toUpperCase()} /// ${SITE_DOMAIN.toUpperCase()} /// PRIVACY IS A HUMAN RIGHT`;

