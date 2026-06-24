"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Points } from "three";
import * as THREE from "three";
import gsap from "gsap";
import LabStickyScroll, { type LabStickyScrollHandle } from "./LabStickyScroll";

const BG = "#0c1e38";
const GLOW = "#e8f4ff";
const BLUE = "#9bb8e1";

const TRANSITION = 0.12;
const SNAP_THRESHOLD = 0.45;
const SNAP_DURATION = 0.92;
const PARTICLE_COUNT = 5600;
const PARTICLE_SIZE = 0.011;
const HOVER_RADIUS_NDC = 0.11;
const HOVER_EDGE = 0.88;
const HOVER_HOLD_SEC = 1.25;
const HOVER_RETURN_SEC = 1.4;
const HOVER_SMOOTH_IN = 7.5;
const HOVER_SMOOTH_HOLD = 3.2;
const HOVER_SMOOTH_OUT = 3.6;
const HOVER_POINTER_SMOOTH = 11;
const HOVER_DISPLACE_MIN = 0.008;
const REVEAL_SCROLL = 0.055;
const REVEAL_STEP = 0.12;
const REVEAL_DURATION = 0.48;
const REVEAL_SETTLE_MS = 2200;

type ShapeKind = "shard" | "shattered" | "humanoid" | "cone";
type BgKind = "water" | "mist" | "crater" | "caustics";

const SECTIONS = [
  {
    id: "hero",
    shape: "shard" as ShapeKind,
    bg: "water" as BgKind,
    start: 0,
    num: null as string | null,
    label: null as string | null,
    title: "The next wave of venture capital",
    titleLines: null as readonly string[] | null,
    body: null as string | null,
    cta: "Scroll down to discover more",
    titlePos: "bottom-left" as const,
  },
  {
    id: "manifesto",
    shape: "shattered" as ShapeKind,
    bg: "mist" as BgKind,
    start: 0.22,
    num: "//01",
    label: "Manifesto",
    title: "Capital with conviction",
    titleLines: null,
    body: "Hashgraph Ventures is an early-stage VC fund at the intersection of blockchain infrastructure and AI — pre-seed through Series A.",
    cta: null,
    titlePos: "left" as const,
  },
  {
    id: "investors",
    shape: "humanoid" as ShapeKind,
    bg: "crater" as BgKind,
    start: 0.44,
    num: "//02",
    label: "Investors",
    title: null,
    titleLines: ["Early access", "permanent", "advantage"] as const,
    body: "Infrastructure first. Returns follow. A deliberate trifecta — Group, Association, and fast-moving Ventures capital.",
    cta: "Explore our portfolio",
    titlePos: "top-left" as const,
  },
  {
    id: "team",
    shape: "cone" as ShapeKind,
    bg: "caustics" as BgKind,
    start: 0.66,
    num: "//03",
    label: "Team",
    title: "Experience you can build on",
    titleLines: null,
    body: "50+ years of combined experience — forged, not assembled. No career investors. No tourists.",
    cta: null,
    titlePos: "left" as const,
  },
] as const;

const PORTFOLIO = ["Debyt", "Rava", "100s", "Bloxtel"] as const;
const TEAM = [
  { name: "Dara Campbell", role: "Managing Partner" },
  { name: "Will Patterson", role: "Head of Venture" },
  { name: "Arjun Chirumamilla", role: "Senior Associate" },
  { name: "Jeff Sun", role: "Venture Capital Analyst" },
  { name: "Tracie Hutchins", role: "Executive Operations Manager" },
  { name: "Stefan Deiss", role: "Co-Founder" },
  { name: "Kamal Youssefi", role: "Co-Founder & Executive Chairman" },
] as const;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function smoothstep01(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function expLerpFactor(speed: number, delta: number) {
  return 1 - Math.exp(-speed * delta);
}

function easeInCubic(t: number) {
  const x = clamp01(t);
  return x * x * x;
}

function getStableReveal(p: number, sectionIndex: number) {
  const s = SECTIONS[sectionIndex];
  const nextStart = sectionIndex < SECTIONS.length - 1 ? SECTIONS[sectionIndex + 1].start : 0.88;
  const stableEnd = nextStart - TRANSITION;
  if (p < s.start || p >= stableEnd) return 0;
  return clamp01((p - s.start) / REVEAL_SCROLL);
}

function itemProgress(reveal: number, order: number) {
  return easeInOutCubic(clamp01((reveal - order * REVEAL_STEP) / REVEAL_DURATION));
}

function exitFade(t: number) {
  return 1 - easeInOutCubic(clamp01(t));
}

/** Diagonal seam rises bottom→top; left edge higher than right (ref. red line) */
const SEAM_SLOPE = 26;

function seamY(xPercent: number, t: number) {
  const yLeft = lerp(108, -18, t);
  const yRight = lerp(108 + SEAM_SLOPE, -18, t);
  return lerp(yLeft, yRight, xPercent / 100);
}

function outgoingClip(t: number) {
  const y0 = seamY(0, t);
  const y100 = seamY(100, t);
  return `polygon(0 0, 100% 0, 100% ${y100}%, 0 ${y0}%)`;
}

function incomingClip(t: number) {
  const y0 = seamY(0, t);
  const y100 = seamY(100, t);
  return `polygon(0 ${y0}%, 100% ${y100}%, 100% 100%, 0 100%)`;
}

function transitionZone(p: number) {
  for (let i = 1; i < SECTIONS.length; i++) {
    const start = SECTIONS[i].start;
    if (p >= start - TRANSITION && p < start) {
      return {
        prev: i - 1,
        curr: i,
        t: clamp01((p - (start - TRANSITION)) / TRANSITION),
      };
    }
  }
  return null;
}

const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0)";

type LayerState = {
  clipPath: string | undefined;
  zIndex: number;
  simActive: boolean;
  contentReveal: number;
  contentFade: number;
};

function getSectionLayerState(
  sectionIndex: number,
  p: number,
  prev: number,
  curr: number,
  t: number,
  inTransition: boolean,
  settledReveal: number,
): LayerState {
  const hidden: LayerState = {
    clipPath: HIDDEN_CLIP,
    zIndex: 1,
    simActive: false,
    contentReveal: 0,
    contentFade: 0,
  };

  if (inTransition) {
    if (sectionIndex === prev) {
      return {
        clipPath: outgoingClip(t),
        zIndex: 10,
        simActive: true,
        contentReveal: 1,
        contentFade: exitFade(t),
      };
    }
    if (sectionIndex === curr) {
      return {
        clipPath: incomingClip(t),
        zIndex: 12,
        simActive: true,
        contentReveal: 0,
        contentFade: 0,
      };
    }
    return hidden;
  }

  if (sectionIndex === curr) {
    return {
      clipPath: undefined,
      zIndex: 10,
      simActive: true,
      contentReveal: Math.max(getStableReveal(p, curr), settledReveal),
      contentFade: 1,
    };
  }

  const nextIdx = curr + 1;
  if (nextIdx < SECTIONS.length && sectionIndex === nextIdx) {
    return {
      clipPath: HIDDEN_CLIP,
      zIndex: 1,
      simActive: true,
      contentReveal: 0,
      contentFade: 0,
    };
  }

  return hidden;
}

function sectionState(p: number) {
  for (let i = 0; i < SECTIONS.length; i++) {
    const s = SECTIONS[i];
    if (i > 0 && p >= s.start - TRANSITION && p < s.start) {
      const t = clamp01((p - (s.start - TRANSITION)) / TRANSITION);
      return { prev: i - 1, curr: i, t };
    }
    const nextStart = i < SECTIONS.length - 1 ? SECTIONS[i + 1].start : 1;
    if (p >= s.start && p < nextStart - (i < SECTIONS.length - 1 ? TRANSITION : 0)) {
      return { prev: i, curr: i, t: 0 };
    }
  }
  return { prev: SECTIONS.length - 1, curr: SECTIONS.length - 1, t: 0 };
}

const CONE_RADIUS = 0.95;
const CONE_HEIGHT = 1.9;
const CUBE_SIZE = 1.42;
const MORPH_CYCLE_SEC = 3;
const MORPH_SPHERE_R = 0.9;
const MORPH_DODEC_R = 0.94;

function hexVertex(i: number, radius: number, y: number) {
  const a = (i * Math.PI) / 3;
  return new THREE.Vector3(radius * Math.cos(a), y, radius * Math.sin(a));
}

function sampleTriangle3D(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  let u = Math.random();
  let v = Math.random();
  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }
  const w = 1 - u - v;
  const p = new THREE.Vector3(
    a.x * u + b.x * v + c.x * w,
    a.y * u + b.y * v + c.y * w,
    a.z * u + b.z * v + c.z * w,
  );
  const shell = 0.965 + Math.random() * 0.035;
  return p.multiplyScalar(shell);
}

function sampleQuad3D(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) {
  if (Math.random() < 0.5) {
    return sampleTriangle3D(a, b, c);
  }
  return sampleTriangle3D(a, c, d);
}

/**
 * 3D hexagonal brilliant — top view: regular hexagon girdle (scene 1).
 * Crown: 6 quads (table hex → girdle hex) + 6 table triangles.
 * Pavilion: 6 triangles (girdle → culet).
 */
function generateDiamondPoints(count: number, radius = CONE_RADIUS, height = CONE_HEIGHT) {
  const halfH = height / 2;
  const yTable = halfH * 0.9;
  const yGirdle = halfH * 0.08;
  const yCulet = -halfH * 0.92;
  const rGirdle = radius * 0.96;
  const rTable = rGirdle * 0.32;
  const culet = new THREE.Vector3(0, yCulet, 0);
  const tableCenter = new THREE.Vector3(0, yTable, 0);

  const girdle = Array.from({ length: 6 }, (_, i) => hexVertex(i, rGirdle, yGirdle));
  const table = Array.from({ length: 6 }, (_, i) => hexVertex(i, rTable, yTable));

  const facets: (() => THREE.Vector3)[] = [];

  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6;
    facets.push(() => sampleQuad3D(table[i], table[j], girdle[j], girdle[i]));
    facets.push(() => sampleTriangle3D(girdle[i], girdle[j], culet));
    facets.push(() => sampleTriangle3D(table[i], table[j], tableCenter));
  }

  const perFacet = Math.ceil(count / facets.length);
  const pts: THREE.Vector3[] = [];
  for (const sample of facets) {
    for (let i = 0; i < perFacet && pts.length < count; i++) {
      pts.push(sample());
    }
  }
  while (pts.length < count) {
    pts.push(facets[Math.floor(Math.random() * facets.length)]());
  }
  return pts.slice(0, count);
}

/** Axis-aligned cube (scene 2) */
function generateCubePoints(count: number, size = CUBE_SIZE) {
  const half = size / 2;
  const pts: THREE.Vector3[] = [];
  const faces: [number, number, number][] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  const perFace = Math.ceil(count / faces.length);
  for (const [nx, ny, nz] of faces) {
    for (let i = 0; i < perFace && pts.length < count; i++) {
      const u = (Math.random() - 0.5) * size;
      const v = (Math.random() - 0.5) * size;
      const jitter = (Math.random() - 0.5) * 0.035;
      if (nx !== 0) {
        pts.push(new THREE.Vector3(nx * half + jitter, u, v));
      } else if (ny !== 0) {
        pts.push(new THREE.Vector3(u, ny * half + jitter, v));
      } else {
        pts.push(new THREE.Vector3(u, v, nz * half + jitter));
      }
    }
  }
  return pts.slice(0, count);
}

const _tri = new THREE.Triangle();
const _ray = new THREE.Ray();
const _hit = new THREE.Vector3();
const _dodecDir = new THREE.Vector3();

function sampleDodecaSurface(dir: THREE.Vector3, geometry: THREE.BufferGeometry, radius: number) {
  _ray.set(new THREE.Vector3(0, 0, 0), _dodecDir.copy(dir).normalize());
  const pos = geometry.getAttribute("position");
  let best: THREE.Vector3 | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < pos.count; i += 3) {
    _tri.a.fromBufferAttribute(pos, i).multiplyScalar(radius);
    _tri.b.fromBufferAttribute(pos, i + 1).multiplyScalar(radius);
    _tri.c.fromBufferAttribute(pos, i + 2).multiplyScalar(radius);
    if (_ray.intersectTriangle(_tri.a, _tri.b, _tri.c, false, _hit)) {
      const d = _hit.lengthSq();
      if (d < bestDist) {
        bestDist = d;
        best = _hit.clone();
      }
    }
  }
  return best ?? _dodecDir.copy(dir).normalize().multiplyScalar(radius);
}

let dodecaBaseGeo: THREE.BufferGeometry | null = null;

function getDodecaBaseGeo() {
  if (!dodecaBaseGeo) dodecaBaseGeo = new THREE.DodecahedronGeometry(1, 0);
  return dodecaBaseGeo;
}

/** Paired sphere ↔ dodecahedron samples along shared radial directions (scene 3) */
function generateMorphPairPoints(count: number) {
  const geo = getDodecaBaseGeo();
  const spherePts: THREE.Vector3[] = [];
  const dodecPts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = Math.PI * 2 * u;
    const phi = Math.acos(2 * v - 1);
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
    );
    const shell = 0.94 + Math.random() * 0.06;
    spherePts.push(dir.clone().multiplyScalar(MORPH_SPHERE_R * shell));
    dodecPts.push(sampleDodecaSurface(dir, geo, MORPH_DODEC_R * shell));
  }
  return { spherePts, dodecPts };
}

function generateConePoints(count: number, radius: number, height: number) {
  const pts: THREE.Vector3[] = [];
  const baseN = Math.floor(count * 0.3);
  const halfH = height / 2;
  for (let i = 0; i < baseN; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radius * Math.sqrt(Math.random());
    pts.push(new THREE.Vector3(Math.cos(a) * r, -halfH, Math.sin(a) * r));
  }
  for (let i = baseN; i < count; i++) {
    const h = Math.random();
    const r = radius * (1 - h) * (0.9 + Math.random() * 0.1);
    const a = Math.random() * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, lerp(-halfH, halfH, h), Math.sin(a) * r));
  }
  return pts;
}

function generateShapePoints(shape: ShapeKind, count: number) {
  if (shape === "shard") return generateDiamondPoints(count);
  if (shape === "shattered") return generateCubePoints(count);
  if (shape === "humanoid") return generateMorphPairPoints(count).spherePts;
  return generateConePoints(count, CONE_RADIUS, CONE_HEIGHT);
}

type ParticleBody = {
  home: THREE.Vector3;
  homeA: THREE.Vector3;
  homeB: THREE.Vector3;
  pos: THREE.Vector3;
  offset: THREE.Vector3;
  holdOffset: THREE.Vector3;
  linger: number;
};

const _pointer = new THREE.Vector3();
const _fromP = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _home = new THREE.Vector3();
const _homeScreen = new THREE.Vector3();
const _target = new THREE.Vector3();
const _zero = new THREE.Vector3(0, 0, 0);
const _unproj = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);

function ndcToWorldOnPlane(ndcX: number, ndcY: number, camera: THREE.Camera, planeZ = 0, out = _pointer) {
  _unproj.set(ndcX, ndcY, 0.5).unproject(camera);
  _dir.copy(_unproj).sub(camera.position).normalize();
  const t = (planeZ - camera.position.z) / _dir.z;
  return out.copy(camera.position).add(_dir.multiplyScalar(t));
}

function createParticles(shape: ShapeKind) {
  if (shape === "humanoid") {
    const { spherePts, dodecPts } = generateMorphPairPoints(PARTICLE_COUNT);
    return spherePts.map((a, i) => ({
      home: a.clone(),
      homeA: a.clone(),
      homeB: dodecPts[i].clone(),
      pos: a.clone(),
      offset: new THREE.Vector3(),
      holdOffset: new THREE.Vector3(),
      linger: 0,
    }));
  }
  return generateShapePoints(shape, PARTICLE_COUNT).map((home) => ({
    home: home.clone(),
    homeA: home.clone(),
    homeB: home.clone(),
    pos: home.clone(),
    offset: new THREE.Vector3(),
    holdOffset: new THREE.Vector3(),
    linger: 0,
  }));
}

function ParticleShapeScene({
  shape,
  impulseRef,
  hoverActiveRef,
  pointerRef,
  active,
}: {
  shape: ShapeKind;
  impulseRef: React.RefObject<number>;
  hoverActiveRef: React.RefObject<boolean>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  active: boolean;
}) {
  const pointsRef = useRef<Points>(null!);
  const partsRef = useRef<ParticleBody[]>(createParticles(shape));
  const rotRef = useRef(0);
  const smoothPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    partsRef.current = createParticles(shape);
    smoothPointerRef.current = { x: 0, y: 0 };
  }, [shape]);

  useFrame(({ clock, camera }, delta) => {
    if (!active) return;
    const pts = pointsRef.current;
    if (!pts) return;

    const impulse = impulseRef.current;
    const hovering = hoverActiveRef.current;
    const inHold = !hovering && impulse > 0.98;
    const inReturn = !hovering && impulse > 0 && impulse <= 0.98;
    const { x: mx, y: my } = pointerRef.current;
    const smooth = smoothPointerRef.current;
    const pointerBlend = expLerpFactor(HOVER_POINTER_SMOOTH, delta);
    smooth.x = lerp(smooth.x, mx, pointerBlend);
    smooth.y = lerp(smooth.y, my, pointerBlend);

    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const camY = 0;
    const pointerWorld = ndcToWorldOnPlane(smooth.x, smooth.y, camera, 0, _pointer);
    pointerWorld.y -= camY;
    const worldRadius = HOVER_RADIUS_NDC * (camera as THREE.PerspectiveCamera).position.z * 0.5;
    const inBlend = expLerpFactor(HOVER_SMOOTH_IN, delta);
    const holdBlend = expLerpFactor(HOVER_SMOOTH_HOLD, delta);
    const outBlend = expLerpFactor(HOVER_SMOOTH_OUT, delta);

    rotRef.current = clock.elapsedTime * 0.1;
    let maxDisp = 0;

    partsRef.current.forEach((part, i) => {
      if (shape === "humanoid") {
        const morphT = easeInOutCubic((Math.sin(clock.elapsedTime * ((Math.PI * 2) / MORPH_CYCLE_SEC)) + 1) * 0.5);
        _home.copy(part.homeA).lerp(part.homeB, morphT);
      } else {
        _home.copy(part.home);
      }
      _home.applyAxisAngle(_yAxis, rotRef.current);

      _homeScreen.set(_home.x, _home.y + camY, _home.z).project(camera);
      const homeScreenDist = Math.hypot(_homeScreen.x - smooth.x, _homeScreen.y - smooth.y);
      const inRadius = homeScreenDist < HOVER_RADIUS_NDC;
      const falloff = smoothstep01(1 - homeScreenDist / HOVER_RADIUS_NDC);

      if (hovering && inRadius && impulse > 0.008) {
        part.linger = 1;
        _fromP.copy(_home).sub(pointerWorld);
        const len = _fromP.length();
        if (len > 1e-5) {
          _dir.copy(_fromP).divideScalar(len);
        } else {
          _dir.set(0, 1, 0);
        }
        const push = worldRadius * HOVER_EDGE * falloff * impulse;
        _target.copy(_dir).multiplyScalar(push);
        part.offset.lerp(_target, inBlend);
        part.holdOffset.copy(part.offset);
      } else if (inHold && part.linger > 0.04) {
        part.offset.lerp(part.holdOffset, holdBlend * 0.45);
      } else if (inReturn) {
        const returnT = 1 - impulse;
        const eased = easeInCubic(returnT);
        part.offset.copy(part.holdOffset).lerp(_zero, eased);
        part.linger = returnT;
      } else if (!hovering) {
        part.offset.lerp(_zero, outBlend);
        if (part.offset.lengthSq() < HOVER_DISPLACE_MIN * HOVER_DISPLACE_MIN) {
          part.offset.set(0, 0, 0);
          part.holdOffset.set(0, 0, 0);
          part.linger = Math.max(0, part.linger - delta * 0.6);
        }
      }

      if (!hovering && !inHold && !inReturn && inRadius) {
        part.linger = Math.max(0, part.linger - delta * 0.35);
      }

      part.pos.copy(_home).add(part.offset);
      const disp = part.offset.length();
      if (disp > maxDisp) maxDisp = disp;

      attr.setXYZ(i, part.pos.x, part.pos.y, part.pos.z);
    });
    attr.needsUpdate = true;

    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = 0.74 + maxDisp * 0.35;
    mat.size = PARTICLE_SIZE + maxDisp * 0.02;
  });

  const positions = useMemo(() => {
    const a = new Float32Array(PARTICLE_COUNT * 3);
    partsRef.current.forEach((p, i) => {
      a[i * 3] = p.pos.x;
      a[i * 3 + 1] = p.pos.y;
      a[i * 3 + 2] = p.pos.z;
    });
    return a;
  }, [shape]);

  const camY = 0;

  return (
    <>
      <fog attach="fog" args={["#122a4a", 4, 12]} />
      <ambientLight intensity={0.12} color={BLUE} />
      <pointLight position={[0, 0.3, 2.5]} intensity={2.4} color={GLOW} distance={12} />
      <pointLight position={[0, -1.2, 1.5]} intensity={0.6} color={GLOW} distance={10} />
      <group position={[0, camY, 0]}>
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} count={PARTICLE_COUNT} />
          </bufferGeometry>
          <pointsMaterial
            color={GLOW}
            size={PARTICLE_SIZE}
            transparent
            opacity={0.78}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}

function vignetteFor(kind: BgKind) {
  if (kind === "water") {
    return "radial-gradient(ellipse 92% 82% at 50% 42%, transparent 48%, rgba(14,36,72,0.38) 100%)";
  }
  if (kind === "mist") {
    return "radial-gradient(ellipse 92% 82% at 50% 42%, transparent 48%, rgba(36,18,58,0.38) 100%)";
  }
  if (kind === "crater") {
    return "radial-gradient(ellipse 92% 82% at 50% 42%, transparent 48%, rgba(10,42,32,0.38) 100%)";
  }
  return "radial-gradient(ellipse 92% 82% at 50% 42%, transparent 48%, rgba(12,32,52,0.38) 100%)";
}

function SectionBackground({ kind, phase }: { kind: BgKind; phase: number }) {
  if (kind === "water") {
    return (
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(152deg, #1e4a82 0%, #163a68 28%, #102c52 55%, #0c2244 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_58%_at_28%_22%,rgba(72,140,220,0.32),rgba(16,40,78,0.15)_62%,rgba(12,32,62,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_72%_78%,rgba(40,90,160,0.28),rgba(12,28,56,0.85)_100%)]" />
        <div
          className="hg-water absolute inset-x-0 bottom-0 h-[46%]"
          style={{ transform: `translateY(${Math.sin(phase * 0.4) * 6}px)` }}
        />
      </div>
    );
  }
  if (kind === "mist") {
    return (
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(158deg, #4a2870 0%, #3a1f5a 30%, #2a1548 62%, #1c0e36 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_68%_52%_at_55%_28%,rgba(150,80,210,0.3),rgba(42,20,68,0.2)_65%,rgba(28,12,48,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_42%_at_22%_82%,rgba(100,50,150,0.22),rgba(24,10,42,0.88)_100%)]" />
      </div>
    );
  }
  if (kind === "crater") {
    return (
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(138deg, #1a5c42 0%, #144a36 32%, #0e3a2a 65%, #0a2e22 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_52%_at_50%_68%,rgba(60,180,120,0.28),rgba(14,48,36,0.2)_68%,rgba(8,36,28,0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[radial-gradient(ellipse_68%_52%_at_50%_100%,rgba(90,210,150,0.22),rgba(10,40,32,0.75)_100%)]" />
      </div>
    );
  }
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(128deg, #1a3a62 0%, #142e50 35%, #0e2440 68%, #0a1c34 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_76%_24%,rgba(70,130,200,0.26),rgba(14,32,56,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_42%_at_26%_76%,rgba(50,110,90,0.2),rgba(10,28,48,0.9)_100%)]" />
      <div
        className="hg-caustics absolute inset-0 opacity-35"
        style={{ transform: `translate(${Math.sin(phase * 0.3) * 2}%, ${Math.cos(phase * 0.25) * 1}%)` }}
      />
    </div>
  );
}

function RevealItem({
  order,
  reveal,
  fade,
  children,
  className = "",
}: {
  order: number;
  reveal: number;
  fade: number;
  children: React.ReactNode;
  className?: string;
}) {
  const enter = itemProgress(reveal, order);
  const t = enter * fade;
  if (t <= 0.002) return null;

  const move = easeOutCubic(enter) * fade;

  return (
    <div
      className={className}
      style={{
        opacity: t,
        transform: `translateY(${lerp(28, 0, move)}px)`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

function SectionContent({
  index,
  reveal,
  fade,
  teamIndex,
}: {
  index: number;
  reveal: number;
  fade: number;
  teamIndex: number;
}) {
  const section = SECTIONS[index];
  if (reveal <= 0 && fade <= 0.002) return null;

  const posClass =
    section.titlePos === "bottom-left"
      ? "bottom-8 left-6 sm:bottom-12 sm:left-10"
      : section.titlePos === "top-left"
        ? "top-28 left-6 sm:top-32 sm:left-10"
        : "left-6 top-1/2 max-w-sm -translate-y-1/2 sm:left-10";

  let order = 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className={`absolute ${posClass}`}>
        {section.num ? (
          <RevealItem order={order++} reveal={reveal} fade={fade}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#9bb8e1]">
              {section.num} {section.label}
            </p>
          </RevealItem>
        ) : null}

        {section.titleLines ? (
          <RevealItem order={order++} reveal={reveal} fade={fade}>
            <h2 className="text-2xl font-bold uppercase leading-[1.05] tracking-[0.06em] text-[#eee] sm:text-5xl">
              {section.titleLines.map((line, i) => (
                <span
                  key={line}
                  className="block"
                  style={{ marginLeft: i === 1 ? "3.5rem" : i === 2 ? "1.75rem" : 0 }}
                >
                  {line}
                </span>
              ))}
            </h2>
          </RevealItem>
        ) : section.title ? (
          <RevealItem order={order++} reveal={reveal} fade={fade}>
            <h2 className="max-w-lg text-2xl font-bold uppercase leading-tight tracking-[0.07em] text-[#eee] sm:text-5xl">
              {section.title}
            </h2>
          </RevealItem>
        ) : null}

        {section.body ? (
          <RevealItem order={order++} reveal={reveal} fade={fade}>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#9bb8e1]/90">{section.body}</p>
          </RevealItem>
        ) : null}

        {section.id === "investors" ? (
          <>
            <RevealItem order={order++} reveal={reveal} fade={fade}>
              <span className="mt-6 inline-flex border border-[#9bb8e1]/40 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#eee]">
                Explore our portfolio
              </span>
            </RevealItem>
            <RevealItem order={order++} reveal={reveal} fade={fade}>
              <div className="mt-5 flex flex-wrap gap-2">
                {PORTFOLIO.map((name) => (
                  <span
                    key={name}
                    className="border border-[#9bb8e1]/25 px-2 py-1 font-mono text-[8px] uppercase text-[#9bb8e1]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </RevealItem>
          </>
        ) : null}

        {section.id === "team" ? (
          <RevealItem order={order++} reveal={reveal} fade={fade}>
            <div className="relative mt-8 min-h-[3.5rem]">
              {TEAM.map((m, i) => (
                <div key={m.name} className="absolute" style={{ opacity: i === teamIndex ? 1 : 0 }}>
                  <p className="text-lg text-[#eee]">{m.name}</p>
                  <p className="text-sm text-[#9bb8e1]">{m.role}</p>
                </div>
              ))}
            </div>
          </RevealItem>
        ) : null}
      </div>

      {section.id === "hero" && section.cta ? (
        <RevealItem order={1} reveal={reveal} fade={fade} className="absolute bottom-8 right-6 sm:bottom-12 sm:right-10">
          <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#9bb8e1]/80">{section.cta}</p>
        </RevealItem>
      ) : null}
    </div>
  );
}

function FullScreenSection({
  index,
  clipPath,
  zIndex,
  impulseRef,
  hoverActiveRef,
  pointerRef,
  simActive,
  phase,
  teamIndex,
  showContent = true,
  contentReveal = 0,
  contentFade = 1,
}: {
  index: number;
  clipPath?: string;
  zIndex: number;
  impulseRef: React.RefObject<number>;
  hoverActiveRef: React.RefObject<boolean>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  simActive: boolean;
  phase: number;
  teamIndex: number;
  showContent?: boolean;
  contentReveal?: number;
  contentFade?: number;
}) {
  const section = SECTIONS[index];
  const isVisible = zIndex >= 10;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        zIndex,
        clipPath,
        WebkitClipPath: clipPath,
        visibility: isVisible ? "visible" : "hidden",
        willChange: isVisible && clipPath ? "clip-path" : undefined,
      }}
      aria-hidden={!isVisible}
    >
      <SectionBackground kind={section.bg} phase={phase} />

      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={simActive ? "always" : "never"}
      >
        <ParticleShapeScene
          shape={section.shape}
          impulseRef={impulseRef}
          hoverActiveRef={hoverActiveRef}
          pointerRef={pointerRef}
          active={simActive}
        />
      </Canvas>

      {showContent ? (
        <SectionContent
          index={index}
          reveal={contentReveal}
          fade={contentFade}
          teamIndex={teamIndex}
        />
      ) : null}

      <div
        className="hg-vignette pointer-events-none absolute inset-0"
        style={{ background: vignetteFor(section.bg) }}
        aria-hidden
      />
      <div className="hg-grain pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
    </div>
  );
}

export default function HashgraphVenturesNetwork() {
  const impulseRef = useRef(0);
  const hoverActiveRef = useRef(false);
  const holdRemainingRef = useRef(0);
  const lastTickRef = useRef(performance.now());
  const pointerRef = useRef({ x: 0, y: 0 });
  const phaseRef = useRef(0);
  const progressRef = useRef(0);
  const scrollRef = useRef<LabStickyScrollHandle>(null);
  const snapTweenRef = useRef<gsap.core.Tween | null>(null);
  const snapDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnappingRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const [settledReveal, setSettledReveal] = useState(0);

  const cancelSnap = useCallback(() => {
    snapTweenRef.current?.kill();
    snapTweenRef.current = null;
    isSnappingRef.current = false;
  }, []);

  const runSnapIfNeeded = useCallback(() => {
    const zone = transitionZone(progressRef.current);
    if (!zone || zone.t <= 0.004 || zone.t >= 0.996) return;

    const targetP =
      zone.t < SNAP_THRESHOLD
        ? SECTIONS[zone.curr].start - TRANSITION - 0.0005
        : SECTIONS[zone.curr].start + 0.0005;

    cancelSnap();
    isSnappingRef.current = true;
    const tween = scrollRef.current?.scrollToProgress(targetP, SNAP_DURATION) ?? null;
    snapTweenRef.current = tween;
    tween?.eventCallback("onComplete", () => {
      isSnappingRef.current = false;
      snapTweenRef.current = null;
    });
    tween?.eventCallback("onInterrupt", () => {
      isSnappingRef.current = false;
      snapTweenRef.current = null;
    });
  }, [cancelSnap]);

  const scheduleSnapCheck = useCallback(() => {
    if (snapDebounceRef.current) clearTimeout(snapDebounceRef.current);
    snapDebounceRef.current = setTimeout(runSnapIfNeeded, 160);
  }, [runSnapIfNeeded]);

  const handleProgress = useCallback(
    (p: number) => {
      progressRef.current = p;
      if (!isSnappingRef.current) {
        cancelSnap();
        scheduleSnapCheck();
      }
      setProgress(p);
      phaseRef.current = p * 100;
      const teamP = clamp01((p - 0.66) / 0.18);
      setTeamIndex(Math.min(TEAM.length - 1, Math.floor(teamP * TEAM.length * 1.05)));
    },
    [cancelSnap, scheduleSnapCheck],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
    hoverActiveRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    hoverActiveRef.current = false;
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      if (hoverActiveRef.current) {
        impulseRef.current = 1;
        holdRemainingRef.current = HOVER_HOLD_SEC;
      } else if (holdRemainingRef.current > 0) {
        holdRemainingRef.current -= dt;
        impulseRef.current = 1;
      } else if (impulseRef.current > 0) {
        impulseRef.current = Math.max(0, impulseRef.current - dt / HOVER_RETURN_SEC);
      }

      setPhase(phaseRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const interrupt = () => {
      if (isSnappingRef.current) cancelSnap();
    };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    return () => {
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      if (snapDebounceRef.current) clearTimeout(snapDebounceRef.current);
      cancelSnap();
    };
  }, [cancelSnap]);

  const p = progress;
  const { prev, curr, t } = sectionState(p);
  const inTransition = t > 0.001 && prev !== curr;
  const showFooter = p >= 0.88;

  useEffect(() => {
    if (inTransition || showFooter) {
      setSettledReveal(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = REVEAL_SETTLE_MS;
    const tick = (now: number) => {
      const r = clamp01((now - start) / duration);
      setSettledReveal(r);
      if (r < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inTransition, curr, showFooter]);

  return (
    <LabStickyScroll
      ref={scrollRef}
      onProgress={handleProgress}
      scrollHeightVh={920}
      stickyClassName="text-[#eee]"
      hint="↓ 스크롤 — 전체 화면 대각선 전환"
      showProgress={false}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: BG }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <style>{`
          .hg-water {
            background:
              linear-gradient(180deg, rgba(30,70,130,0.15) 0%, rgba(22,52,98,0.55) 38%, rgba(14,36,72,0.82) 100%),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(100,160,230,0.05) 40px,
                rgba(100,160,230,0.05) 41px
              );
          }
          .hg-water::after {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 120% 40% at 50% 0%, rgba(120,180,240,0.12), rgba(14,36,72,0) 55%);
            animation: hg-ripple 6s ease-in-out infinite;
          }
          .hg-caustics {
            background:
              radial-gradient(ellipse 30% 20% at 25% 30%, rgba(100,160,240,0.28), rgba(14,32,58,0) 70%),
              radial-gradient(ellipse 25% 18% at 65% 45%, rgba(80,140,220,0.22), rgba(12,28,50,0) 65%),
              radial-gradient(ellipse 35% 22% at 45% 60%, rgba(70,130,200,0.18), rgba(10,24,44,0) 68%);
          }
          .hg-grain {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
            mix-blend-mode: overlay;
          }
          @keyframes hg-ripple {
            0%, 100% { transform: scaleY(1) translateY(0); opacity: 0.6; }
            50% { transform: scaleY(1.04) translateY(-4px); opacity: 1; }
          }
        `}</style>

        {SECTIONS.map((section, i) => {
          const layer = getSectionLayerState(i, p, prev, curr, t, inTransition, settledReveal);
          return (
            <FullScreenSection
              key={section.id}
              index={i}
              clipPath={layer.clipPath}
              zIndex={layer.zIndex}
              impulseRef={impulseRef}
              hoverActiveRef={hoverActiveRef}
              pointerRef={pointerRef}
              simActive={layer.simActive && !showFooter}
              phase={phase}
              teamIndex={teamIndex}
              contentReveal={layer.contentReveal}
              contentFade={layer.contentFade}
            />
          );
        })}

        {/* Fixed chrome */}
        <header className="absolute left-6 top-6 z-50 flex items-center gap-3 sm:left-10">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <path d="M16 4 L28 12 V24 L16 28 L4 24 V12 Z" fill="none" stroke="#eee" strokeWidth="1" />
          </svg>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.3em] text-[#eee] sm:inline">
            Hashgraph Ventures
          </span>
        </header>

        <div className="absolute right-6 top-7 z-50 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#eee] sm:right-10">
          <span>Sound on</span>
          <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
            <path d="M1 6 L4 3 L4 9 Z M7 4 Q11 6 7 8 M9 2 Q15 6 9 10" fill="none" stroke="#eee" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="pointer-events-none absolute right-6 top-1/2 z-50 hidden h-40 w-px -translate-y-1/2 bg-[#9bb8e1]/25 sm:block">
          <div
            className="w-full bg-[#e3f4ff]"
            style={{ height: 24, transform: `translateY(${p * 116}px)` }}
          />
        </div>

        {showFooter ? (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0c1e38] text-center">
            <h2 className="text-3xl font-bold uppercase tracking-[0.1em] text-[#eee] sm:text-4xl">
              Hashgraph Ventures
            </h2>
            <p className="mt-3 text-sm text-[#9bb8e1]">AI & Blockchain Venture Capital</p>
          </div>
        ) : null}
      </div>
    </LabStickyScroll>
  );
}
