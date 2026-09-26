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
      { label: 'Flash Obfuscation', href: '#modules', icon: 'bolt' },
      { label: 'Privacy Agent', href: EXPOSURE_URL, icon: 'bot' },
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
  { label: 'zentry CLI', href: '#cli' },
  { label: 'Bug bounty', href: '#bounty' },
];

export const HERO = {
  eyebrow: '/// quiet by default',
  title: ['Move value', 'without a trail.'],
  body: 'Zentry is zero-knowledge privacy infrastructure for Solana. Shield, route and settle SOL and SPL token transfers so the chain can verify them, and nobody else can read them.',
  stats: [
    { label: 'Volume shielded', value: '$86.40', tip: 'Average fee $0.12 per private transaction' },
    { label: 'Private transactions', value: '42', tip: 'Each one under $100' },
  ],
  cta: 'Initialize TX',
};

export const INTRO = {
  title: 'A public ledger should not be a public diary',
  body: 'Every transfer on a transparent chain tells the world who paid whom, how much and when. Zentry keeps the proof and drops the story: a zk-SNARK shows the transaction is valid, relayers break the link between wallets, and what lands onchain says nothing about you.',
};

export const TIERS = {
  title: 'Pick how quiet you want to be',
  body: 'Every private transaction runs on one of three tiers. More hops, more cover.',
  cards: [
    {
      label: 'Standard',
      title: '2-hop mixing',
      body: 'Two relayer hops between origin and destination. Fast, cheap and enough to break a direct link.',
      mock: { hops: 2, amount: '25.00', time: '~40s', zk: false, delay: false },
    },
    {
      label: 'Enhanced',
      title: '5-hop + zk',
      body: 'Five hops plus a zero-knowledge proof, so validity is checked without revealing sender, receiver or amount.',
      mock: { hops: 5, amount: '60.00', time: '~3 min', zk: true, delay: false },
    },
    {
      label: 'Ghost',
      title: '10-hop + time',
      body: 'Ten hops, a proof and a randomised delay, so timing cannot be used to match what went in with what came out.',
      mock: { hops: 10, amount: '95.00', time: 'randomised', zk: true, delay: true },
    },
  ],
};

export const MODULES = {
  title: 'Core systems: six layers between your wallet and the watchers',
  body: 'Each layer removes one thing an observer could use. Run them alone or let Zentry stack them for you.',
  cards: [
    {
      n: '001',
      icon: 'lock' as IconName,
      title: 'Zero-knowledge proofs',
      body: 'zk-SNARK circuits prove a transfer is valid without exposing sender, receiver or amount.',
    },
    {
      n: '002',
      icon: 'swirl' as IconName,
      title: 'Cyclone Mixer',
      body: 'Multi-hop routing through independent relayers cuts the onchain line between deposit and withdrawal.',
    },
    {
      n: '003',
      icon: 'shield' as IconName,
      title: 'Shield Vault',
      body: 'Time-locked, encrypted storage for assets you are not moving yet, built on post-quantum primitives.',
    },
    {
      n: '004',
      icon: 'bridge' as IconName,
      title: 'Solana bridge',
      body: 'Bring assets onto Solana privately. They land in a shielded pool, not a public wallet, with no public hop in between.',
    },
    {
      n: '005',
      icon: 'bot' as IconName,
      title: 'AI privacy agent',
      body: 'Watches relayer load and network conditions, then picks the route with the largest crowd to blend into.',
    },
    {
      n: '006',
      icon: 'bolt' as IconName,
      title: 'Flash obfuscation',
      body: 'Sub-second batching with MEV protection, so bots cannot front-run a transaction they cannot read.',
    },
  ],
};

export const SPLIT = {
  problem: {
    title: 'Transparent by default means exposed by default',
    body: 'Block explorers, analytics firms and bots index every address you touch. One reused wallet can link your salary, your savings and your spending in minutes. Zentry replaces what they read with commitments and proofs, so the ledger still balances and your history stays yours.',
    rows: [
      { a: ['From', '7xKq...9fPd'], c: ['Amount', '18 USDC'] },
      { a: ['To', 'Dh3v...Qm2A'], c: ['Token', 'USDC'] },
      { a: ['Commitment', 'zk:7c1e...f0'], c: ['Amount', '••••••••'] },
      { a: ['From', 'Bq9T...4LkE'], c: ['Amount', '0.4 SOL'] },
      { a: ['To', 'Hn6W...c3R8'], c: ['Token', 'SOL'] },
    ],
  },
  control: {
    title: 'Your keys, your proofs, your call',
    body: 'Zentry never takes custody. Proofs are generated on your device, relayers only see encrypted payloads, and the circuits and contracts are open for anyone to audit. Privacy is a human right, so the tools that protect it should be verifiable too.',
  },
};

export const STORIES = {
  title: 'Inside the system, module by module, from first send to final stats',
  body: 'What each part does, and the command that starts it.',
  slides: [
    {
      tag: 'Private TX',
      href: APP_URL,
      title: 'Private TX - send without a paper trail',
      body: 'Enter origin, destination and amount, choose a tier, sign once. The proof, the hops and the settlement all happen behind one button.',
      prompt: '$ zentry send --to 7xKq... --amount 25 --tier enhanced',
      tint: 'violet',
    },
    {
      tag: 'Mixer',
      href: `${APP_URL}?tier=ghost`,
      title: 'Cyclone Mixer - many hops, no line',
      body: 'Deposits join a shared pool, relayers pass them through independent hops, and withdrawals leave with no link back to the source.',
      prompt: '$ zentry mix --hops 5',
      tint: 'fog',
    },
    {
      tag: 'Shield Vault',
      href: VAULT_URL,
      title: 'Shield Vault - park assets out of sight',
      body: 'Lock assets in an encrypted vault with a release time you choose. Balances stay hidden until you decide to move them.',
      prompt: '$ zentry vault lock --until 2026-12-31',
      tint: 'violet',
    },
    {
      tag: 'Bridge',
      href: NETWORK_URL,
      title: 'Bridge - arrive on Solana quietly',
      body: 'Bring assets onto Solana without a traceable hop on the way in. They land in a shielded pool, ready to move privately.',
      prompt: '$ zentry bridge --to solana --asset USDC',
      tint: 'fog',
    },
    {
      tag: 'AI Agent',
      href: EXPOSURE_URL,
      title: 'AI privacy agent - routing that adapts',
      body: 'Ask in chat for the most private route right now. The agent reads network conditions and suggests a tier and a time window.',
      prompt: '"What is the quietest route for 80 USDC tonight?"',
      tint: 'violet',
    },
    {
      tag: 'Analytics',
      href: NETWORK_URL,
      title: 'Analytics - see the network, not the people',
      body: 'Pool sizes, relayer health and anonymity-set depth, all aggregated. Nothing on the dashboard points back to a wallet.',
      prompt: '$ zentry stats --pool sol',
      tint: 'fog',
    },
  ],
};

export const DEV = {
  titleAccent: 'Go quiet from the terminal',
  titleRest: 'in one command',
  body: 'The zentry CLI opens a stealth session on Solana, loads the circuits and connects you to the relayer network. Script it, pipe it, ship it.',
  cardTitle: 'zentry CLI - stealth session',
  docs: 'Docs',
};

export const CTA = {
  title: 'Privacy is a human right. Tell us what you want to build with it.',
  button: 'Send message',
  form: {
    titleLabel: 'Title',
    titlePlaceholder: 'Integration, audit, partnership...',
    messageLabel: 'Message',
    messagePlaceholder: 'A few lines about your project',
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
        { label: 'Flash Obfuscation', href: '#modules' },
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

