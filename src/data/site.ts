// Main domain and brand identity, shared by the app. index.html reads the same value via %VITE_SITE_URL%.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://zksona.org').replace(/\/$/, '');
export const SITE_NAME = 'ZKSona';
export const SITE_DOMAIN = new URL(SITE_URL).host;
export const X_HANDLE = '@ZKSonaApp';
export const X_URL = 'https://x.com/ZKSonaApp';
