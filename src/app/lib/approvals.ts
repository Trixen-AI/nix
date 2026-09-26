// Signed approvals for private transfers and vault locks. The wallet signs a plain-text request (signMessage),
// which is kept in this browser per wallet and cluster. Signing a message never moves funds.
import { useCallback, useState } from 'react';
import type { Cluster } from '@/app/config';

export type ApprovalKind = 'private-tx' | 'vault';

export type Approval = {
  id: string;
  kind: ApprovalKind;
  wallet: string;
  cluster: Cluster;
  /** One-line summary, e.g. "1.5 SOL to 5tzF...uAi9, Ghost". */
  summary: string;
  /** Hex of the wallet's ed25519 signature over `message`. */
  signature: string;
  message: string;
  createdAt: number;
};

const KEY = 'zentry.approvals.v1';
const MAX = 50;

function readAll(): Approval[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Approval[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Approval[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage blocked: approvals still show for this session */
  }
}

export const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export function approvalMessage(lines: [string, string][], title: string) {
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(8)));
  return [
    title,
    '',
    ...lines.map(([k, v]) => `${k}: ${v}`),
    `Nonce: ${nonce}`,
    `Issued: ${new Date().toISOString()}`,
    '',
    'This signature approves the request. It does not move funds.',
  ].join('\n');
}

/** Approvals for one wallet on one cluster, newest first. */
export function useApprovals(wallet: string, cluster: Cluster, kind: ApprovalKind) {
  const filter = useCallback((list: Approval[]) => list.filter((a) => a.wallet === wallet && a.cluster === cluster && a.kind === kind), [wallet, cluster, kind]);
  const [items, setItems] = useState(() => filter(readAll()));

  const add = (a: Omit<Approval, 'id' | 'createdAt' | 'wallet' | 'cluster' | 'kind'>) => {
    const entry: Approval = { ...a, id: crypto.randomUUID(), createdAt: Date.now(), wallet, cluster, kind };
    const all = [entry, ...readAll()];
    writeAll(all);
    setItems(filter(all));
    return entry;
  };
  const clear = () => {
    const rest = readAll().filter((a) => !(a.wallet === wallet && a.cluster === cluster && a.kind === kind));
    writeAll(rest);
    setItems([]);
  };
  return { items, add, clear };
}
