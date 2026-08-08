"use client";

import { useCallback, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const KFC_RED = "#E4002B";
const CREAM = "#FFF8F0";

const SECTIONS = [
  {
    id: "hero",
    start: 0,
    end: 0.22,
    kicker: "Benvenuto",
    title: "KFC REWARDS",
    body: "The new loyalty program — earn points, unlock boxes, play & win.",
  },
  {
    id: "points",
    start: 0.22,
    end: 0.44,
    kicker: "Earn points",
    title: "50 PTS",
    body: "Every €5 spent on the app or website. Stack up to redeem rewards.",
  },
  {
    id: "boxes",
    start: 0.44,
    end: 0.64,
    kicker: "KFC Box",
    title: "MYSTERY & MORE",
    body: "Transparent boxes or AI-powered Mystery Boxes tailored to your taste.",
  },
  {
    id: "game",
    start: 0.64,
    end: 0.84,
    kicker: "Web game",
    title: "DRIVE THE BUCKET",
    body: "Endless runner — collect bonuses, unlock digital collectibles.",
  },
  {
    id: "cta",
    start: 0.84,
    end: 1,
    kicker: "Join now",
    title: "START EARNING",
    body: "Download the app or sign up on kfc.it — your first box awaits.",
  },
] as const;

const BOXES = [
  { name: "Mystery Box", tag: "AI surprise", mystery: true },
  { name: "Classic Box", tag: "Pick your reward", mystery: false },
  { name: "NFT Collectible", tag: "Digital giveaway", mystery: false },
] as const;

function sectionOpacity(progress: number, start: number, end: number, fade = 0.14) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function sectionLocal(progress: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

function KfcBucket({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const { x, y } = pointerRef.current;
    const t = state.clock.elapsedTime;

    const gamePhase = sectionLocal(p, 0.64, 0.84);
    const pathX = gamePhase > 0 ? Math.sin(p * Math.PI * 8) * 1.2 : 0;
    const bounceY =
      gamePhase > 0
        ? Math.abs(Math.sin(p * Math.PI * 12)) * 0.35
        : Math.sin(t * 1.2) * 0.06;

    groupRef.current.position.x = pathX + x * 0.25;
    groupRef.current.position.y = bounceY + y * 0.12;
    groupRef.current.rotation.y = x * 0.35 + p * 0.4;
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.04 + gamePhase * 0.12;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
        <group>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.82, 0.68, 1.35, 32]} />
            <meshStandardMaterial color={KFC_RED} roughness={0.45} metalness={0.08} />
          </mesh>
          {[-0.35, -0.05, 0.25].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <cylinderGeometry args={[0.84, 0.7, 0.1, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.86, 0.86, 0.12, 32]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.35} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <torusGeometry args={[0.5, 0.06, 12, 32]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function BucketScene({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 0.2, 4.2], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-3, 2, 3]} intensity={0.35} color="#ffe0e0" />
      <KfcBucket progressRef={progressRef} pointerRef={pointerRef} />
    </Canvas>
  );
}

export default function KfcLoyaltyRewards() {
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const boxesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const [progress, setProgress] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [points, setPoints] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));

    let best = 0;
    let bestO = 0;
    SECTIONS.forEach((s, i) => {
      const o = sectionOpacity(p, s.start, s.end);
      if (o > bestO) {
        bestO = o;
        best = i;
      }
    });
    setSectionIndex(best);

    const ptsLocal = sectionLocal(p, 0.22, 0.44);
    setPoints(Math.round(ptsLocal * 250));

    const boxes = boxesRef.current?.querySelectorAll("[data-kfc-box]");
    boxes?.forEach((box, i) => {
      const boxStart = 0.44 + (i / BOXES.length) * 0.12;
      const t = gsap.utils.clamp(0, 1, (p - boxStart) / 0.08);
      gsap.set(box, {
        opacity: t,
        y: (1 - t) * 40,
        scale: 0.88 + t * 0.12,
      });
    });

    if (ctaRef.current && p > 0.84) {
      const ctaT = sectionLocal(p, 0.84, 1);
      gsap.set(ctaRef.current, {
        scale: 0.9 + ctaT * 0.1,
      });
    }
  }, []);

  const section = SECTIONS[sectionIndex];
  const p = progress / 100;
  const bgShift =
    p < 0.44 ? CREAM : p < 0.64 ? "#fff0f0" : p < 0.84 ? "#ffe8e8" : KFC_RED;
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={480}
      stickyClassName="text-[#1a1a1a] transition-colors duration-300"
      hint={locale === "ko" ? "↓ 스크롤 — 포인트·박스·버킷 게임 여정" : "↓ Scroll — points · box · bucket game journey"}
      showProgress={false}
    >
      <div
        className="relative h-full w-full overflow-hidden transition-colors duration-500"
        style={{ background: bgShift }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }}
      >
        <div className="absolute inset-y-0 right-0 w-full max-w-[55%] opacity-90 sm:max-w-[50%]">
          <BucketScene progressRef={progressRef} pointerRef={pointerRef} />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center px-6 py-10 sm:max-w-[52%] sm:px-12">
          {SECTIONS.map((s) => {
            const opacity = sectionOpacity(p, s.start, s.end);
            if (opacity <= 0.01) return null;
            const y = -sectionLocal(p, s.start, s.end) * 48;
            return (
              <div
                key={s.id}
                className="absolute inset-x-6 top-1/2 max-w-lg -translate-y-1/2 sm:inset-x-12"
                style={{ opacity, transform: `translateY(calc(-50% + ${y}px))` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#E4002B]">
                  {s.kicker}
                </p>
                <h2
                  className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl"
                  style={{ color: s.id === "cta" ? "#fff" : KFC_RED }}
                >
                  {s.title}
                </h2>
                <p
                  className={`mt-4 max-w-sm text-sm leading-relaxed ${
                    s.id === "cta" ? "text-white/85" : "text-[#1a1a1a]/60"
                  }`}
                >
                  {s.body}
                </p>

                {s.id === "points" ? (
                  <div className="mt-8 flex items-end gap-3">
                    <span
                      className="text-6xl font-black tabular-nums sm:text-8xl"
                      style={{ color: KFC_RED }}
                    >
                      {points}
                    </span>
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/45">
                      / 250 pts
                    </span>
                  </div>
                ) : null}

                {s.id === "boxes" ? (
                  <div ref={boxesRef} className="mt-8 space-y-3">
                    {BOXES.map((box) => (
                      <div
                        key={box.name}
                        data-kfc-box
                        className="flex items-center gap-4 rounded-2xl border border-[#E4002B]/15 bg-white/80 px-4 py-3 shadow-sm backdrop-blur will-change-transform"
                        style={{ opacity: 0 }}
                      >
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                          style={{ background: box.mystery ? "#1a1a1a" : KFC_RED }}
                        >
                          {box.mystery ? "?" : "★"}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{box.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/45">
                            {box.tag}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {s.id === "cta" ? (
                  <button
                    ref={ctaRef}
                    type="button"
                    className="mt-8 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-[#E4002B] shadow-lg will-change-transform"
                  >
                    Join KFC Rewards →
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute left-6 top-6 z-20 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black text-white"
            style={{ background: KFC_RED }}
          >
            KFC
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/50">
            Rewards
          </span>
        </div>

        <div className="pointer-events-none absolute right-6 top-6 z-20 flex gap-1.5">
          {SECTIONS.map((s, i) => (
            <span
              key={s.id}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{
                background: i === sectionIndex ? KFC_RED : "rgba(26,26,26,0.15)",
              }}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <p className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/35">
            {section.kicker}
          </p>
          <p className="text-2xl font-bold tabular-nums">{progress}%</p>
        </div>
      </div>
    </LabStickyScroll>
  );
}
