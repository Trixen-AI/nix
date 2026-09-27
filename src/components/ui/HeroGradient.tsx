import { useEffect, useRef, useState } from 'react';

// Slow, flowing orange / apricot / sky / pearl field. Time-driven, pauses offscreen,
// static fallback for reduced motion or missing WebGL.
const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

const FRAG = `
precision mediump float;
uniform vec2 uSize;
uniform float uT;

vec2 rnd2(vec2 p){
  p = vec2(dot(p, vec2(41.3, 289.1)), dot(p, vec2(173.7, 67.9)));
  return fract(sin(p) * 17853.531) * 2.0 - 1.0;
}
float grad(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float n00 = dot(rnd2(i), f);
  float n10 = dot(rnd2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float n01 = dot(rnd2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float n11 = dot(rnd2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(n00, n10, w.x), mix(n01, n11, w.x), w.y) * 0.5 + 0.5;
}
float layered(vec2 p){
  float s = 0.0, amp = 0.55;
  mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
  for (int k = 0; k < 5; k++){ s += amp * grad(p); p = turn * p * 2.03; amp *= 0.48; }
  return s;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uSize;
  vec2 p = vec2(uv.x * uSize.x / uSize.y, uv.y) * 1.35;
  float t = uT * 0.09;

  // domain warp in two passes
  vec2 q = vec2(layered(p + vec2(t, -t * 0.7)), layered(p + vec2(3.1 - t * 0.5, 7.4)));
  vec2 r = vec2(layered(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.6), layered(p + 2.2 * q + vec2(8.3, 2.8) - t * 0.4));
  float f = layered(p + 1.8 * r);

  vec3 pearl = vec3(0.985, 0.980, 0.972);
  vec3 lav   = vec3(1.000, 0.640, 0.250);
  vec3 lavLo = vec3(1.000, 0.860, 0.700);
  vec3 mint  = vec3(0.780, 0.945, 1.000);
  vec3 blush = vec3(1.000, 0.955, 0.905);

  // sweeping lavender tide from the left edge
  float tide = smoothstep(0.62, 0.05, uv.x + (f - 0.5) * 0.9 + 0.12 * sin(t * 3.0 + uv.y * 2.5));
  // pearl core through the middle, colour gathering at the edges
  float edge = smoothstep(0.18, 0.5, abs(uv.x - 0.55 + (f - 0.5) * 0.35));
  vec3 col = mix(pearl, lavLo, smoothstep(0.45, 0.85, f) * (0.35 + 0.65 * edge));
  col = mix(col, lav, tide * 0.8);
  col = mix(col, mint, smoothstep(0.55, 0.85, r.x) * (1.0 - tide) * 0.55);
  col = mix(col, blush, smoothstep(0.6, 0.9, q.y) * 0.35);

  // soft diagonal light bands
  float band = sin((uv.x - uv.y) * 5.0 + f * 4.0 - t * 6.0);
  col = mix(col, vec3(1.0), smoothstep(0.75, 1.0, band) * 0.22);

  // right-side glow that breathes
  float glow = smoothstep(0.75, 0.0, distance(uv, vec2(0.86 + 0.04 * sin(t * 2.0), 0.72)));
  col = mix(col, lavLo, glow * (0.45 + 0.15 * sin(t * 4.0)));

  gl_FragColor = vec4(col, 1.0);
}`;

export function HeroGradient() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      setFallback(true);
      return;
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      setFallback(true);
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uSize = gl.getUniformLocation(prog, 'uSize');
    const uT = gl.getUniformLocation(prog, 'uT');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const draw = (now: number) => {
      resize();
      gl.uniform2f(uSize, canvas.width, canvas.height);
      gl.uniform1f(uT, reduce ? 12 : (now - start) / 1000 + 12);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      draw(now);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onResize = () => reduce && draw(performance.now());
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return fallback ? <div className="hero-fallback" aria-hidden="true" /> : <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
