// Main domain and brand identity, shared by the app. index.html reads the same value via %VITE_SITE_URL%.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://zentry-shield.xyz').replace(/\/$/, '');
export const SITE_NAME = 'Zentry';
export const SITE_DOMAIN = new URL(SITE_URL).host;
export const X_HANDLE = '@Zentry_xyz';
export const X_URL = 'https://x.com/Zentry_xyz';
/** Zentry token contract address (Solana mint). */
export const CONTRACT_ADDRESS = 'HZDZaDD1UQTiVttNxxagiqgkYAmTsTG8fvwNHoTspump';
