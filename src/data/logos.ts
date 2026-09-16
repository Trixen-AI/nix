// Official chain logos, stored byte-for-byte in src/assets/chains (sources in SOURCES.md).
// They are inlined unmodified; only the rendered height is set here.
// Loaded lazily so the vector files stay out of the main bundle.
const files = import.meta.glob<string>('../assets/chains/*.svg', { query: '?raw', import: 'default' });

type LogoDef = { key: string; name: string; height: number };

// Ethereum and Arbitrum ship with clear space inside their viewBox, so they render taller.
const ORDER: LogoDef[] = [
  { key: 'ethereum', name: 'Ethereum', height: 128 },
  { key: 'solana', name: 'Solana', height: 30 },
  { key: 'arbitrum', name: 'Arbitrum', height: 72 },
];

export type ProtocolLogo = LogoDef & { svg: string };

export async function loadProtocolLogos(): Promise<ProtocolLogo[]> {
  const loaded = await Promise.all(
    ORDER.map(async (d) => {
      const load = files[`../assets/chains/${d.key}.svg`];
      return load ? { ...d, svg: await load() } : null;
    }),
  );
  return loaded.filter((l): l is ProtocolLogo => l !== null);
}
