// Main domain and brand identity, shared by the app. index.html reads the same value via %VITE_SITE_URL%.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://nixshield.org').replace(/\/$/, '');
export const SITE_NAME = 'Nix Shield';
export const SITE_DOMAIN = new URL(SITE_URL).host;
export const X_HANDLE = '@NixShield';
export const X_URL = 'https://x.com/NixShield';
