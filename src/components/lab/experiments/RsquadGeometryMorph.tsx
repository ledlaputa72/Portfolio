"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { LineSegments, Points } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";

const BG = "#000000";
const FG = "#ffffff";
const ACCENT = "#b8fff0";

const PARTICLE_COUNT = 4500;
const PARTICLE_SIZE = 0.0055;
const SCROLL_VH = 720;

const SHAPES = ["tetra", "cube", "octa", "icosa", "dodeca"] as const;
type ShapeId = (typeof SHAPES)[number];

const SECTIONS = [
  {
    id: "clarke",
    start: 0,
    num: "//00",
    kicker: "Arthur C. Clarke's third law",
    title: "Any sufficiently advanced technology is indistinguishable from magic",
    body: "RSquad builds what looks impossible — until it ships.",
  },
  {
    id: "fire",
    start: 0.2,
    num: "//01",
    kicker: "Fire was the first magic",
    title: "Warmth. Light. Civilization began here.",
    body: "Primitives tamed energy. We tame distributed systems.",
  },
  {
    id: "writing",
    start: 0.4,
    num: "//02",
    kicker: "Writing was dangerous sorcery",
    title: "Symbols that captured thought. Now it's code.",
    body: "Every abstraction once looked like heresy.",
  },
  {
    id: "lightning",
    start: 0.6,
    num: "//03",
    kicker: "Lightning belonged to the gods",
    title: "Now it's captured in wires.",
    body: "The internet seemed like fantasy. Now it's infrastructure.",
  },
  {
    id: "blockchain",
    start: 0.8,
    num: "//04",
    kicker: "Time to gather stones",
    title: "Blockchain is next.",
    body: "no fluff, just top-tier blockchain engineering",
  },
] as const;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function goldenDir(i: number, count: number, out = new THREE.Vector3()) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return out.set(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
}

const _tri = new THREE.Triangle();
const _ray = new THREE.Ray();
const _hit = new THREE.Vector3();
const _dir = new THREE.Vector3();

function raycastPolyhedron(dir: THREE.Vector3, geometry: THREE.BufferGeometry, radius: number) {
  _ray.set(new THREE.Vector3(0, 0, 0), _dir.copy(dir).normalize());
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
  return best ?? _dir.copy(dir).normalize().multiplyScalar(radius);
}

const POLY_GEOS: Record<ShapeId, THREE.BufferGeometry> = {
  tetra: new THREE.TetrahedronGeometry(1, 0),
  cube: new THREE.BoxGeometry(1.55, 1.55, 1.55),
  octa: new THREE.OctahedronGeometry(1, 0),
  icosa: new THREE.IcosahedronGeometry(1, 0),
  dodeca: new THREE.DodecahedronGeometry(1, 0),
};

const SHAPE_RADIUS: Record<ShapeId, number> = {
  tetra: 1.15,
  cube: 0.82,
  octa: 1.2,
  icosa: 1.1,
  dodeca: 1.05,
};

function buildShapePositions(shape: ShapeId, count: number) {
  const geo = POLY_GEOS[shape];
  const r = SHAPE_RADIUS[shape];
  const arr = new Float32Array(count * 3);
  const dir = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    goldenDir(i, count, dir);
    const p = raycastPolyhedron(dir, geo, r * (0.94 + Math.random() * 0.06));
    arr[i * 3] = p.x;
    arr[i * 3 + 1] = p.y;
    arr[i * 3 + 2] = p.z;
  }
  return arr;
}

type MorphBuffers = Record<ShapeId, Float32Array>;

function buildMorphLibrary(count: number) {
  const buffers = {} as MorphBuffers;
  for (const id of SHAPES) {
    buffers[id] = buildShapePositions(id, count);
  }
  return buffers;
}

function sampleMorph(
  buffers: MorphBuffers,
  from: ShapeId,
  to: ShapeId,
  t: number,
  count: number,
  out: Float32Array,
) {
  const a = buffers[from];
  const b = buffers[to];
  const s = easeInOutCubic(clamp01(t));
  for (let i = 0; i < count * 3; i++) {
    out[i] = lerp(a[i], b[i], s);
  }
}

function morphState(progress: number) {
  const scaled = progress * (SHAPES.length - 1);
  const idx = Math.min(SHAPES.length - 2, Math.floor(scaled));
  return {
    from: SHAPES[idx],
    to: SHAPES[idx + 1],
    t: scaled - idx,
    index: idx,
  };
}

function sectionOpacity(progress: number, start: number, fade = 0.09) {
  const end = start + 0.22;
  if (progress < start || progress > end) return 0;
  if (progress < start + fade) return (progress - start) / fade;
  if (progress > end - fade) return (end - progress) / fade;
  return 1;
}

function MorphScene({
  progressRef,
  pointerRef,
  active,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  active: boolean;
}) {
  const pointsRef = useRef<Points>(null!);
  const wireRef = useRef<LineSegments>(null!);
  const morphBuffers = useMemo(() => buildMorphLibrary(PARTICLE_COUNT), []);
  const workPos = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const edgeData = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1.2, 1);
    const edges = new THREE.EdgesGeometry(ico);
    ico.dispose();
    const pos = edges.attributes.position as THREE.BufferAttribute;
    const dirs: THREE.Vector3[] = [];
    for (let i = 0; i < pos.count; i++) {
      dirs.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize());
    }
    return { edges, dirs };
  }, []);

  useFrame(({ clock }) => {
    if (!active) return;
    const progress = progressRef.current;
    const { from, to, t } = morphState(progress);
    sampleMorph(morphBuffers, from, to, t, PARTICLE_COUNT, workPos);

    const pts = pointsRef.current;
    if (pts) {
      const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      attr.array.set(workPos);
      attr.needsUpdate = true;
    }

    const wire = wireRef.current;
    if (wire) {
      const wAttr = wire.geometry.getAttribute("position") as THREE.BufferAttribute;
      const s = easeInOutCubic(t);
      for (let i = 0; i < edgeData.dirs.length; i++) {
        const a = raycastPolyhedron(edgeData.dirs[i], POLY_GEOS[from], SHAPE_RADIUS[from]);
        const b = raycastPolyhedron(edgeData.dirs[i], POLY_GEOS[to], SHAPE_RADIUS[to]);
        wAttr.setXYZ(i, lerp(a.x, b.x, s), lerp(a.y, b.y, s), lerp(a.z, b.z, s));
      }
      wAttr.needsUpdate = true;
    }

    const px = pointerRef.current.x * 0.18;
    const py = pointerRef.current.y * 0.14;
    const rot = clock.elapsedTime * 0.14 + progress * 0.6;
    const groupRotX = py * 0.35;
    const groupPosX = px * 0.25;
    const groupPosY = py * 0.2;

    if (pts) {
      pts.rotation.set(groupRotX, rot, 0);
      pts.position.set(groupPosX, groupPosY, 0);
    }
    if (wire) {
      wire.rotation.set(groupRotX, rot, 0);
      wire.position.set(groupPosX, groupPosY, 0);
    }
  });

  const initial = useMemo(() => {
    const a = new Float32Array(PARTICLE_COUNT * 3);
    a.set(morphBuffers.tetra);
    return a;
  }, [morphBuffers]);

  return (
    <>
      <fog attach="fog" args={["#000000", 5, 14]} />
      <ambientLight intensity={0.08} />
      <pointLight position={[2, 3, 4]} intensity={1.8} color={ACCENT} distance={14} />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color={FG} distance={10} />

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[initial, 3]} count={PARTICLE_COUNT} />
        </bufferGeometry>
        <pointsMaterial
          color={FG}
          size={PARTICLE_SIZE}
          transparent
          opacity={0.82}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={wireRef} geometry={edgeData.edges}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.5} />
      </lineSegments>
    </>
  );
}

function GlitchTitle({ children, active }: { children: string; active: boolean }) {
  return (
    <h2
      className={`max-w-3xl text-2xl font-light uppercase leading-[1.15] tracking-[-0.02em] sm:text-4xl md:text-5xl ${
        active ? "rsquad-glitch" : ""
      }`}
      style={{ color: FG }}
    >
      {children}
    </h2>
  );
}

export default function RsquadGeometryMorph() {
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [glitchId, setGlitchId] = useState<(typeof SECTIONS)[number]["id"]>(SECTIONS[0].id);
  const lastSection = useRef(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(p);
    const idx = Math.min(SECTIONS.length - 1, Math.floor(p * SECTIONS.length + 0.001));
    if (idx !== lastSection.current) {
      lastSection.current = idx;
      setGlitchId(SECTIONS[idx].id);
    }
  }, []);

  const { from, to, t, index } = morphState(progress);

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-white"
      hint="↓ 스크롤 — 기하 구조 모핑"
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: BG }}>
        <style>{`
          .rsquad-glitch {
            animation: rsquad-glitch 0.55s steps(2, end);
          }
          @keyframes rsquad-glitch {
            0% { transform: translate(0); filter: none; }
            20% { transform: translate(-2px, 1px); text-shadow: 2px 0 #00ffd5, -2px 0 #ff2a6d; }
            40% { transform: translate(2px, -1px); text-shadow: -2px 0 #00ffd5, 2px 0 #ff2a6d; }
            60% { transform: translate(-1px, 0); filter: brightness(1.2); }
            100% { transform: translate(0); filter: none; text-shadow: none; }
          }
          .rsquad-grid {
            background-image:
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
            background-size: 48px 48px;
          }
        `}</style>

        <div className="rsquad-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

        <Canvas
          className="absolute inset-0"
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            pointerRef.current = {
              x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
              y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
            };
          }}
        >
          <MorphScene progressRef={progressRef} pointerRef={pointerRef} active />
        </Canvas>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)",
          }}
          aria-hidden
        />

        <header className="absolute left-6 top-6 z-20 flex items-center gap-4 sm:left-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">RSquad</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 sm:inline">
            Blockchain Lab
          </span>
        </header>

        <div className="absolute right-6 top-6 z-20 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 sm:right-10">
          {from} → {to} · {Math.round(t * 100)}%
        </div>

        {SECTIONS.map((section) => {
          const opacity = sectionOpacity(progress, section.start);
          if (opacity < 0.02) return null;
          return (
            <div
              key={section.id}
              className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-16 sm:px-10 sm:pb-20"
              style={{ opacity }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">{section.num}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
                {section.kicker}
              </p>
              <div className="mt-4">
                <GlitchTitle active={glitchId === section.id}>{section.title}</GlitchTitle>
              </div>
              <p className="mt-5 max-w-md text-xs leading-relaxed text-white/55 sm:text-sm">{section.body}</p>
            </div>
          );
        })}

        <footer className="pointer-events-none absolute bottom-6 left-6 z-20 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 sm:left-10">
          morph {index + 1}/{SHAPES.length - 1}
        </footer>
      </div>
    </LabStickyScroll>
  );
}
