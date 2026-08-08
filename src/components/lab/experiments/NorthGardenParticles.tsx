"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Points } from "three";
import * as THREE from "three";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const PARTICLE_COUNT = 1100;

const SECTIONS = [
  {
    id: "home",
    start: 0,
    end: 0.28,
    kicker: "Design & Development Studio",
    title: "NorthGarden",
    sub: "Digital products, websites, and interactive experiences — used by millions around the world.",
  },
  {
    id: "work",
    start: 0.28,
    end: 0.54,
    kicker: "Work",
    title: "Selected Work",
    sub: "Digital products, websites, and interactive experiences for artists, brands, and studios.",
  },
  {
    id: "services",
    start: 0.54,
    end: 0.78,
    kicker: "Services",
    title: "Design · Dev · Creative Tech",
    sub: "Thoughtful design, precise engineering, and creative technology at scale.",
  },
  {
    id: "contact",
    start: 0.78,
    end: 1,
    kicker: "Start a Project",
    title: "Let's Grow",
    sub: "Where ideas grow, designs breathe, and products come to life.",
  },
] as const;

const WORK_ITEMS = [
  "Colossal",
  "BrewBird",
  "Beautiful Universe",
  "Glenwood",
  "Suplex",
  "Cenima",
] as const;

const PALETTE = [
  new THREE.Color("#f7f4ef"),
  new THREE.Color("#ebe6dc"),
  new THREE.Color("#ddd6c8"),
  new THREE.Color("#d2dcc8"),
  new THREE.Color("#e8e2d6"),
  new THREE.Color("#cfc9bc"),
];

function sectionOpacity(progress: number, start: number, end: number, fade = 0.14) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type ParticleState = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  scale: number;
  color: THREE.Color;
};

function createParticles(): ParticleState[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)].clone();
    return {
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 4 - 1,
      vx: (Math.random() - 0.5) * 0.004,
      vy: (Math.random() - 0.5) * 0.003,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.02,
      scale: 0.35 + Math.random() * 0.85,
      color,
    };
  });
}

function WindParticles({
  windRef,
  pointerRef,
  progressRef,
  onBgSample,
}: {
  windRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  progressRef: React.RefObject<number>;
  onBgSample: (hex: string) => void;
}) {
  const pointsRef = useRef<Points>(null!);
  const particlesRef = useRef(createParticles());
  const sampleTimer = useRef(0);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    return { positions, colors };
  }, []);

  useFrame(({ clock }, delta) => {
    const pts = particlesRef.current;
    const wind = windRef.current;
    const { x: px, y: py } = pointerRef.current;
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    let sr = 0;
    let sg = 0;
    let sb = 0;
    let sampleN = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = pts[i];

      const fieldX =
        Math.sin(p.y * 0.45 + t * 0.55) * 0.55 +
        Math.cos(p.z * 0.8 + t * 0.35) * 0.25 +
        px * 0.65;
      const fieldY =
        Math.cos(p.x * 0.38 + t * 0.42) * 0.35 -
        0.12 +
        py * 0.2;

      p.vx = lerp(p.vx, fieldX * wind * 0.014, 0.06);
      p.vy = lerp(p.vy, fieldY * wind * 0.012, 0.06);

      p.x += p.vx * (1 + progressRef.current * 0.6);
      p.y += p.vy * (1 + progressRef.current * 0.6);
      p.rot += p.rotV + p.vx * 2.2;

      if (p.x > 9) p.x = -9;
      if (p.x < -9) p.x = 9;
      if (p.y > 6) p.y = -6;
      if (p.y < -6) p.y = 6;

      const ix = i * 3;
      positions[ix] = p.x;
      positions[ix + 1] = p.y;
      positions[ix + 2] = p.z;
      colors[ix] = p.color.r;
      colors[ix + 1] = p.color.g;
      colors[ix + 2] = p.color.b;

      if (p.y < -2.5 && p.y > -4.5 && Math.abs(p.x) < 2.5) {
        sr += p.color.r;
        sg += p.color.g;
        sb += p.color.b;
        sampleN += 1;
      }
    }

    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      geom.attributes.position.needsUpdate = true;
      geom.attributes.color.needsUpdate = true;
    }

    sampleTimer.current += delta;
    if (sampleN > 0 && sampleTimer.current > 0.12) {
      sampleTimer.current = 0;
      const r = Math.round((sr / sampleN) * 255);
      const g = Math.round((sg / sampleN) * 255);
      const b = Math.round((sb / sampleN) * 255);
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      onBgSample(hex);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        vertexColors
        transparent
        opacity={0.82}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

function PetalInstances({
  windRef,
  pointerRef,
  progressRef,
}: {
  windRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  progressRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const particlesRef = useRef(createParticles().slice(0, 280));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const wind = windRef.current;
    const { x: px, y: py } = pointerRef.current;
    const t = clock.elapsedTime;
    const scrollBoost = 1 + progressRef.current * 0.5;

    particlesRef.current.forEach((p, i) => {
      const fieldX =
        Math.sin(p.y * 0.5 + t * 0.5) * 0.6 + px * 0.5;
      const fieldY =
        Math.cos(p.x * 0.4 + t * 0.38) * 0.3 - 0.1 + py * 0.15;

      p.vx = lerp(p.vx, fieldX * wind * 0.016, 0.07);
      p.vy = lerp(p.vy, fieldY * wind * 0.013, 0.07);
      p.x += p.vx * scrollBoost;
      p.y += p.vy * scrollBoost;
      p.rot += p.rotV + p.vx * 1.8;

      if (p.x > 9) p.x = -9;
      if (p.x < -9) p.x = 9;
      if (p.y > 6) p.y = -6;
      if (p.y < -6) p.y = 6;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0, 0, p.rot);
      dummy.scale.set(p.scale * 0.14, p.scale * 0.22, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, p.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 280]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function ThemeColorReader({
  onBgSample,
}: {
  onBgSample: (hex: string) => void;
}) {
  const { gl } = useThree();
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current < 0.25) return;
    timer.current = 0;

    const canvas = gl.domElement;
    const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pixel = new Uint8Array(4);
    ctx.readPixels(Math.floor(w / 2), Math.floor(h * 0.08), 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pixel);
    const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1].toString(16).padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;
    onBgSample(hex);
  });

  return null;
}

function NorthGardenScene({
  windRef,
  pointerRef,
  progressRef,
  onBgSample,
  readPixels,
}: {
  windRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  progressRef: React.RefObject<number>;
  onBgSample: (hex: string) => void;
  readPixels: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#1a1814"]} />
      <fog attach="fog" args={["#1a1814", 6, 14]} />
      <ambientLight intensity={0.55} color="#f0ebe3" />
      <directionalLight position={[2, 3, 4]} intensity={0.35} color="#ffffff" />
      <WindParticles
        windRef={windRef}
        pointerRef={pointerRef}
        progressRef={progressRef}
        onBgSample={onBgSample}
      />
      <PetalInstances windRef={windRef} pointerRef={pointerRef} progressRef={progressRef} />
      {readPixels ? <ThemeColorReader onBgSample={onBgSample} /> : null}
    </>
  );
}

export default function NorthGardenParticles() {
  const progressRef = useRef(0);
  const windRef = useRef(0.65);
  const pointerRef = useRef({ x: 0, y: 0 });
  const workRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [bgColor, setBgColor] = useState("#ebe6dc");
  const [windPct, setWindPct] = useState(65);

  const handleBgSample = useCallback((hex: string) => {
    setBgColor(hex);
  }, []);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));

    const wind = 0.45 + p * 0.85;
    windRef.current = wind;
    setWindPct(Math.round(wind * 100));

    if (workRef.current && p > 0.24) {
      const items = workRef.current.querySelectorAll("[data-work]");
      const local = gsap.utils.clamp(0, 1, (p - 0.24) / 0.36);
      items.forEach((el, i) => {
        const start = i / WORK_ITEMS.length;
        const end = (i + 1) / WORK_ITEMS.length;
        const t = gsap.utils.clamp(0, 1, (local - start) / Math.max(0.001, end - start));
        gsap.set(el, {
          opacity: 0.1 + t * 0.9,
          y: 20 * (1 - t),
        });
      });
    }
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const p = progress / 100;
  const showWork = p > 0.24 && p < 0.62;
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={440}
      stickyClassName="text-white"
      hint={locale === "ko" ? "↓ 스크롤 — 바람 파티클 필드 · 배경색 동기화" : "↓ Scroll — wind particle field · background-color sync"}
      showProgress={false}
    >
      <div
        className="relative h-full w-full transition-colors duration-500"
        style={{ backgroundColor: bgColor }}
        onPointerMove={handlePointer}
      >
        <div className="absolute inset-0 opacity-90">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 40 }}
            gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }}
            dpr={[0.75, 1.35]}
          >
            <NorthGardenScene
              windRef={windRef}
              pointerRef={pointerRef}
              progressRef={progressRef}
              onBgSample={handleBgSample}
              readPixels
            />
          </Canvas>
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col px-5 py-8 sm:px-10">
          <div className="flex justify-center">
            <nav className="pointer-events-auto flex items-center gap-6 rounded-sm bg-white/15 px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-3xl">
              <span className="font-semibold tracking-tight normal-case">NorthGarden</span>
              <span className="hidden text-white/50 sm:inline">Work</span>
              <span className="hidden text-white/50 sm:inline">Services</span>
              <span className="hidden text-white/40 sm:inline">Start a Project</span>
            </nav>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center text-center">
            {SECTIONS.map((s) => {
              const o = sectionOpacity(p, s.start, s.end);
              return (
                <div
                  key={s.id}
                  className="absolute inset-x-4 max-w-2xl sm:inset-x-8"
                  style={{ opacity: o }}
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/55">
                    {s.kicker}
                  </p>
                  <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-6xl">
                    {s.title}
                  </h3>
                  <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/75">
                    {s.sub}
                  </p>
                </div>
              );
            })}

            <div
              ref={workRef}
              className="absolute bottom-[28%] flex flex-wrap justify-center gap-2 sm:gap-3"
              style={{ opacity: showWork ? 1 : 0 }}
            >
              {WORK_ITEMS.map((name) => (
                <span
                  key={name}
                  data-work
                  className="rounded-sm border border-white/20 bg-black/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/70 backdrop-blur-sm"
                  style={{ opacity: 0.1, transform: "translateY(20px)" }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between text-[10px] uppercase tracking-[0.2em]">
            <span className="text-white/40">Wind {windPct}%</span>
            <span className="tabular-nums text-white/70">{progress}%</span>
          </div>
        </div>
      </div>
    </LabStickyScroll>
  );
}
