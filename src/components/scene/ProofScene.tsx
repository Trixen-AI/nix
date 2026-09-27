import { useCanvas, type DrawFn } from './useCanvas';

// "The chain only needs the proof": a transfer card with readable fields slides into the ZKSona prover,
// its fields turn to dots, and only a small proof chip comes out and lands on the Solana block row,
// which lights up VALID. Canvas 2D, time-based, fills only.

const INK = '#0a0a0b';
const MIST = '#f3f3f3';
const LINE = '#e2e2e2';
const ORANGE = '#f98500';
const MINT = '#71cfa3';
const MUTED = 'rgba(10, 10, 11, 0.5)';
const MONO = '"Martian Mono Variable", ui-monospace, monospace';

const CYCLE = 4.4;
const T_SLIDE = 0.36;
const T_CHIP_START = 0.4;
const T_CHIP_END = 0.62;
const T_LAND = 0.74;
const T_SHIFT = 0.78;
const REDUCED_TIME = CYCLE * 0.7;

const TRANSFERS = [
  ['7xKq...9fPd', 'Dh3v...Qm2A', '18 USDC'],
  ['Bq9T...4LkE', 'Hn6W...c3R8', '0.4 SOL'],
  ['9vRa...E19c', 'Fz2P...7kQa', '25 USDC'],
  ['Cm8D...u2Wn', '4tYh...Lp9s', '60 USDC'],
];
const FIELDS = ['FROM', 'TO', 'AMT'];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color = MUTED,
  align: CanvasTextAlign = 'center',
  backed = false,
) {
  ctx.font = `500 ${size}px ${MONO}`;
  if (backed) {
    // White backing so lanes and the dot field never run through the text.
    const tw = ctx.measureText(text).width;
    const left = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(left - 6, y - size * 0.8, tw + 12, size * 1.6);
  }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function transferCard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cw: number,
  ch: number,
  u: number,
  data: string[],
  redact: number,
  alpha: number,
) {
  ctx.globalAlpha = alpha;
  rrect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, u * 0.35, MIST);
  const fs = Math.max(9, Math.min(12, u * 0.36));
  const rowH = ch / 3.4;
  for (let i = 0; i < 3; i++) {
    const y = cy - ch / 2 + rowH * (i + 0.85);
    label(ctx, FIELDS[i], cx - cw / 2 + u * 0.3, y, fs * 0.85, MUTED, 'left');
    const shown = i < Math.floor(redact * 4) ? '••••••' : data[i];
    label(ctx, shown, cx + cw / 2 - u * 0.3, y, fs, INK, 'right');
  }
  ctx.globalAlpha = 1;
}

function prover(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  rrect(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.25, ORANGE);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx - s * 0.03, cy + s * 0.06, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(cx + s * 0.12, cy - s * 0.06, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

const draw: DrawFn = (ctx, w, h, time, reduced) => {
  const t = reduced ? REDUCED_TIME : time;
  const cycle = Math.floor(t / CYCLE);
  const p = (t % CYCLE) / CYCLE;
  // Landscape flows left to right; portrait (phones) flows top to bottom into the block row.
  const portrait = w < h * 0.9;
  const u = portrait ? Math.min(w / 7.5, h / 13) : Math.min(w / 14, h / 7);

  ctx.clearRect(0, 0, w, h);

  // faint dot field
  ctx.fillStyle = 'rgba(10, 10, 11, 0.07)';
  const gap = Math.max(18, u * 0.8);
  for (let x = gap / 2; x < w; x += gap) for (let y = gap / 2; y < h; y += gap) ctx.fillRect(x, y, 1.5, 1.5);

  // layout
  const cw = portrait ? Math.min(w * 0.78, u * 5.2) : u * 3.4;
  const ch = u * 2.2;
  const ps = u * 2.6;
  const bs = u * 1.3;
  const step = u * 1.75;
  const fs = Math.max(9, Math.min(12, u * 0.36));
  const sx = portrait ? w / 2 : w * 0.05 + cw / 2;
  const sy = portrait ? h * 0.2 : h / 2;
  const px = portrait ? w / 2 : w * 0.44;
  const py = portrait ? h * 0.5 : h / 2;
  const rowY = portrait ? h * 0.82 : h / 2;
  const chainX = portrait ? w / 2 - 1.5 * step : w * 0.62;
  const minX = portrait ? bs / 2 + 4 : px + ps / 2 + u * 0.2;
  const maxX = w - bs / 2 - 4;

  // lanes (thin fills, no strokes)
  ctx.fillStyle = LINE;
  if (portrait) {
    ctx.fillRect(px - 0.75, sy, 1.5, rowY - sy);
    ctx.fillRect(0, rowY - 0.75, w, 1.5);
  } else {
    ctx.fillRect(sx, py - 0.75, px - sx, 1.5);
    ctx.fillRect(px, py - 0.75, w - px, 1.5);
  }

  // labels
  if (portrait) {
    label(ctx, 'YOUR TRANSFER', sx, sy - ch / 2 - u * 0.45, fs, MUTED, 'center', true);
    label(ctx, 'ZKSONA PROVER', px, py + ps / 2 + u * 0.5, fs, MUTED, 'center', true);
    label(ctx, 'SOLANA / PROOF ONLY', w / 2, rowY - bs / 2 - u * 0.45, fs, MUTED, 'center', true);
  } else {
    label(ctx, 'YOUR TRANSFER', sx, sy - ch / 2 - u * 0.55, fs, MUTED, 'center', true);
    label(ctx, 'ZKSONA PROVER', px, py + ps / 2 + u * 0.55, fs, MUTED, 'center', true);
    label(ctx, 'SOLANA / PROOF ONLY', chainX + step * 1.5, rowY - bs / 2 - u * 0.55, fs, MUTED, 'center', true);
  }

  // chain blocks: the last slot receives this cycle's proof, then the row shifts left
  const shift = easeInOut(seg(p, T_SHIFT, 1));
  const land = seg(p, T_CHIP_END, T_LAND);
  for (let i = -1; i < 5; i++) {
    const x = chainX + (i - shift) * step;
    if (x < minX || x > maxX) continue;
    const isTarget = i === 3;
    ctx.globalAlpha = i === 0 ? 1 - shift : 1;
    rrect(ctx, x - bs / 2, rowY - bs / 2, bs, bs, bs * 0.25, isTarget ? (land > 0 ? MINT : MIST) : i < 3 ? '#e8f7ef' : MIST);
    label(ctx, `#${1040 + cycle + i - 3}`, x, rowY, Math.max(8, fs * 0.8), INK);
    ctx.globalAlpha = 1;
    if (isTarget && land > 0) {
      ctx.globalAlpha = land * (1 - shift);
      label(ctx, 'VALID', x, rowY + bs / 2 + u * 0.5, fs, '#1f7a55');
      ctx.globalAlpha = 1;
    }
  }

  // queue: a plain card behind, and the next transfer easing in once the current one is inside the prover
  ctx.globalAlpha = 0.6;
  rrect(ctx, sx - cw / 2 - u * 0.3, sy - ch / 2 - u * 0.3, cw, ch, u * 0.35, '#ececec');
  ctx.globalAlpha = 1;
  if (p >= T_CHIP_START) {
    const k = easeOut(seg(p, T_CHIP_START, T_CHIP_END));
    const nx = portrait ? sx : sx - cw * 0.35 * (1 - k);
    const ny = portrait ? sy - ch * 0.4 * (1 - k) : sy;
    transferCard(ctx, nx, ny, cw, ch, u, TRANSFERS[(cycle + 1) % TRANSFERS.length], 0, k);
  }

  // active card slides into the prover, fields turning to dots as it gets close
  const slide = easeInOut(seg(p, 0, T_SLIDE));
  const redact = seg(slide, 0.35, 0.8);
  if (p < T_SLIDE + 0.02) {
    ctx.save();
    ctx.beginPath();
    if (portrait) ctx.rect(0, 0, w, py - ps / 2 + 1);
    else ctx.rect(0, 0, px - ps / 2 + 1, h);
    ctx.clip();
    const ax = portrait ? sx : lerp(sx, px, slide);
    const ay = portrait ? lerp(sy, py, slide) : sy;
    transferCard(ctx, ax, ay, cw, ch, u, TRANSFERS[cycle % TRANSFERS.length], redact, 1);
    ctx.restore();
  }

  // prover pulses while it works
  const work = seg(p, T_SLIDE - 0.04, T_CHIP_START + 0.04);
  prover(ctx, px, py, ps * (1 + Math.sin(work * Math.PI) * 0.06));

  // proof chip travels to the newest block
  const chip = easeOut(seg(p, T_CHIP_START, T_CHIP_END));
  if (p >= T_CHIP_START && p < T_LAND) {
    const targetX = chainX + 3 * step;
    const x0 = portrait ? px : px + ps / 2;
    const y0 = portrait ? py + ps / 2 : py;
    const x = lerp(x0, targetX, chip) + (portrait ? Math.sin(chip * Math.PI) * u * 0.6 : 0);
    const y = lerp(y0, rowY, chip) - (portrait ? 0 : Math.sin(chip * Math.PI) * u * 0.9);
    const cwChip = u * 1.3;
    const chChip = u * 0.8;
    ctx.globalAlpha = 1 - seg(p, T_CHIP_END, T_LAND);
    rrect(ctx, x - cwChip / 2, y - chChip / 2, cwChip, chChip, chChip / 2, INK);
    label(ctx, 'zk', x, y, fs, '#ffffff');
    ctx.globalAlpha = 1;
  }
};

export default function ProofScene() {
  const ref = useCanvas(draw);
  return (
    <canvas
      ref={ref}
      className="proof-canvas"
      role="img"
      aria-label="A transfer with readable sender, receiver and amount goes into the ZKSona prover; only a small proof comes out and lands on Solana, where it is marked valid."
    />
  );
}
