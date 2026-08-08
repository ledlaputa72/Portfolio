"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const WHITE = "#fafaf8";
const BLACK = "#0a0a0a";
const MUTED = "#6b6b6b";
const MUTED_LIGHT = "#999999";

const SCROLL_VH = 3200;

const SERVICES = [
  "Creative Direction",
  "Video Production",
  "Post-Production",
  "Photography",
  "VFX",
] as const;

const CLIENTS = [
  "Salomon",
  "ON Running",
  "Puma",
  "Nike",
  "The North Face",
  "Saucony",
  "Garmin",
  "Ciele",
  "Shokz",
  "Auclair",
  "Altitude Sports",
  "Le Braquet",
] as const;

const ATHLETES =
  "Mathieu Blanchard, Conner Mantz, Helen Obiri, Tom Evans, Jay Du Temple, Rener Gracie, Marianne Hogan, Katie Schide, Lucy Bartholomew, Dan Green, Sara Alonso, Dakota Popehn, Adam Peterman, Germain Grangier, Blandine L'Hirondel, Ruy Hueda, Arthur Joyeux-Bouillon, Jisub Kim, Yuri Yoshizumi, Rosanna Buchhauer, Jean-Philippe Thibodeau and many more";

const WORK_STILLS = [
  { brand: "Puma", hue: 0.02, rot: -6, x: -8, y: 4, px: -1.4, py: 0.3, pz: 0.2 },
  { brand: "Salomon", hue: 0.55, rot: 4, x: 12, y: -6, px: 1.2, py: -0.2, pz: -0.3 },
  { brand: "Auclair", hue: 0.72, rot: -3, x: -4, y: 14, px: -0.5, py: 0.8, pz: 0.5 },
  { brand: "Ciele", hue: 0.35, rot: 7, x: 18, y: 8, px: 1.6, py: 0.5, pz: 0.1 },
  { brand: "Nike", hue: 0.12, rot: -5, x: 6, y: -12, px: 0.6, py: -0.6, pz: -0.2 },
  { brand: "ON", hue: 0.48, rot: 2, x: -14, y: -8, px: -1.0, py: -0.5, pz: 0.4 },
] as const;

const CHAPTERS = [
  { id: "tagline", start: 0.1, end: 0.2, light: true },
  { id: "worldwide", start: 0.18, end: 0.3, light: true },
  { id: "bts", start: 0.28, end: 0.4, light: false },
  { id: "services", start: 0.38, end: 0.5, light: false },
  { id: "work", start: 0.48, end: 0.62, light: false },
  { id: "clients", start: 0.6, end: 0.72, light: false },
  { id: "athletes", start: 0.7, end: 0.82, light: false },
  { id: "cta", start: 0.8, end: 0.94, light: false },
] as const;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrub;
uniform float uMask;
uniform vec3 uTint;
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

vec3 clipTrail(float t, vec2 uv) {
  float horizon = 0.42 + sin(t * 6.28) * 0.02;
  vec3 sky = mix(vec3(0.55, 0.48, 0.42), vec3(0.72, 0.65, 0.58), uv.y);
  vec3 ground = vec3(0.18, 0.14, 0.11);
  vec3 base = mix(ground, sky, smoothstep(horizon - 0.08, horizon + 0.02, uv.y));
  float streak = smoothstep(0.35, 0.0, abs(uv.y - horizon - 0.05));
  streak *= smoothstep(0.2, 0.85, uv.x + sin(t * 12.0 + uv.y * 8.0) * 0.04);
  base = mix(base, vec3(0.95, 0.88, 0.78), streak * 0.7);
  return base;
}

vec3 clipSpeed(float t, vec2 uv) {
  vec2 p = uv;
  p.x += sin(t * 20.0) * 0.08 * smoothstep(0.3, 0.9, uv.x);
  float band = smoothstep(0.25, 0.75, uv.y);
  vec3 col = mix(vec3(0.05), vec3(0.85, 0.35, 0.22), band);
  float blur = noise(vec2(p.x * 40.0 - t * 30.0, p.y * 6.0)) * 0.35;
  col += vec3(blur * 0.4);
  return col;
}

vec3 clipMountain(float t, vec2 uv) {
  float ridge = 0.35 + noise(vec2(uv.x * 3.0, 0.0)) * 0.15;
  vec3 sky = vec3(0.12, 0.16, 0.22);
  vec3 peak = vec3(0.25, 0.28, 0.32);
  vec3 col = mix(peak, sky, smoothstep(ridge - 0.05, ridge + 0.2, uv.y));
  col += vec3(0.15, 0.2, 0.28) * smoothstep(0.5, 0.0, abs(uv.x - 0.5 - sin(t * 2.0) * 0.1));
  return col;
}

vec3 clipNight(float t, vec2 uv) {
  vec3 night = vec3(0.03, 0.04, 0.08);
  float lamp = smoothstep(0.15, 0.0, length(uv - vec2(0.7 + sin(t * 3.0) * 0.05, 0.55)));
  night += vec3(1.0, 0.75, 0.4) * lamp * 0.35;
  float runner = smoothstep(0.12, 0.0, length(uv - vec2(fract(t * 0.15), 0.45)));
  night += vec3(0.9) * runner * 0.5;
  return night;
}

float blobMask(vec2 uv, float t) {
  vec2 c = vec2(0.5 + sin(t * 1.2) * 0.06, 0.48 + cos(t * 0.9) * 0.05);
  vec2 d = uv - c;
  float angle = atan(d.y, d.x);
  float radius = 0.22 + sin(angle * 3.0 + t * 2.0) * 0.06 + cos(angle * 5.0 - t) * 0.03;
  return smoothstep(radius + 0.02, radius - 0.01, length(d));
}

void main() {
  vec2 uv = vUv;
  float t = uScrub * 8.0 + uTime * 0.15;

  float seg = uScrub * 4.0;
  float idx = floor(seg);
  float blend = fract(seg);
  vec3 c0 = clipTrail(t, uv);
  vec3 c1 = clipSpeed(t + 1.0, uv);
  vec3 c2 = clipMountain(t + 2.0, uv);
  vec3 c3 = clipNight(t + 3.0, uv);
  vec3 c4 = clipTrail(t + 4.0, uv);

  vec3 col = c0;
  if (idx < 1.0) col = mix(c0, c1, smoothstep(0.0, 1.0, blend));
  else if (idx < 2.0) col = mix(c1, c2, smoothstep(0.0, 1.0, blend));
  else if (idx < 3.0) col = mix(c2, c3, smoothstep(0.0, 1.0, blend));
  else col = mix(c3, c4, smoothstep(0.0, 1.0, blend));

  float grain = (hash(uv * 900.0 + uTime) - 0.5) * 0.06;
  col += grain;

  float motion = noise(vec2(uv.x * 30.0 - uScrub * 80.0, uv.y * 4.0)) * 0.12;
  col = mix(col, col * 1.2, motion * smoothstep(0.15, 0.45, uScrub));

  col *= uTint;

  if (uMask > 0.5) {
    float m = blobMask(uv, t);
    col = mix(vec3(0.98, 0.98, 0.97), col, m);
  }

  gl_FragColor = vec4(col, 1.0);
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

function videoScrub(p: number) {
  return easeInOutCubic(smoothstep(0.04, 0.78, p));
}

function loadPercent(p: number, atEnd = false) {
  if (atEnd) return Math.round((1 - smoothstep(0.88, 0.96, p)) * 100);
  return Math.round(smoothstep(0, 0.065, p) * 100);
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

function bgPhase(p: number) {
  return smoothstep(0.26, 0.38, p);
}

/** 3D object appears in three scroll beats — mid transition, work bridge, footer (ref. Codrops) */
function objectVisibility(p: number) {
  const beatA = smoothstep(0.2, 0.27, p) * (1 - smoothstep(0.34, 0.4, p));
  const beatB = smoothstep(0.44, 0.5, p) * (1 - smoothstep(0.56, 0.62, p));
  const beatC = smoothstep(0.74, 0.8, p) * (1 - smoothstep(0.9, 0.96, p));
  return Math.max(beatA, beatB, beatC);
}

function objectPhase(p: number) {
  if (p >= 0.72) return 2;
  if (p >= 0.42) return 1;
  return 0;
}

function mosaicVisibility(p: number) {
  return smoothstep(0.47, 0.54, p) * (1 - smoothstep(0.6, 0.67, p));
}

function SportsFilmPlane({
  scrubRef,
  maskRef,
  tintRef,
}: {
  scrubRef: React.RefObject<number>;
  maskRef: React.RefObject<number>;
  tintRef: React.RefObject<THREE.Color>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uScrub: { value: 0 },
    uMask: { value: 0 },
    uTint: { value: new THREE.Color(1, 1, 1) },
  }).current;

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uScrub.value = scrubRef.current;
    matRef.current.uniforms.uMask.value = maskRef.current;
    matRef.current.uniforms.uTint.value.copy(tintRef.current);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function PodiumMonolith({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null!);
  const ringRef = useRef<Group>(null!);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const vis = objectVisibility(p);
    const phase = objectPhase(p);
    const t = clock.elapsedTime;

    if (!groupRef.current) return;
    groupRef.current.visible = vis > 0.02;

    const enter = smoothstep(0, 0.35, vis);
    const scale = lerp(0.45, 1.05, enter) * vis;
    groupRef.current.scale.setScalar(scale);

    const x = phase === 0 ? 1.1 : phase === 1 ? -0.9 : 0.2;
    const y = lerp(-1.4, phase === 2 ? -0.55 : 0.05, enter) + Math.sin(t * 0.9) * 0.04;
    const z = phase === 1 ? 0.3 : -0.1;
    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.y = t * 0.4 + p * Math.PI * 0.5;
    groupRef.current.rotation.x = lerp(0.25, -0.08, enter);

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.65;
      ringRef.current.scale.setScalar(lerp(0.6, 1, vis));
    }
  });

  const mat = useMemo(
    () => ({
      color: "#1a1a1a",
      metalness: 0.75,
      roughness: 0.32,
    }),
    [],
  );

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.55, 0.2, 1.1]} position={[0, -0.55, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial {...mat} />
      </RoundedBox>
      <RoundedBox args={[1.1, 0.18, 0.78]} position={[0, -0.28, 0.02]} radius={0.025} smoothness={4}>
        <meshStandardMaterial {...mat} color="#2a2a2a" />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.16, 0.52]} position={[0, -0.02, 0.04]} radius={0.02} smoothness={4}>
        <meshStandardMaterial {...mat} color="#3a3a3a" metalness={0.85} />
      </RoundedBox>
      <group ref={ringRef} position={[0, 0.42, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.022, 20, 80]} />
          <meshStandardMaterial color="#e8e8e8" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0.4, 0]}>
          <torusGeometry args={[0.48, 0.012, 16, 64]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function MosaicTile({
  still,
  index,
  progressRef,
}: {
  still: (typeof WORK_STILLS)[number];
  index: number;
  progressRef: React.RefObject<number>;
}) {
  const ref = useRef<Group>(null!);
  const color = useMemo(() => new THREE.Color().setHSL(still.hue, 0.35, 0.28), [still.hue]);

  useFrame(() => {
    const p = progressRef.current;
    const vis = mosaicVisibility(p);
    if (!ref.current) return;
    ref.current.visible = vis > 0.02;

    const stagger = smoothstep(0.5 + index * 0.012, 0.56 + index * 0.012, p);
    const s = vis * stagger;
    ref.current.scale.setScalar(lerp(0.3, 1, s));

    const spread = smoothstep(0.48, 0.58, p);
    ref.current.position.set(
      still.px * spread,
      still.py * spread + lerp(-0.8, 0, s),
      still.pz * spread,
    );
    ref.current.rotation.set(
      still.rot * 0.02 * spread,
      still.rot * 0.03,
      still.rot * 0.025 * spread,
    );
  });

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[0.85, 1.05]} />
        <meshStandardMaterial color={color} metalness={0.15} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.88, 1.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function MosaicCluster({ progressRef }: { progressRef: React.RefObject<number> }) {
  const rigRef = useRef<Group>(null!);

  useFrame(({ clock }) => {
    const vis = mosaicVisibility(progressRef.current);
    if (!rigRef.current) return;
    rigRef.current.visible = vis > 0.02;
    rigRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={rigRef} position={[0, 0, 0]}>
      {WORK_STILLS.map((still, i) => (
        <MosaicTile key={still.brand} still={still} index={i} progressRef={progressRef} />
      ))}
    </group>
  );
}

function ObjectScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = progressRef.current;
    const vis = objectVisibility(p);
    const mos = mosaicVisibility(p);
    const phase = objectPhase(p);

    if (mos > 0.1) {
      targetPos.set(0, 0.2, 4.2);
      targetLook.set(0, 0, 0);
    } else if (vis > 0.05) {
      targetPos.set(phase === 1 ? -0.3 : 0.4, lerp(0.1, 0.35, vis), lerp(3.8, 3.2, vis));
      targetLook.set(phase === 0 ? 0.8 : phase === 1 ? -0.6 : 0, -0.1, 0);
    } else {
      targetPos.set(0, 0.3, 5);
      targetLook.set(0, 0, 0);
    }
    camera.position.lerp(targetPos, 0.07);
    camera.lookAt(targetLook);
  });

  return (
    <>
      <ambientLight intensity={0.55} color="#ffffff" />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#fff8f0" />
      <directionalLight position={[-3, 2, 4]} intensity={0.35} color="#a0a8b8" />
      <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" distance={14} />
      <PodiumMonolith progressRef={progressRef} />
      <MosaicCluster progressRef={progressRef} />
    </>
  );
}

function FilmViewport({
  children,
  timecode,
  fullBleed = false,
}: {
  children: ReactNode;
  timecode: string;
  fullBleed?: boolean;
}) {
  if (fullBleed) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        {children}
        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] tabular-nums text-white/50">
          {timecode}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[min(100%,720px)]">
      <div
        className="rounded-sm p-2 sm:p-2.5"
        style={{
          background: "#141414",
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
        }}
      >
        <div className="relative aspect-video overflow-hidden bg-black">
          {children}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-3 py-2 font-mono text-[8px] uppercase tracking-widest text-white/40">
            <span>Podium</span>
            <span className="tabular-nums">{timecode}</span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function ChapterSlide({
  rise,
  zIndex,
  children,
  dark = true,
}: {
  rise: number;
  zIndex: number;
  children: ReactNode;
  dark?: boolean;
}) {
  if (rise < 0.001) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex,
        transform: `translateY(${lerp(105, 0, rise)}%)`,
        background: dark ? BLACK : WHITE,
        color: dark ? WHITE : BLACK,
      }}
    >
      {children}
    </div>
  );
}

function LoadOverlay({ progress, end = false }: { progress: number; end?: boolean }) {
  const load = loadPercent(progress, end);
  const opacity = end
    ? smoothstep(0.86, 0.9, progress) * (1 - smoothstep(0.96, 1, progress))
    : 1 - smoothstep(0.055, 0.09, progress);
  if (opacity < 0.02) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[400] flex flex-col items-center justify-center"
      style={{ background: WHITE, opacity }}
    >
      <p className="font-mono text-6xl font-light tabular-nums sm:text-8xl">{load}</p>
      <span className="mt-1 font-mono text-sm text-black/40">%</span>
      {end ? (
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.35em] text-black/50">
          It&apos;s step one.
        </p>
      ) : null}
    </div>
  );
}

export default function PodiumVideoScrub() {
  const progressRef = useRef(0);
  const scrubRef = useRef(0);
  const maskRef = useRef(1);
  const tintRef = useRef(new THREE.Color(1, 1, 1));

  const [progress, setProgress] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    scrubRef.current = videoScrub(p);
    maskRef.current = p < 0.22 ? 1 : 0;
    const dark = bgPhase(p);
    tintRef.current.setRGB(lerp(1, 0.92, dark), lerp(1, 0.9, dark), lerp(1, 0.88, dark));
    setProgress(p);
    setChapterIdx(activeChapterIndex(p));
  }, []);

  const scrub = videoScrub(progress);
  const timecode = `${Math.floor(scrub * 124)}:${String(Math.floor((scrub * 124 * 60) % 60)).padStart(2, "0")}`;
  const heroFade = 1 - smoothstep(0.08, 0.16, progress);
  const darkAmt = bgPhase(progress);
  const objVis = objectVisibility(progress);
  const mosVis = mosaicVisibility(progress);

  const riseTagline = panelRise(progress, 0.1, 0.2);
  const riseWorld = panelRise(progress, 0.18, 0.3);
  const riseBts = panelRise(progress, 0.28, 0.4);
  const riseServices = panelRise(progress, 0.38, 0.5);
  const riseWork = panelRise(progress, 0.48, 0.62);
  const riseClients = panelRise(progress, 0.6, 0.72);
  const riseAthletes = panelRise(progress, 0.7, 0.82);
  const riseCta = panelRise(progress, 0.8, 0.92);

  const serviceIndex = Math.min(4, Math.floor(smoothstep(0.4, 0.5, progress) * 5));
  const clientOffset = progress * 120;

  const bgColor = `rgb(${Math.round(lerp(250, 10, darkAmt))}, ${Math.round(lerp(250, 10, darkAmt))}, ${Math.round(lerp(248, 10, darkAmt))})`;
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#0a0a0a]"
      hint={locale === "ko" ? "↓ 스크롤 — 영상 스크럽" : "↓ Scroll — video scrub"}
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: bgColor }}>
        <LoadOverlay progress={progress} />
        <LoadOverlay progress={progress} end />

        {/* Persistent film layer */}
        <div
          className="absolute inset-0 z-[5]"
          style={{
            opacity: lerp(1, 0.25, smoothstep(0.48, 0.58, progress)) * (1 - objVis * 0.45) * (1 - mosVis * 0.65),
          }}
        >
          <Canvas className="absolute inset-0" dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
            <SportsFilmPlane scrubRef={scrubRef} maskRef={maskRef} tintRef={tintRef} />
          </Canvas>
        </div>

        {/* 3D podium monolith + WebGL mosaic (appears / hides / reappears on scroll) */}
        <div
          className="pointer-events-none absolute inset-0 z-[25]"
          style={{ opacity: Math.max(objVis, mosVis) }}
        >
          <Canvas
            className="absolute inset-0"
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0.3, 4.5], fov: 42 }}
            onCreated={({ gl }) => gl.setClearColor(0, 0)}
          >
            <ObjectScene progressRef={progressRef} />
          </Canvas>
        </div>

        {/* Hero white + tagline */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 py-16 sm:px-12"
          style={{ opacity: heroFade, background: `rgba(250,250,248,${heroFade * 0.85})` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase">Podium</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/40">Montréal</span>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-light leading-[1.12] tracking-tight sm:text-5xl md:text-6xl">
              We offer creative direction
              <br />
              <span className="text-black/50">& production for athleticism.</span>
            </h1>
            <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.4em] text-black/35">Scroll Down</p>
          </div>
          <p className="text-center font-mono text-[9px] uppercase tracking-[0.3em] text-black/35">Available Worldwide</p>
        </div>

        {/* Film viewport — scrub focus */}
        <div
          className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center px-4"
          style={{
            opacity: smoothstep(0.12, 0.22, progress) * (1 - smoothstep(0.44, 0.52, progress)),
          }}
        >
          <FilmViewport timecode={timecode}>
            <Canvas className="absolute inset-0" dpr={[1, 1.5]} gl={{ antialias: true }}>
              <SportsFilmPlane scrubRef={scrubRef} maskRef={maskRef} tintRef={tintRef} />
            </Canvas>
          </FilmViewport>
        </div>

        <ChapterSlide rise={riseTagline} zIndex={30} dark={false}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="max-w-xl text-lg leading-relaxed text-black/60 sm:text-xl">
              We help sports brands tell stories through fieldwork, narrative, and creative research, with deep
              production expertise.
            </p>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseWorld} zIndex={35} dark={false}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/40">Available Worldwide</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-light leading-tight sm:text-5xl">
              Fieldwork. Narrative.
              <br />
              Creative research.
            </h2>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseBts} zIndex={40}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">Behind the scenes</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-light leading-tight sm:text-5xl">
              We&apos;ve worked with sports brands and athletes worldwide.
            </h2>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseServices} zIndex={45}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">Services</p>
            <ul className="mt-8 space-y-3">
              {SERVICES.map((s, i) => (
                <li
                  key={s}
                  className="text-2xl font-light sm:text-4xl"
                  style={{
                    opacity: i === serviceIndex ? 1 : 0.25,
                    transform: `translateX(${(i - serviceIndex) * 12}px)`,
                    color: i === serviceIndex ? "#fff" : "#666",
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseWork} zIndex={50}>
          <div className="relative h-full w-full overflow-hidden">
            <p className="absolute left-6 top-16 z-10 font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 sm:left-12">
              Work
            </p>
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 1 - mosVis * 0.85 }}>
              {WORK_STILLS.map((still, i) => {
                const reveal = smoothstep(0.5 + i * 0.015, 0.56 + i * 0.015, progress);
                return (
                  <div
                    key={still.brand}
                    className="absolute w-[38%] max-w-[280px] overflow-hidden rounded-sm shadow-2xl sm:w-[32%]"
                    style={{
                      opacity: reveal * (1 - mosVis),
                      transform: `translate(${still.x}%, ${still.y}%) rotate(${still.rot}deg) scale(${0.85 + reveal * 0.15})`,
                      zIndex: i,
                    }}
                  >
                    <div
                      className="aspect-[4/5] w-full"
                      style={{
                        background: `linear-gradient(145deg, hsl(${still.hue * 360}, 35%, 28%), hsl(${still.hue * 360 + 40}, 25%, 12%))`,
                      }}
                    />
                    <p className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-widest text-white/70">
                      {still.brand}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseClients} zIndex={55}>
          <div className="flex h-full flex-col justify-center overflow-hidden px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">Clients</p>
            <div
              className="mt-8 flex gap-8 whitespace-nowrap font-mono text-2xl font-light uppercase tracking-wider sm:text-4xl"
              style={{ transform: `translateX(-${clientOffset}px)` }}
            >
              {[...CLIENTS, ...CLIENTS].map((c, i) => (
                <span key={`${c}-${i}`} className="text-white/80">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseAthletes} zIndex={60}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">Athletes we&apos;ve worked with</p>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/55 sm:text-base">{ATHLETES}</p>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseCta} zIndex={65}>
          <div className="flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">Not the finish line.</p>
            <h2 className="mt-6 text-4xl font-light sm:text-6xl">Let&apos;s build your vision</h2>
            <span className="mt-10 border-b border-white/40 pb-1 font-mono text-[10px] uppercase tracking-[0.35em]">
              Work with us
            </span>
          </div>
        </ChapterSlide>

        {/* Scrub HUD */}
        <div className="pointer-events-none absolute bottom-6 left-6 z-[100] font-mono text-[9px] uppercase tracking-widest text-white/50 mix-blend-difference">
          <span className="tabular-nums">{Math.round(scrub * 100)}%</span>
          <span className="mx-2">·</span>
          <span className="tabular-nums">{timecode}</span>
        </div>

        <div className="pointer-events-none absolute right-5 top-1/2 z-[100] flex -translate-y-1/2 flex-col gap-1">
          {CHAPTERS.map((ch, i) => (
            <span
              key={ch.id}
              className="h-0.5 rounded-full transition-all"
              style={{
                width: i === chapterIdx ? 14 : 5,
                background: i === chapterIdx ? "#fff" : "rgba(255,255,255,0.2)",
                mixBlendMode: darkAmt > 0.5 ? "normal" : "difference",
              }}
            />
          ))}
        </div>

        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-center justify-between px-6 py-5 sm:px-10"
          style={{
            opacity: smoothstep(0.08, 0.16, progress),
            color: darkAmt > 0.5 ? "#fff" : "#0a0a0a",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Podium</span>
          <nav className="hidden gap-8 font-mono text-[9px] uppercase tracking-[0.2em] sm:flex">
            <span>Work</span>
            <span>About</span>
            <span>Contact</span>
          </nav>
        </header>
      </div>
    </LabStickyScroll>
  );
}
