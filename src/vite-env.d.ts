/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  /** Reown (WalletConnect) Cloud project ID. Required for wallet connection. */
  readonly VITE_REOWN_PROJECT_ID?: string;
  /** Optional Solana mainnet RPC endpoint. Defaults to Reown's RPC for the project ID above. */
  readonly VITE_SOLANA_RPC_URL?: string;
  /** Optional Solana devnet RPC endpoint. Defaults to Reown's RPC for the project ID above. */
  readonly VITE_SOLANA_DEVNET_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
