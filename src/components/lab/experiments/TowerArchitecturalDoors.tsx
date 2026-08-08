"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const BG = "#f7f6f3";
const BG_DARK = "#ebe8e2";
const ALUMINUM = "#c5cad0";
const ALUMINUM_DARK = "#9aa3ad";
const SEAL = "#2a2a2a";
const ACCENT = "#8a7355";
const TEXT = "#1a1a1a";
const MUTED = "#6b6560";

const SCROLL_VH = 3000;

/** Reference milestone percentages on towerdoors.com.au */
const MILESTONES = [0, 15, 27, 35, 55, 70, 87, 95, 100] as const;

const CHAPTERS = [
  {
    id: "hero",
    start: 0.08,
    end: 0.18,
    kicker: "welcome",
    title: "The Next Evolution in Architectural Garage Door Systems",
    sub: "Australian Made. Built to Last. Designed to Inspire.",
    cta: "contact us",
  },
  {
    id: "ta8",
    start: 0.16,
    end: 0.28,
    kicker: "The TA8™ System",
    title: "From aerospace to architecture",
    sub: "Aerospace-grade aluminum crafted into the world's most advanced garage door frame.",
    bullets: [
      "Advanced Frame Engineering",
      "Concealed Sealing Technology",
      "Uncompromising Structural Integrity",
    ],
  },
  {
    id: "frame",
    start: 0.26,
    end: 0.38,
    kicker: "Advanced Frame Engineering",
    title: "A breakthrough frame design",
    sub: "Redefines the possibilities of flush mount architecture.",
    highlight: "frame" as const,
  },
  {
    id: "seal",
    start: 0.36,
    end: 0.48,
    kicker: "Concealed Sealing Technology",
    title: "Integrated sealing system",
    sub: "Superior weatherproofing and flawless finishes.",
    highlight: "seal" as const,
  },
  {
    id: "structure",
    start: 0.46,
    end: 0.58,
    kicker: "Structural Integrity",
    title: "Engineered to Perfection",
    sub: "Strength, durability, and flawless performance under the heaviest cladding.",
    bullets: ["Advanced Fabrication", "Uncompromising Quality"],
  },
  {
    id: "design",
    start: 0.56,
    end: 0.68,
    kicker: "Limitless Design Possibilities",
    title: "Architectural Freedom",
    sub: "Adapts to any material, style, or façade design.",
    bullets: ["Engineered Strength", "Custom cladding choices"],
  },
  {
    id: "hinge",
    start: 0.66,
    end: 0.78,
    kicker: "The Hidden Power Within",
    title: "High-Tensile Hinge",
    sub: "Engineered to endure extreme payloads with effortless precision.",
    highlight: "hinge" as const,
  },
  {
    id: "finish",
    start: 0.76,
    end: 0.88,
    kicker: "The Signature Finish",
    title: "Endless Design Possibilities",
    sub: "Custom finishes and materials to complement any architectural style.",
    highlight: "cladding" as const,
  },
  {
    id: "cta",
    start: 0.86,
    end: 1,
    kicker: "A Revolution",
    title: "More Than a Garage Door",
    sub: "The TA8 System sets a new standard — from frame to finish.",
    cta: "Begin Your Design Journey",
  },
] as const;

type HighlightPart = "frame" | "seal" | "hinge" | "cladding" | "none";

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

function chapterOpacity(p: number, start: number, end: number, fade = 0.1) {
  const range = end - start;
  const fadeW = range * fade;
  if (p < start || p > end) return 0;
  if (p < start + fadeW) return (p - start) / fadeW;
  if (p > end - fadeW) return (end - p) / fadeW;
  return 1;
}

/** Scroll-scrubbed explode amount — peaks mid-scroll, reassembles at end */
function explodeAmount(p: number) {
  const rise = easeInOutCubic(smoothstep(0.14, 0.52, p));
  const fall = 1 - easeInOutCubic(smoothstep(0.78, 0.94, p));
  return rise * fall * 1.15;
}

function loadPercent(p: number) {
  return Math.round(smoothstep(0, 0.07, p) * 100);
}

function scrollPercent(p: number) {
  return Math.round(p * 100);
}

function activeHighlight(p: number): HighlightPart {
  for (const ch of CHAPTERS) {
    if ("highlight" in ch && chapterOpacity(p, ch.start, ch.end) > 0.6) {
      return ch.highlight;
    }
  }
  return "none";
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

const alumMat = {
  color: ALUMINUM,
  metalness: 0.92,
  roughness: 0.22,
};

function PartMesh({
  meshRef,
  args,
  position,
  rotation,
  emissive = "#000000",
  emissiveIntensity = 0,
  color = ALUMINUM,
}: {
  meshRef?: React.RefObject<Mesh>;
  args: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  emissive?: string;
  emissiveIntensity?: number;
  color?: string;
}) {
  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.24}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

function DoorAssembly({ progressRef }: { progressRef: React.RefObject<number> }) {
  const rootRef = useRef<Group>(null!);
  const leftRef = useRef<Group>(null!);
  const rightRef = useRef<Group>(null!);
  const topRef = useRef<Group>(null!);
  const bottomRef = useRef<Group>(null!);
  const panelRef = useRef<Group>(null!);
  const sealRef = useRef<Group>(null!);
  const hingeRef = useRef<Group>(null!);
  const claddingRef = useRef<Group>(null!);

  const targetRot = useMemo(() => new THREE.Euler(), []);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const e = explodeAmount(p);
    const hl = activeHighlight(p);
    const t = clock.elapsedTime;

    const pulse = (part: HighlightPart) => (hl === part ? 0.35 + Math.sin(t * 3) * 0.12 : 0);

    if (leftRef.current) {
      leftRef.current.position.x = lerp(0, -0.95, e);
      const mesh = leftRef.current.children[0] as Mesh | undefined;
      if (mesh?.material && "emissiveIntensity" in (mesh.material as THREE.MeshStandardMaterial)) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse("frame");
      }
    }
    if (rightRef.current) {
      rightRef.current.position.x = lerp(0, 0.95, e);
      const mesh = rightRef.current.children[0] as Mesh | undefined;
      if (mesh?.material && "emissiveIntensity" in (mesh.material as THREE.MeshStandardMaterial)) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse("frame");
      }
    }
    if (topRef.current) topRef.current.position.y = lerp(0, 0.55, e);
    if (bottomRef.current) bottomRef.current.position.y = lerp(0, -0.55, e);

    if (panelRef.current) {
      panelRef.current.position.z = lerp(0, 0.35, e * 0.6);
    }
    if (sealRef.current) {
      sealRef.current.position.z = lerp(0.02, 0.55, e);
      const mesh = sealRef.current.children[0] as Mesh | undefined;
      if (mesh?.material && "emissiveIntensity" in (mesh.material as THREE.MeshStandardMaterial)) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse("seal");
      }
    }
    if (hingeRef.current) {
      hingeRef.current.position.set(lerp(-0.72, -1.15, e), lerp(-0.5, -0.85, e), lerp(0.08, 0.45, e));
      hingeRef.current.rotation.z = lerp(0, 0.35, e);
      const mesh = hingeRef.current.children[0] as Mesh | undefined;
      if (mesh?.material && "emissiveIntensity" in (mesh.material as THREE.MeshStandardMaterial)) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse("hinge");
      }
    }
    if (claddingRef.current) {
      claddingRef.current.position.z = lerp(0.06, 0.85, e);
      const mesh = claddingRef.current.children[0] as Mesh | undefined;
      if (mesh?.material && "emissiveIntensity" in (mesh.material as THREE.MeshStandardMaterial)) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse("cladding");
      }
    }

    if (rootRef.current) {
      targetRot.y = lerp(-0.22, 0.18, smoothstep(0.1, 0.7, p)) + Math.sin(t * 0.25) * 0.02;
      targetRot.x = lerp(0.08, -0.04, smoothstep(0.2, 0.6, p));
      rootRef.current.rotation.y = lerp(rootRef.current.rotation.y, targetRot.y, 0.06);
      rootRef.current.rotation.x = lerp(rootRef.current.rotation.x, targetRot.x, 0.06);
      rootRef.current.position.y = lerp(-0.15, 0.05, smoothstep(0.08, 0.25, p));
    }
  });

  return (
    <group ref={rootRef} position={[0.15, 0, 0]} scale={1.05}>
      <group ref={bottomRef}>
        <PartMesh args={[2.1, 0.12, 0.18]} position={[0, -1.05, 0]} color={ALUMINUM_DARK} />
      </group>
      <group ref={topRef}>
        <PartMesh args={[2.1, 0.12, 0.18]} position={[0, 1.05, 0]} color={ALUMINUM_DARK} />
      </group>
      <group ref={leftRef}>
        <PartMesh args={[0.12, 2.1, 0.18]} position={[-1.05, 0, 0]} emissive={ACCENT} />
      </group>
      <group ref={rightRef}>
        <PartMesh args={[0.12, 2.1, 0.18]} position={[1.05, 0, 0]} emissive={ACCENT} />
      </group>
      <group ref={panelRef}>
        <RoundedBox args={[1.75, 1.85, 0.08]} radius={0.02} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial {...alumMat} />
        </RoundedBox>
      </group>
      <group ref={sealRef}>
        <PartMesh args={[1.82, 1.92, 0.04]} position={[0, 0, 0.04]} color={SEAL} emissive="#444444" />
      </group>
      <group ref={hingeRef}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.55, 24]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.85} roughness={0.3} emissive={ACCENT} emissiveIntensity={0} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.14, 0.18, 0.14]} />
          <meshStandardMaterial color={ALUMINUM_DARK} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <group ref={claddingRef}>
        <RoundedBox args={[1.78, 1.88, 0.06]} radius={0.015} smoothness={3} position={[0, 0, 0.1]}>
          <meshStandardMaterial color="#a89a8a" metalness={0.4} roughness={0.55} emissive={ACCENT} emissiveIntensity={0} />
        </RoundedBox>
      </group>
    </group>
  );
}

function StudioScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = progressRef.current;
    const e = explodeAmount(p);
    targetPos.set(lerp(0, 0.4, e), lerp(0.3, 0.55, smoothstep(0.1, 0.5, p)), lerp(4.8, 3.6, e));
    targetLook.set(0.1, lerp(0, 0.15, p), 0);
    camera.position.lerp(targetPos, 0.06);
    camera.lookAt(targetLook);
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 8, 22]} />
      <ambientLight intensity={0.65} color="#ffffff" />
      <directionalLight position={[5, 8, 6]} intensity={1.1} color="#fffaf5" castShadow />
      <directionalLight position={[-4, 3, 2]} intensity={0.35} color="#d0d8e0" />
      <pointLight position={[2, 2, 4]} intensity={0.5} color="#ffffff" distance={12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={BG_DARK} roughness={0.95} />
      </mesh>
      <DoorAssembly progressRef={progressRef} />
    </>
  );
}

function MilestoneRail({ progress }: { progress: number }) {
  const pct = scrollPercent(progress);
  return (
    <div className="pointer-events-none absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col items-end gap-3 sm:right-8">
      {MILESTONES.map((m) => {
        const active = pct >= m - 2;
        const current = Math.abs(pct - m) < 6;
        return (
          <div key={m} className="flex items-center gap-2">
            <span
              className="font-mono text-[9px] tabular-nums transition-opacity"
              style={{ color: current ? ACCENT : MUTED, opacity: active ? 1 : 0.35 }}
            >
              {m}
            </span>
            <span
              className="block h-px transition-all"
              style={{
                width: current ? 20 : 10,
                background: current ? ACCENT : "rgba(0,0,0,0.12)",
              }}
            />
          </div>
        );
      })}
      <span className="mt-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
        %
      </span>
    </div>
  );
}

function LoadOverlay({ progress }: { progress: number }) {
  const load = loadPercent(progress);
  const opacity = 1 - smoothstep(0.05, 0.09, progress);
  if (opacity < 0.02) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: BG, opacity }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: MUTED }}>
        welcome
      </p>
      <p className="mt-4 font-mono text-7xl font-light tabular-nums sm:text-9xl" style={{ color: TEXT }}>
        {load}
      </p>
      <span className="mt-2 font-mono text-sm" style={{ color: MUTED }}>
        %
      </span>
    </div>
  );
}

function ChapterCopy({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none relative z-20 flex min-h-0 flex-1 flex-col justify-end px-6 pb-10 sm:px-10 sm:pb-14 lg:max-w-[44%] lg:justify-center lg:pb-0">
      {CHAPTERS.map((ch) => {
        const opacity = chapterOpacity(progress, ch.start, ch.end);
        if (opacity < 0.02) return null;
        return (
          <article
            key={ch.id}
            className="absolute inset-x-6 bottom-10 sm:inset-x-10 sm:bottom-14 lg:inset-x-10 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
            style={{
              opacity,
              transform: `translateY(${(1 - opacity) * 16}px)`,
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: ACCENT }}>
              {ch.kicker}
            </p>
            <h2 className="mt-3 text-2xl font-light leading-tight tracking-tight sm:text-4xl" style={{ color: TEXT }}>
              {ch.title}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
              {ch.sub}
            </p>
            {"bullets" in ch && ch.bullets ? (
              <ul className="mt-5 space-y-2">
                {ch.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-xs" style={{ color: MUTED }}>
                    <span style={{ color: ACCENT }}>—</span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
            {"cta" in ch && ch.cta ? (
              <span
                className="mt-8 inline-block border-b pb-1 font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ borderColor: `${ACCENT}88`, color: TEXT }}
              >
                {ch.cta}
              </span>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function DiscoverHint({ progress }: { progress: number }) {
  const opacity = chapterOpacity(progress, 0.08, 0.2) * (1 - smoothstep(0.75, 0.88, progress));
  if (opacity < 0.05) return null;
  return (
    <div
      className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center"
      style={{ opacity }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: MUTED }}>
        d i s c o v e r
      </p>
      <p className="mt-2 text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
        scroll down
      </p>
    </div>
  );
}

export default function TowerArchitecturalDoors() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(p);
    setChapterIdx(activeChapterIndex(p));
  }, []);

  const headerOpaque = smoothstep(0.06, 0.14, progress);

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#1a1a1a]"
      hint={locale === "ko" ? "↓ 스크롤 — TA8™ 분해도" : "↓ Scroll — TA8™ exploded view"}
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: BG }}>
        <LoadOverlay progress={progress} />

        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 sm:px-10"
          style={{
            opacity: headerOpaque,
            background: `rgba(247,246,243,${lerp(0, 0.94, headerOpaque)})`,
            borderBottom: `1px solid rgba(0,0,0,${lerp(0, 0.06, headerOpaque)})`,
          }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] uppercase">Tower</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            TA8™ System
          </span>
          <span
            className="hidden rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-widest sm:inline-block"
            style={{ borderColor: "rgba(0,0,0,0.15)", color: TEXT }}
          >
            contact us
          </span>
        </header>

        <div className="absolute inset-0 lg:left-[38%]">
          <Canvas
            className="absolute inset-0"
            camera={{ position: [0, 0.3, 4.8], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false }}
            shadows
          >
            <StudioScene progressRef={progressRef} />
          </Canvas>
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col lg:w-[42%]">
          <ChapterCopy progress={progress} />
        </div>

        <MilestoneRail progress={progress} />
        <DiscoverHint progress={progress} />

        <div className="pointer-events-none absolute bottom-6 left-6 z-30 hidden font-mono text-[9px] uppercase tracking-widest sm:block" style={{ color: MUTED }}>
          {CHAPTERS[chapterIdx]?.kicker ?? "welcome"}
        </div>

        <div className="pointer-events-none absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 sm:flex">
          {CHAPTERS.map((ch, i) => (
            <span
              key={ch.id}
              className="h-0.5 rounded-full transition-all"
              style={{
                width: i === chapterIdx ? 14 : 6,
                background: i === chapterIdx ? ACCENT : "rgba(0,0,0,0.12)",
              }}
            />
          ))}
        </div>
      </div>
    </LabStickyScroll>
  );
}
