"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";

const BG = "#e8e4dc";
const TEXT = "#1a1814";
const MUTED = "#7a7368";
const ACCENT = "#5c6b5a";

const SCROLL_VH = 2900;

const NAV = ["fabrics", "applications", "technology", "about", "contact"] as const;

const FABRIC_LINES = [
  { id: "prints", label: "Prints", sub: "S-Line · S-Block · Classic" },
  { id: "solids", label: "Solids", sub: "Problock · Polyester · Reflection" },
  { id: "acrylics", label: "Acrylics", sub: "Proacryl · Dralon" },
] as const;

const SPECS = [
  { label: "Water proofing", value: "100%", at: 0.52 },
  { label: "Spray test", value: "Grade 5", at: 0.58 },
  { label: "Lotus effect", value: "Self-cleaned", at: 0.64 },
  { label: "UPF", value: "80", at: 0.7 },
  { label: "GTOT", value: "0.04", at: 0.76 },
] as const;

const CHAPTERS = [
  {
    id: "hero",
    start: 0,
    end: 0.14,
    kicker: null,
    title: "Engineered to shade",
    title2: "Designed to inspire",
    body: "Technical shade fabrics of high aesthetics designed for maximum energy performance.",
  },
  {
    id: "fabrics",
    start: 0.12,
    end: 0.28,
    kicker: "υφάσματα · fabrics",
    title: "Technical fabrics",
    body: "Prints, solids and acrylics — engineered for shade structures worldwide.",
  },
  {
    id: "applications",
    start: 0.26,
    end: 0.4,
    kicker: "εφαρμογές · applications",
    title: "Shade architecture",
    body: "Pergolas, tensile structures and commercial shading — precision tensioned installations.",
  },
  {
    id: "technology",
    start: 0.38,
    end: 0.54,
    kicker: "τεχνολογία · technology",
    title: "Lotus effect",
    body: "Scroll to activate water repellency — droplets bead and roll off the coated surface.",
  },
  {
    id: "specs",
    start: 0.52,
    end: 0.68,
    kicker: "Technical data",
    title: "Problock · Proacryl",
    body: "Multi-layer coating for maximum opacity, UV resistance and self-cleaning performance.",
  },
  {
    id: "heritage",
    start: 0.66,
    end: 0.82,
    kicker: "για εμάς · about",
    title: "Industrial heritage",
    body: "Greece's oldest technical shade fabrics manufacturer — blending heritage with sustainable design.",
  },
  {
    id: "contact",
    start: 0.8,
    end: 1,
    kicker: "επικοινωνία · contact",
    title: "Request samples",
    body: "Explore fabrics, applications and technical documentation.",
    cta: "ΠΕΡΙΣΣΟΤΕΡΑ",
  },
] as const;

const vertexShader = /* glsl */ `
varying vec2 vUv;
uniform float uWarp;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(uv.x * 28.0 + uWarp) * 0.02 + sin(uv.y * 22.0 - uWarp * 0.7) * 0.015;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uProtection;
uniform float uScroll;
uniform vec2 uPointer;
uniform float uMacro;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float weave(vec2 uv) {
  vec2 p = uv * vec2(95.0, 88.0);
  p += uPointer * 0.08;
  float warp = sin(p.x + sin(p.y * 0.35) * 0.4);
  float weft = sin(p.y + sin(p.x * 0.35) * 0.4);
  float twill = sin((p.x + p.y) * 0.5) * 0.15;
  return clamp(warp * weft + twill, -1.0, 1.0) * 0.5 + 0.5;
}

float drop(vec2 uv, vec2 center, float r) {
  float d = length((uv - center) * vec2(1.0, 1.15));
  float body = smoothstep(r, r * 0.35, d);
  float spec = smoothstep(0.015, 0.0, d - r * 0.55) * 0.85;
  return body + spec;
}

void main() {
  vec2 uv = vUv;
  float wind = sin(uTime * 0.35 + uv.x * 3.0) * 0.004;
  uv.x += wind + uPointer.x * 0.012;

  float w = weave(uv);
  vec3 baseLo = vec3(0.72, 0.68, 0.62);
  vec3 baseHi = vec3(0.86, 0.83, 0.78);
  vec3 fabric = mix(baseLo, baseHi, w);

  float fiber = noise(uv * 180.0) * 0.04;
  fabric += fiber - 0.02;

  float macro = smoothstep(0.4, 1.0, uMacro);
  fabric *= 0.92 + macro * 0.08;

  float stainAmt = (1.0 - uProtection) * 0.55;
  float stain = smoothstep(0.25, 0.75, uv.y + sin(uv.x * 8.0) * 0.04) * stainAmt;
  vec3 stainCol = vec3(0.35, 0.28, 0.22);
  fabric = mix(fabric, stainCol, stain * 0.7);

  float prot = uProtection;
  float t = uTime;

  vec2 d0 = vec2(0.28 + sin(t * 0.4) * 0.02, 0.62 - prot * 0.35);
  vec2 d1 = vec2(0.52, 0.58 - prot * 0.42 + sin(t * 0.5) * 0.01);
  vec2 d2 = vec2(0.71, 0.55 - prot * 0.38);
  vec2 d3 = vec2(0.42, 0.48 - prot * 0.5);
  vec2 d4 = vec2(0.6 + sin(t * 0.3) * 0.03, 0.44 - prot * 0.45);

  float drops = 0.0;
  drops += drop(uv, d0, 0.045 * (0.5 + prot)) * smoothstep(0.2, 0.55, prot);
  drops += drop(uv, d1, 0.038 * (0.5 + prot)) * smoothstep(0.25, 0.6, prot);
  drops += drop(uv, d2, 0.042 * (0.5 + prot)) * smoothstep(0.3, 0.65, prot);
  drops += drop(uv, d3, 0.032 * (0.5 + prot)) * smoothstep(0.35, 0.7, prot);
  drops += drop(uv, d4, 0.036 * (0.5 + prot)) * smoothstep(0.4, 0.75, prot);

  vec3 water = vec3(0.75, 0.82, 0.9);
  fabric = mix(fabric, water, drops * 0.55);
  fabric += vec3(0.15) * drops;

  float soak = (1.0 - prot) * smoothstep(0.5, 0.0, abs(uv.x - 0.5)) * 0.08;
  fabric = mix(fabric, vec3(0.45, 0.42, 0.38), soak);

  vec2 light = vec2(0.35 + uPointer.x * 0.1, 0.65 + uPointer.y * 0.08);
  float spec = pow(max(0.0, 1.0 - length(uv - light) * 1.8), 3.0) * (0.15 + prot * 0.2);
  fabric += spec;

  float vig = smoothstep(1.2, 0.25, length(uv - 0.5) * (1.4 - macro * 0.3));
  fabric *= vig;

  float grade = 0.98 + sin(uv.y * 2.0 + uScroll * 3.0) * 0.02;
  fabric *= grade;

  gl_FragColor = vec4(fabric, 1.0);
}
`;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function panelRise(p: number, start: number, end: number) {
  return easeInOutCubic(smoothstep(start, end, p));
}

function chapterOpacity(p: number, start: number, end: number, fade = 0.1) {
  const range = end - start;
  const fadeW = range * fade;
  if (p < start || p > end) return 0;
  if (p < start + fadeW) return (p - start) / fadeW;
  if (p > end - fadeW) return (end - p) / fadeW;
  return 1;
}

function protectionLevel(p: number) {
  return easeInOutCubic(smoothstep(0.18, 0.72, p));
}

function macroZoom(p: number) {
  return smoothstep(0.08, 0.45, p);
}

function activeChapterIndex(p: number) {
  let best = 0;
  let bestO = 0;
  CHAPTERS.forEach((ch, i) => {
    const o = chapterOpacity(p, ch.start, ch.end);
    if (o > bestO) {
      bestO = o;
      best = i;
    }
  });
  return best;
}

function FabricMacroScene({
  progressRef,
  protectionRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  protectionRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();
  const targetCam = useRef(new THREE.Vector3(0, 0, 2.8));

  const uniforms = useRef({
    uTime: { value: 0 },
    uProtection: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uMacro: { value: 0 },
    uWarp: { value: 0 },
  }).current;

  useFrame(({ clock, camera }) => {
    const p = progressRef.current;
    const prot = protectionRef.current;
    if (!matRef.current) return;

    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uProtection.value = prot;
    matRef.current.uniforms.uScroll.value = p;
    matRef.current.uniforms.uMacro.value = macroZoom(p);
    matRef.current.uniforms.uWarp.value = clock.elapsedTime * 0.4 + p * 2.0;
    matRef.current.uniforms.uPointer.value.set(pointerRef.current.x * 0.5, pointerRef.current.y * 0.5);

    const z = lerp(2.9, 1.65, macroZoom(p));
  const y = lerp(0, -0.15, smoothstep(0.35, 0.55, p));
    targetCam.current.set(0, y, z);
    camera.position.lerp(targetCam.current, 0.06);
    camera.lookAt(0, 0, 0);
  });

  return (
    <mesh scale={[viewport.width * 1.05, viewport.height * 1.05, 1]}>
      <planeGeometry args={[1, 1, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function ChapterSlide({
  rise,
  zIndex,
  children,
  light = false,
}: {
  rise: number;
  zIndex: number;
  children: ReactNode;
  light?: boolean;
}) {
  if (rise < 0.001) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex,
        transform: `translateY(${lerp(105, 0, rise)}%)`,
        background: light ? `rgba(232,228,220,0.92)` : `rgba(26,24,20,0.94)`,
        color: light ? TEXT : "#f5f3ef",
      }}
    >
      {children}
    </div>
  );
}

export default function FabricsProtectionWeave() {
  const progressRef = useRef(0);
  const protectionRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    protectionRef.current = protectionLevel(p);
    setProgress(p);
    setChapterIdx(activeChapterIndex(p));
  }, []);

  const prot = protectionLevel(progress);
  const heroFade = 1 - smoothstep(0.1, 0.2, progress);

  const riseFabrics = panelRise(progress, 0.12, 0.24);
  const riseApps = panelRise(progress, 0.24, 0.36);
  const riseTech = panelRise(progress, 0.36, 0.48);
  const riseSpecs = panelRise(progress, 0.48, 0.6);
  const riseHeritage = panelRise(progress, 0.6, 0.72);
  const riseContact = panelRise(progress, 0.72, 0.86);

  const fabricLine = Math.min(2, Math.floor(smoothstep(0.14, 0.26, progress) * 3));

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#1a1814]"
      hint="↓ 스크롤 — 로터스 이펙트"
      showProgress={false}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: BG }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          pointerRef.current = {
            x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
          };
        }}
      >
        <div className="absolute inset-0 z-0">
          <Canvas className="absolute inset-0" dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
            <color attach="background" args={[BG]} />
            <FabricMacroScene progressRef={progressRef} protectionRef={protectionRef} pointerRef={pointerRef} />
          </Canvas>
        </div>

        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-center justify-between px-6 py-5 sm:px-10"
          style={{ opacity: smoothstep(0.04, 0.12, progress) }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: TEXT }}>
            Protection
          </span>
          <nav className="hidden gap-6 font-mono text-[9px] uppercase tracking-[0.2em] sm:flex" style={{ color: MUTED }}>
            {NAV.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </nav>
        </header>

        {/* Hero overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 py-16 sm:px-12 sm:py-20"
          style={{ opacity: heroFade }}
        >
          <div />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-light leading-[1.05] tracking-tight sm:text-6xl md:text-7xl" style={{ color: TEXT }}>
              Engineered to shade
              <br />
              <span className="text-black/40">Designed to inspire</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
              Technical shade fabrics of high aesthetics designed for maximum energy performance.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: MUTED }}>
            Scroll
          </p>
        </div>

        <ChapterSlide rise={riseFabrics} zIndex={30} light>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
              υφάσματα · fabrics
            </p>
            <h2 className="mt-4 text-3xl font-light sm:text-5xl">Technical fabrics</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {FABRIC_LINES.map((line, i) => (
                <div
                  key={line.id}
                  className="border p-5"
                  style={{
                    borderColor: i === fabricLine ? ACCENT : "rgba(0,0,0,0.12)",
                    opacity: smoothstep(0.14 + i * 0.03, 0.22 + i * 0.03, progress),
                  }}
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
                    {line.label}
                  </p>
                  <p className="mt-2 text-sm">{line.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseApps} zIndex={35}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">εφαρμογές · applications</p>
            <h2 className="mt-4 max-w-xl text-3xl font-light sm:text-5xl">Shade architecture</h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/55">
              Pergolas, tensile membranes and commercial shading — engineered for tension, weather and longevity.
            </p>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseTech} zIndex={40}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">τεχνολογία · technology</p>
            <h2 className="mt-4 text-3xl font-light sm:text-5xl">Lotus effect</h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/55">
              Scroll to increase water repellency — watch droplets bead and roll off the macro fabric surface behind.
            </p>
            <div className="mt-10 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${prot * 100}%`, background: ACCENT, transition: "width 0.05s linear" }}
              />
            </div>
            <p className="mt-3 font-mono text-[10px] tabular-nums text-white/40">
              Repellency {Math.round(prot * 100)}%
            </p>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseSpecs} zIndex={45}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">Technical data</p>
            <h2 className="mt-4 text-3xl font-light sm:text-5xl">Problock · Proacryl</h2>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {SPECS.map((s) => {
                const on = progress >= s.at - 0.06;
                return (
                  <div key={s.label} style={{ opacity: on ? 1 : 0.35 }}>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-white/40">{s.label}</p>
                    <p className="mt-1 text-xl font-light tabular-nums">{s.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseHeritage} zIndex={50}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">για εμάς · about</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-light sm:text-5xl">Industrial heritage</h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/55">
              A digital presence blending Greece&apos;s oldest technical shade fabrics legacy with modern, sustainable
              design.
            </p>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseContact} zIndex={55}>
          <div className="flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">επικοινωνία · contact</p>
            <h2 className="mt-6 text-4xl font-light sm:text-6xl">Request samples</h2>
            <span className="mt-10 border-b border-white/35 pb-1 font-mono text-[10px] uppercase tracking-[0.35em]">
              ΠΕΡΙΣΣΟΤΕΡΑ
            </span>
          </div>
        </ChapterSlide>

        <div className="pointer-events-none absolute bottom-6 left-6 z-[100] font-mono text-[9px] uppercase tracking-widest mix-blend-difference" style={{ color: TEXT }}>
          <span className="tabular-nums">Repellency {Math.round(prot * 100)}%</span>
        </div>

        <div className="pointer-events-none absolute right-5 top-1/2 z-[100] flex -translate-y-1/2 flex-col gap-1">
          {CHAPTERS.slice(1).map((ch, i) => (
            <span
              key={ch.id}
              className="h-0.5 rounded-full"
              style={{
                width: i + 1 === chapterIdx ? 14 : 5,
                background: i + 1 === chapterIdx ? ACCENT : "rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </LabStickyScroll>
  );
}
