import type { IconName } from '@/components/ui/Icon';
import { SITE_DOMAIN, SITE_NAME, SITE_URL, X_URL } from '@/data/site';

export const APP_URL = '#private-tx';
export const DASHBOARD_URL = '#dashboard';
export const CONTACT_URL = '#contact';

export type NavLink = { label: string; href: string; external?: boolean; icon?: IconName };

export const NAV_PROTOCOL: { title: string; links: NavLink[] }[] = [
  {
    title: 'Transact',
    links: [
      { label: 'Private TX', href: '#private-tx', icon: 'lock' },
      { label: 'Mixer', href: '#modules', icon: 'swirl' },
      { label: 'Bridge', href: '#modules', icon: 'bridge' },
    ],
  },
  {
    title: 'Protect',
    links: [
      { label: 'Shield Vault', href: '#modules', icon: 'shield' },
      { label: 'Flash Obfuscation', href: '#modules', icon: 'bolt' },
      { label: 'AI Privacy Agent', href: '#modules', icon: 'bot' },
    ],
  },
  {
    title: 'Observe',
    links: [
      { label: 'Dashboard', href: DASHBOARD_URL, external: true, icon: 'grid' },
      { label: 'Analytics', href: '#analytics', external: true, icon: 'chart' },
    ],
  },
];

export const NAV_NETWORK: NavLink[] = [
  { label: 'Relayer network', href: '#network' },
  { label: 'Supported chains', href: '#chains' },
  { label: 'AI Chat', href: '#ai-chat', external: true },
  { label: 'Network status', href: '#status', external: true },
];

export const NAV_RESOURCES: NavLink[] = [
  { label: 'Documentation', href: '#docs', external: true },
  { label: 'Whitepaper', href: '#whitepaper', external: true },
  { label: 'API', href: '#api' },
  { label: 'nixshield CLI', href: '#cli' },
  { label: 'Bug bounty', href: '#bounty' },
];

export const HERO = {
  eyebrow: '/// quiet by default',
  title: ['Move value', 'without a trail.'],
  body: 'Nix Shield is zero-knowledge privacy infrastructure for the open web. Shield, route and settle transactions so the chain can verify them, and nobody else can read them.',
  stats: [
    { label: 'Volume shielded', value: '$86.40', tip: 'Average fee $0.12 per private transaction' },
    { label: 'Private transactions', value: '42', tip: 'Each one under $100' },
  ],
  cta: 'Initialize TX',
};

export const INTRO = {
  title: 'A public ledger should not be a public diary',
  body: 'Every transfer on a transparent chain tells the world who paid whom, how much and when. Nix Shield keeps the proof and drops the story: a zk-SNARK shows the transaction is valid, relayers break the link between wallets, and what lands onchain says nothing about you.',
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
  body: 'Each layer removes one thing an observer could use. Run them alone or let Nix Shield stack them for you.',
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
      title: 'Cross-chain bridge',
      body: 'Private bridging across Ethereum, Solana, Arbitrum and 12+ more chains, with no public hop in between.',
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
    body: 'Block explorers, analytics firms and bots index every address you touch. One reused wallet can link your salary, your savings and your spending in minutes. Nix Shield replaces what they read with commitments and proofs, so the ledger still balances and your history stays yours.',
    rows: [
      { a: ['From', '0x4f1c...9a02'], c: ['Amount', '18 USDC'] },
      { a: ['To', '0x88be...12d7'], c: ['Token', 'USDC'] },
      { a: ['Commitment', 'zk:7c1e...f0'], c: ['Amount', '••••••••'] },
      { a: ['From', '0x0b93...44ae'], c: ['Amount', '72 USDC'] },
      { a: ['To', '0x71fa...c3b8'], c: ['Token', 'ETH'] },
    ],
  },
  control: {
    title: 'Your keys, your proofs, your call',
    body: 'Nix Shield never takes custody. Proofs are generated on your device, relayers only see encrypted payloads, and the circuits and contracts are open for anyone to audit. Privacy is a human right, so the tools that protect it should be verifiable too.',
  },
};

export const STORIES = {
  title: 'Inside the system, module by module, from first send to final stats',
  body: 'What each part does, and the command that starts it.',
  slides: [
    {
      tag: 'Private TX',
      title: 'Private TX - send without a paper trail',
      body: 'Enter origin, destination and amount, choose a tier, sign once. The proof, the hops and the settlement all happen behind one button.',
      prompt: '$ nixshield send --to 0x... --amount 25 --tier enhanced',
      tint: 'mint',
    },
    {
      tag: 'Mixer',
      title: 'Cyclone Mixer - many hops, no line',
      body: 'Deposits join a shared pool, relayers pass them through independent hops, and withdrawals leave with no link back to the source.',
      prompt: '$ nixshield mix --hops 5',
      tint: 'fog',
    },
    {
      tag: 'Shield Vault',
      title: 'Shield Vault - park assets out of sight',
      body: 'Lock assets in an encrypted vault with a release time you choose. Balances stay hidden until you decide to move them.',
      prompt: '$ nixshield vault lock --until 2026-12-31',
      tint: 'mint',
    },
    {
      tag: 'Bridge',
      title: 'Bridge - cross chains quietly',
      body: 'Move assets between Ethereum, Solana, Arbitrum and 12+ other networks without a traceable hop on either side.',
      prompt: '$ nixshield bridge --from ethereum --to solana',
      tint: 'fog',
    },
    {
      tag: 'AI Agent',
      title: 'AI privacy agent - routing that adapts',
      body: 'Ask in chat for the most private route right now. The agent reads network conditions and suggests a tier and a time window.',
      prompt: '"What is the quietest route for 80 USDC tonight?"',
      tint: 'mint',
    },
    {
      tag: 'Analytics',
      title: 'Analytics - see the network, not the people',
      body: 'Pool sizes, relayer health and anonymity-set depth, all aggregated. Nothing on the dashboard points back to a wallet.',
      prompt: '$ nixshield stats --pool eth',
      tint: 'fog',
    },
  ],
};

export const DEV = {
  titleAccent: 'Go quiet from the terminal',
  titleRest: 'in one command',
  body: 'The nixshield CLI opens a stealth session, loads the circuits and connects you to the relayer network. Script it, pipe it, ship it.',
  cardTitle: 'nixshield CLI - stealth session',
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
        { label: 'Dashboard', href: DASHBOARD_URL, external: true },
        { label: 'Private TX', href: '#private-tx' },
        { label: 'Mixer', href: '#modules' },
        { label: 'Network status', href: '#status', external: true },
      ],
    },
  ],
  [
    {
      title: 'Privacy',
      links: [
        { label: 'Shield Vault', href: '#modules' },
        { label: 'Bridge', href: '#modules' },
        { label: 'Analytics', href: '#analytics', external: true },
        { label: 'AI Agent', href: '#ai-chat', external: true },
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

