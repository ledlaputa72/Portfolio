"use client";

import { useCallback, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const HERO_CHAPTERS = [
  {
    id: "intro",
    start: 0,
    end: 0.2,
    kicker: "Tony Mak — Portfolio",
    headline: ["Creative at", "the Speed of Next"],
    body: "Art direction & systems for brands moving at the pace of what's next.",
  },
  {
    id: "systems",
    start: 0.2,
    end: 0.38,
    kicker: "Art Direction & Systems",
    headline: ["DESIGN", "AT SCALE"],
    body: "Typography-led interfaces compress complex ideas into instant clarity.",
  },
  {
    id: "motion",
    start: 0.38,
    end: 0.54,
    kicker: "Motion · UI · Brand",
    headline: ["BUILD", "WHAT'S NEXT"],
    body: "Scroll-scrubbed motion — every frame earned, nothing decorative.",
  },
] as const;

const PROJECTS = [
  { title: "Velocity Brand", tag: "Brand Identity", year: "2025", color: "#8a9bab" },
  { title: "Neural Canvas", tag: "AI Creative", year: "2025", color: "#6d7f96" },
  { title: "System UI Kit", tag: "Product Design", year: "2024", color: "#a39e95" },
  { title: "Motion Lab", tag: "Art Direction", year: "2024", color: "#7a8796" },
  { title: "Type Stack", tag: "Typography", year: "2024", color: "#969088" },
  { title: "Next Sprint", tag: "Campaign", year: "2023", color: "#88919c" },
] as const;

const WORK_START = 0.54;
const WORK_END = 0.92;

function chapterOpacity(progress: number, start: number, end: number, fade = 0.16) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function heroChapterY(progress: number, start: number, end: number) {
  const local = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return -local * 110 - (progress - start) * 40;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function HeroMotion({
  progressRef,
}: {
  progressRef: React.RefObject<number>;
}) {
  const rootRef = useRef<Group>(null!);
  const knotRef = useRef<Mesh>(null!);
  const ringRef = useRef<Mesh>(null!);
  const shardRef = useRef<Group>(null!);

  useFrame(() => {
    const p = progressRef.current;
    const hero = Math.min(1, p / WORK_START);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(p, WORK_START - 0.06, WORK_START + 0.04);

    if (!rootRef.current) return;
    rootRef.current.visible = fadeOut > 0.02;
    rootRef.current.scale.setScalar(fadeOut);

    const phase = hero * Math.PI * 2;
    rootRef.current.rotation.y = phase * 0.85;
    rootRef.current.rotation.x = Math.sin(phase * 0.5) * 0.35;
    rootRef.current.position.x = lerp(1.8, 0.6, hero);
    rootRef.current.position.y = Math.sin(phase) * 0.35;

    if (knotRef.current) {
      knotRef.current.rotation.z = phase * 0.6;
      knotRef.current.scale.setScalar(0.85 + hero * 0.25);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + phase * 0.4;
      ringRef.current.scale.setScalar(1.1 + Math.sin(phase * 2) * 0.08);
    }
    if (shardRef.current) {
      shardRef.current.rotation.y = -phase * 1.2;
      shardRef.current.position.x = Math.cos(phase) * 0.9;
      shardRef.current.position.z = Math.sin(phase) * 0.5;
    }
  });

  return (
    <group ref={rootRef} position={[1.8, 0, -1.5]}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#e8e6e0" />

      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1.05, 0.28, 160, 32]} />
        <meshStandardMaterial color="#b8b6ae" metalness={0.45} roughness={0.32} />
      </mesh>

      <mesh ref={ringRef} position={[0, 0, 0.2]}>
        <torusGeometry args={[1.65, 0.04, 16, 80]} />
        <meshStandardMaterial color="#d4d2ca" metalness={0.6} roughness={0.25} />
      </mesh>

      <group ref={shardRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 1.4,
              Math.sin((i / 4) * Math.PI * 2) * 0.5,
              Math.sin((i / 4) * Math.PI * 2) * 0.8,
            ]}
            rotation={[0.4, i * 0.8, 0.2]}
          >
            <boxGeometry args={[0.35, 0.55, 0.08]} />
            <meshStandardMaterial color="#9a9890" metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ProjectShape({
  index,
  color,
  weightsRef,
}: {
  index: number;
  color: string;
  weightsRef: React.MutableRefObject<number[]>;
}) {
  const groupRef = useRef<Group>(null!);

  useFrame((state) => {
    const weight = weightsRef.current[index] ?? 0;
    if (!groupRef.current) return;
    groupRef.current.visible = weight > 0.02;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15 * weight;
    groupRef.current.scale.setScalar(0.7 + weight * 0.35);
  });

  return (
    <group ref={groupRef}>
      {index === 0 && (
        <mesh>
          <torusKnotGeometry args={[0.9, 0.22, 96, 24]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.28} />
        </mesh>
      )}
      {index === 1 && (
        <group>
          {[[0, 0, 0], [0.7, 0.3, -0.2], [-0.6, -0.2, 0.3], [0.2, -0.5, 0.5]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.18 + (i === 0 ? 0.12 : 0), 20, 20]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
            </mesh>
          ))}
          <Line
            points={[
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.7, 0.3, -0.2),
              new THREE.Vector3(-0.6, -0.2, 0.3),
            ]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.5}
          />
        </group>
      )}
      {index === 2 && (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, i * 0.22 - 0.22, i * 0.08]}>
              <boxGeometry args={[1.6 - i * 0.2, 0.12, 0.9]} />
              <meshStandardMaterial color={color} metalness={0.2} roughness={0.55} />
            </mesh>
          ))}
        </group>
      )}
      {index === 3 && (
        <group>
          {[0.6, 0.9, 1.15].map((r, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.4]}>
              <torusGeometry args={[r, 0.025, 12, 64]} />
              <meshStandardMaterial color={color} metalness={0.55} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
      {index === 4 && (
        <group>
          {["T", "Y", "P", "E"].map((_, i) => (
            <mesh key={i} position={[i * 0.42 - 0.63, 0, 0]}>
              <boxGeometry args={[0.28, 0.9 - (i % 2) * 0.15, 0.1]} />
              <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
            </mesh>
          ))}
        </group>
      )}
      {index === 5 && (
        <mesh rotation={[0.3, 0.5, 0]}>
          <coneGeometry args={[0.75, 1.6, 4]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.4} flatShading />
        </mesh>
      )}
    </group>
  );
}

function ProjectPreview({
  progressRef,
  hoverIndex,
  hoverWeightRef,
}: {
  progressRef: React.RefObject<number>;
  hoverIndex: number;
  hoverWeightRef: React.MutableRefObject<number[]>;
}) {
  const groupRef = useRef<Group>(null!);

  useFrame(() => {
    const p = progressRef.current;
    const workIn = THREE.MathUtils.smoothstep(p, WORK_START, WORK_START + 0.08);
    const workOut = 1 - THREE.MathUtils.smoothstep(p, WORK_END - 0.04, WORK_END);
    const vis = workIn * workOut;

    if (!groupRef.current) return;
    groupRef.current.visible = vis > 0.02;
    groupRef.current.position.x = lerp(2.2, 1.4, workIn);
    groupRef.current.position.y = lerp(0, -0.1, workIn);

    PROJECTS.forEach((_, i) => {
      const target = i === hoverIndex ? 1 : 0;
      hoverWeightRef.current[i] = lerp(hoverWeightRef.current[i] ?? 0, target, 0.08);
    });
  });

  return (
    <group ref={groupRef} position={[1.4, 0, -1]}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1} />
      <pointLight position={[-2, 1, 2]} intensity={0.4} color="#f7f7f2" />
      {PROJECTS.map((project, i) => (
        <group key={project.title} position={[0, 0, i * 0.01]}>
          <ProjectShape index={i} color={project.color} weightsRef={hoverWeightRef} />
        </group>
      ))}
    </group>
  );
}

function TonyMakScene({
  progressRef,
  hoverIndex,
  hoverWeightRef,
}: {
  progressRef: React.RefObject<number>;
  hoverIndex: number;
  hoverWeightRef: React.MutableRefObject<number[]>;
}) {
  return (
    <>
      <color attach="background" args={["#f7f7f2"]} />
      <fog attach="fog" args={["#f7f7f2", 6, 14]} />
      <HeroMotion progressRef={progressRef} />
      <ProjectPreview
        progressRef={progressRef}
        hoverIndex={hoverIndex}
        hoverWeightRef={hoverWeightRef}
      />
    </>
  );
}

function HeroOverlays({ progress }: { progress: number }) {
  return (
    <>
      {HERO_CHAPTERS.map((ch) => {
        const opacity = chapterOpacity(progress, ch.start, ch.end);
        if (opacity <= 0.01) return null;
        const y = heroChapterY(progress, ch.start, ch.end);
        return (
          <div
            key={ch.id}
            className="pointer-events-none absolute inset-x-8 top-[38%] max-w-xl sm:inset-x-12"
            style={{
              opacity,
              transform: `translateY(${y}px)`,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#111111]/45">
              {ch.kicker}
            </p>
            <h2 className="mt-4 text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl">
              {ch.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-6 max-w-sm text-sm text-[#111111]/55">{ch.body}</p>
          </div>
        );
      })}
    </>
  );
}

function WorkList({
  progress,
  hoverIndex,
  onHover,
}: {
  progress: number;
  hoverIndex: number;
  onHover: (index: number) => void;
}) {
  const workOpacity = chapterOpacity(progress, WORK_START, WORK_END, 0.08);
  const listRise = -((progress - WORK_START) / (WORK_END - WORK_START)) * 120;

  if (workOpacity <= 0.01) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col justify-center px-8 sm:px-12"
      style={{
        opacity: workOpacity,
        transform: `translateY(${listRise}px)`,
      }}
    >
      <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-[#111111]/40">
        Selected Work
      </p>
      <ul className="max-w-lg">
        {PROJECTS.map((project, i) => {
          const itemStart = WORK_START + (i / PROJECTS.length) * (WORK_END - WORK_START) * 0.55;
          const itemOpacity = Math.min(
            1,
            chapterOpacity(progress, itemStart, WORK_END, 0.2) * 1.4,
          );
          const active = hoverIndex === i;
          return (
            <li
              key={project.title}
              style={{ opacity: Math.max(0.25, itemOpacity) }}
            >
              <button
                type="button"
                onMouseEnter={() => onHover(i)}
                onFocus={() => onHover(i)}
                className={`group w-full border-t border-[#111111]/12 py-5 text-left transition-all duration-300 ${
                  active ? "opacity-100" : "opacity-45 hover:opacity-80"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span
                    className={`text-xl font-bold tracking-tight transition-transform duration-300 sm:text-2xl ${
                      active ? "translate-x-2" : ""
                    }`}
                  >
                    {project.title}
                  </span>
                  <span className="text-[10px] tabular-nums text-[#111111]/35">
                    {project.year}
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#111111]/40">
                  {project.tag}
                </p>
                <div
                  className={`mt-3 h-px origin-left bg-[#111111] transition-transform duration-500 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactOverlay({ progress }: { progress: number }) {
  const opacity = chapterOpacity(progress, 0.9, 1, 0.2);
  if (opacity <= 0.01) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-8 bottom-[18%] sm:inset-x-12"
      style={{ opacity, transform: `translateY(${(1 - opacity) * 40}px)` }}
    >
      <p className="text-[10px] uppercase tracking-[0.35em] text-[#111111]/40">
        Contact
      </p>
      <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Let&apos;s build
        <br />
        what&apos;s next →
      </h2>
    </div>
  );
}

export default function TonyMakTransition() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const hoverWeightRef = useRef<number[]>(PROJECTS.map((_, i) => (i === 0 ? 1 : 0)));
  const [progress, setProgress] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [phase, setPhase] = useState<"hero" | "work" | "contact">("hero");
  const cursorRef = useRef<HTMLDivElement>(null);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));
    if (p < WORK_START) setPhase("hero");
    else if (p < 0.9) setPhase("work");
    else setPhase("contact");
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cursorRef.current;
    if (!el) return;
    el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }, []);

  const progressNorm = progress / 100;

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={680}
      stickyClassName="bg-[#f7f7f2] text-[#111111]"
      hint={locale === "ko" ? "↓ 스크롤 — 3D 배경 scrub · 타이틀 상승 · 프로젝트 hover" : "↓ Scroll — 3D background scrub · title rise · project hover"}
      showProgress={false}
    >
      <div
        className="relative h-full w-full"
        onMouseMove={handleMouseMove}
      >
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }} dpr={[1, 2]}>
            <TonyMakScene
              progressRef={progressRef}
              hoverIndex={hoverIndex}
              hoverWeightRef={hoverWeightRef}
            />
          </Canvas>
        </div>

        <div
          ref={cursorRef}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#111111]/50 bg-[#111111]/10 mix-blend-difference sm:block"
          aria-hidden
        />

        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-8 py-10 sm:px-12">
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">TM</span>
          <nav className="flex gap-2 sm:gap-3">
            {(["Work", "About", "Contact"] as const).map((label) => {
              const active =
                (label === "Work" && phase === "work") ||
                (label === "About" && phase === "hero") ||
                (label === "Contact" && phase === "contact");
              return (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors sm:px-4 ${
                    active ? "bg-[#111111] text-[#f7f7f2]" : "text-[#111111]/40"
                  }`}
                >
                  {label}
                </span>
              );
            })}
          </nav>
        </header>

        <HeroOverlays progress={progressNorm} />
        <WorkList
          progress={progressNorm}
          hoverIndex={hoverIndex}
          onHover={setHoverIndex}
        />
        <ContactOverlay progress={progressNorm} />

        <div className="pointer-events-none absolute bottom-24 left-8 z-20 sm:left-12">
          <p className="text-[10px] uppercase tracking-widest text-[#111111]/35">
            {phase === "hero" ? "Hero scrub" : phase === "work" ? "Work list" : "Contact"}
          </p>
          <p className="text-2xl font-bold tabular-nums">{progress}%</p>
        </div>

        {phase === "work" ? (
          <p className="pointer-events-none absolute bottom-24 right-8 z-20 text-[10px] uppercase tracking-[0.2em] text-[#111111]/35 sm:right-12">
            Hover project — 3D preview updates
          </p>
        ) : null}
      </div>
    </LabStickyScroll>
  );
}
