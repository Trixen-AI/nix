// Reown AppKit, created once when the dashboard chunk loads. Solana only: mainnet by default, devnet selectable.
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaDevnet } from '@reown/appkit/networks';
import { REOWN_PROJECT_ID } from '@/app/config';
import { SITE_NAME } from '@/data/site';

export const appKitReady = REOWN_PROJECT_ID.length > 0;

if (appKitReady) {
  const origin = window.location.origin;
  createAppKit({
    adapters: [new SolanaAdapter()],
    networks: [solana, solanaDevnet],
    defaultNetwork: solana,
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: SITE_NAME,
      description: 'Zero-knowledge privacy for Solana transactions.',
      url: origin,
      icons: [`${origin}/icon-512.png`],
    },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#f98500',
      '--w3m-color-mix': '#0a0a0b',
      '--w3m-color-mix-strength': 0,
      '--w3m-font-family': "'Bricolage Grotesque Variable', 'Helvetica Neue', Arial, sans-serif",
      '--w3m-border-radius-master': '4px',
      '--w3m-z-index': 1000,
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
    },
  });
}
