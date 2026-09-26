import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Traceable Solana transfers ("SOL" chips) drift left to right, pass behind a frosted glass shield
// and come out as zero-knowledge commitments ("zk" chips with a lock badge).
// Time-driven loop, like the reference scene.

const SPACING = 1.55;
const COUNT = 10;
const SPEED = 0.32; // units per second
const ROW_HALF = (COUNT * SPACING) / 2;
const DISC_R = 0.46;
const GLASS_HALF_W = 2.35;

function faceTexture(kind: 'public' | 'private') {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s * 0.4, s * 0.35, s * 0.05, s / 2, s / 2, s / 2);
  grad.addColorStop(0, '#9c9ba5');
  grad.addColorStop(1, '#7f7e89');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (kind === 'public') {
    g.font = '600 72px JetBrains Mono Variable, monospace';
    g.fillText('SOL', s / 2, s / 2 + 6);
  } else {
    g.font = '600 88px JetBrains Mono Variable, monospace';
    g.fillText('zk', s * 0.44, s / 2 + 2);
    // lock badge
    g.beginPath();
    g.arc(s * 0.74, s * 0.72, s * 0.17, 0, Math.PI * 2);
    g.fillStyle = '#6d45ff';
    g.fill();
    g.fillStyle = '#ffffff';
    g.fillRect(s * 0.685, s * 0.715, s * 0.11, s * 0.075);
    g.lineWidth = 8;
    g.strokeStyle = '#ffffff';
    g.beginPath();
    g.arc(s * 0.74, s * 0.715, s * 0.034, Math.PI, 0);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function shieldShape() {
  // The Zentry outline (same proportions as the logo mark), centred on the origin.
  const w = GLASS_HALF_W;
  const top = 2.9;
  const s = new THREE.Shape();
  s.moveTo(0, top);
  s.lineTo(w, top - 0.8);
  s.lineTo(w, 0.35);
  s.bezierCurveTo(w, -1.6, w * 0.4, -2.75, 0, -3.1);
  s.bezierCurveTo(-w * 0.4, -2.75, -w, -1.6, -w, 0.35);
  s.lineTo(-w, top - 0.8);
  s.lineTo(0, top);
  return s;
}

export default function AgentScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0xffffff, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Opaque white (same as the page) so the glass has something to refract and blur.
    scene.background = new THREE.Color('#ffffff');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 100);
    camera.position.set(0, 0.2, 16);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // Glass bubble
    const glassGeo = new THREE.ExtrudeGeometry(shieldShape(), {
      depth: 0.55,
      bevelEnabled: true,
      bevelSize: 0.18,
      bevelThickness: 0.22,
      bevelSegments: 8,
      curveSegments: 32,
    });
    glassGeo.center();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f5f3fc'),
      transmission: 1,
      roughness: 0.4,
      thickness: 1.6,
      ior: 1.35,
      attenuationColor: new THREE.Color('#ece6ff'),
      attenuationDistance: 3,
      clearcoat: 1,
      clearcoatRoughness: 0.25,
      specularIntensity: 1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = 1.2;
    group.add(glass);

    // Inner rim, a thin frosted frame that reads as the shield's inset edge
    const rimGeo = new THREE.ShapeGeometry(shieldShape(), 32);
    rimGeo.center();
    const rim = new THREE.Mesh(
      rimGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }),
    );
    rim.scale.setScalar(0.8);
    rim.position.z = 1.9;
    group.add(rim);

    // Violet light streaks behind the glass (the transmission blurs them into colour bands)
    const streakMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#6d45ff'), toneMapped: false });
    const streaks: THREE.Mesh[] = [];
    [
      { x: -0.7, y: 1.0, r: 0.7, w: 2.2 },
      { x: 0.9, y: -0.9, r: 0.7, w: 1.8 },
      { x: 1.5, y: 0.2, r: -0.25, w: 0.9 },
    ].forEach((d) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(d.w, 0.3), streakMat);
      m.position.set(d.x, d.y, 0.55);
      m.rotation.z = d.r;
      group.add(m);
      streaks.push(m);
    });

    // Discs
    const texWords = faceTexture('public');
    const texSigned = faceTexture('private');
    const discGeo = new THREE.CylinderGeometry(DISC_R, DISC_R, 0.14, 64);
    discGeo.rotateX(Math.PI / 2);
    discGeo.rotateZ(Math.PI / 2);
    type Disc = { mesh: THREE.Mesh; face: THREE.MeshStandardMaterial; side: THREE.MeshStandardMaterial; offset: number };
    const discs: Disc[] = [];
    for (let i = 0; i < COUNT; i++) {
      const side = new THREE.MeshStandardMaterial({ color: '#85848f', metalness: 0.3, roughness: 0.45, transparent: true });
      const face = new THREE.MeshStandardMaterial({ map: texWords, metalness: 0.15, roughness: 0.5, transparent: true });
      const mesh = new THREE.Mesh(discGeo, [side, face, face]);
      mesh.position.z = -0.2;
      group.add(mesh);
      discs.push({ mesh, face, side, offset: i * SPACING });
    }

    const setSize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const visibleHalfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
      // Fit the disc row into the frame on wide screens. On phones keep the glass readable
      // (smaller amplitude, not a thumbnail) and let the row run past the edges.
      const rowFit = visibleHalfW / (ROW_HALF * 0.93);
      group.scale.setScalar(Math.min(1, Math.max(rowFit, 0.62)));
    };
    setSize();

    const place = (t: number) => {
      const travel = COUNT * SPACING;
      for (const d of discs) {
        const x = (((d.offset + t * SPEED) % travel) + travel) % travel - ROW_HALF;
        d.mesh.position.x = x;
        d.mesh.position.y = 0;
        d.mesh.rotation.y = Math.sin(t * 0.6 + d.offset) * 0.08;
        const signed = x > 0;
        const tex = signed ? texSigned : texWords;
        if (d.face.map !== tex) {
          d.face.map = tex;
          d.face.needsUpdate = true;
        }
        // fade near both ends of the row, like the reference
        const edge = THREE.MathUtils.smoothstep(ROW_HALF - Math.abs(x), 0.15, 1.6);
        d.face.opacity = edge;
        d.side.opacity = edge;
        d.mesh.visible = edge > 0.01;
      }
      glass.rotation.y = Math.sin(t * 0.35) * 0.06;
      glass.rotation.x = Math.sin(t * 0.27) * 0.03;
      streaks.forEach((m, i) => {
        m.position.x += Math.sin(t * 0.4 + i * 2) * 0.002;
      });
    };

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let elapsed = 3.1;
    const frame = (now: number) => {
      elapsed += Math.min((now - last) / 1000, 0.05);
      last = now;
      place(elapsed);
      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };
    place(elapsed);
    renderer.render(scene, camera);
    if (!reduce) raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      setSize();
      renderer.render(scene, camera);
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      texWords.dispose();
      texSigned.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="scene-host" style={{ width: '100%', height: '100%' }} />;
}
