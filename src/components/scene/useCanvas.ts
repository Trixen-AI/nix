import { useEffect, useRef } from 'react';

export type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, reduced: boolean) => void;

/**
 * Canvas 2D loop: DPR-sharp backing store (capped at 2), redraw on resize, paused offscreen,
 * a single meaningful frame for reduced motion. `draw` must be a stable, module-level function.
 */
export function useCanvas(draw: DrawFn) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const render = () => draw(ctx, canvas.clientWidth, canvas.clientHeight, (performance.now() - start) / 1000, reduced);
    const loop = () => {
      render();
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) render();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
    });
    const ro = new ResizeObserver(resize);

    resize();
    loop();
    io.observe(canvas);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [draw]);

  return ref;
}
