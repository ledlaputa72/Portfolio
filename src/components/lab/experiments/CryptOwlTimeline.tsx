"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Mesh } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const BASE = "#07090d";
const ACCENT = "#7ce6ff";
const GLOW = "#2eafff";
const POSITIVE = "#7ed6a3";

const SECTIONS = [
  {
    id: "hero",
    start: 0,
    end: 0.2,
    kicker: "Build now · Rewind history · Watch it live",
    title: "Time",
    sub: "Crypto strategy through time — one workspace for logic, replay, and live control.",
  },
  {
    id: "strategy",
    start: 0.2,
    end: 0.4,
    kicker: "Logic before proof",
    title: "Build the logic.",
    sub: "Set context, conditions, risk, and exits. Then let history answer.",
  },
  {
    id: "replay",
    start: 0.4,
    end: 0.6,
    kicker: "What would your strategy have done?",
    title: "Run it through history.",
    sub: "Replay market history — or watch signals unfold live.",
  },
  {
    id: "control",
    start: 0.6,
    end: 0.8,
    kicker: "Campaign-level control",
    title: "Control above action.",
    sub: "Pause entries, protect setups, and resume every live strategy together.",
  },
  {
    id: "analytics",
    start: 0.8,
    end: 1,
    kicker: "Performance rollup",
    title: "Analytics across every level.",
    sub: "Start with a strategy you can inspect — virtual balance, traceable decisions.",
  },
] as const;

const TIMELINE_NODES = [
  { label: "TIME", x: -9 },
  { label: "STRATEGY", x: -5.4 },
  { label: "REPLAY", x: -1.8 },
  { label: "CONTROL", x: 1.8 },
  { label: "ANALYTICS", x: 5.4 },
  { label: "PROOF", x: 9 },
] as const;

const METRICS = [
  { label: "Net PnL", value: "+$0", at: 0 },
  { label: "Net PnL", value: "+$420", at: 0.35 },
  { label: "Net PnL", value: "+$1,152", at: 0.5 },
  { label: "ROI", value: "+11.52%", at: 0.5 },
  { label: "Win rate", value: "57.9%", at: 0.55 },
  { label: "Net PnL", value: "+$2,760", at: 0.85 },
  { label: "ROI", value: "+27.60%", at: 0.85 },
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sectionOpacity(progress: number, start: number, end: number, fade = 0.1) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function useTimelineCurve() {
  return useMemo(() => {
    const points = [
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-6, 0.5, -1.2),
      new THREE.Vector3(-2, 0.8, -0.4),
      new THREE.Vector3(2, 0.6, 0.6),
      new THREE.Vector3(6, 0.3, 1),
      new THREE.Vector3(10, 0, 0.2),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);
}

function TimelineGlow({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 120, 0.04, 8, false);
  }, [curve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshStandardMaterial
        color={GLOW}
        emissive={ACCENT}
        emissiveIntensity={0.85}
        transparent
        opacity={0.75}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

function TimelineNode({
  x,
  label,
  index,
  progressRef,
}: {
  x: number;
  label: string;
  index: number;
  progressRef: React.RefObject<number>;
}) {
  const coreRef = useRef<Mesh>(null!);
  const ringRef = useRef<Mesh>(null!);
  const nodeT = index / (TIMELINE_NODES.length - 1);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const dist = Math.abs(p - nodeT);
    const active = Math.max(0, 1 - dist * 4.5);
    const pulse = 0.5 + Math.sin(clock.elapsedTime * 2.5 + index) * 0.15;

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + active * 1.2 * pulse;
      coreRef.current.scale.setScalar(0.12 + active * 0.08);
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(0.35 + active * 0.25);
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.15 + active * 0.45;
    }
  });

  const y = Math.sin(index * 0.9) * 0.15 + 0.35;
  const z = Math.cos(index * 1.1) * 0.4;

  return (
    <group position={[x, y, z]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.38, 32]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#f8fdff" emissive={ACCENT} emissiveIntensity={0.3} roughness={0.15} />
      </mesh>
    </group>
  );
}

function TimelineGrid() {
  const lines = useMemo(() => {
    const arr: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = -10; i <= 10; i += 2) {
      arr.push([new THREE.Vector3(i, -0.02, -4), new THREE.Vector3(i, -0.02, 4)]);
    }
    for (let z = -4; z <= 4; z += 2) {
      arr.push([new THREE.Vector3(-10, -0.02, z), new THREE.Vector3(10, -0.02, z)]);
    }
    return arr;
  }, []);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#1c2a38" transparent opacity={0.35} lineWidth={1} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[22, 10]} />
        <meshStandardMaterial color="#0c121b" roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
}

function TimelineScene({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const curve = useTimelineCurve();
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }) => {
    const p = progressRef.current;
    const point = curve.getPointAt(Math.min(0.999, p));
    const ahead = curve.getPointAt(Math.min(0.999, p + 0.04));
    const { x, y } = pointerRef.current;

    const camX = point.x - 2.8 + x * 0.35;
    const camY = point.y + 1.6 + y * 0.2;
    const camZ = 4.5 + Math.sin(clock.elapsedTime * 0.3) * 0.08;

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.08);
    lookTarget.copy(ahead);
    lookTarget.y += 0.2;
    camera.lookAt(lookTarget);
  });

  const trailPoints = useMemo(() => curve.getPoints(80), [curve]);

  return (
    <>
      <color attach="background" args={[BASE]} />
      <fog attach="fog" args={[BASE, 8, 24]} />
      <ambientLight intensity={0.25} color="#b7c6cf" />
      <directionalLight position={[4, 6, 5]} intensity={0.45} color="#f8fdff" />
      <pointLight position={[-4, 2, 3]} intensity={0.6} color={ACCENT} distance={18} />
      <pointLight position={[6, 1, -2]} intensity={0.4} color={GLOW} distance={16} />

      <TimelineGrid />
      <TimelineGlow curve={curve} />
      <Line points={trailPoints} color={ACCENT} transparent opacity={0.25} lineWidth={1} />

      {TIMELINE_NODES.map((node, i) => (
        <TimelineNode key={node.label} x={node.x} label={node.label} index={i} progressRef={progressRef} />
      ))}
    </>
  );
}

function metricsForProgress(p: number) {
  const visible = METRICS.filter((m) => p >= m.at - 0.05);
  const latest = new Map<string, string>();
  visible.forEach((m) => latest.set(m.label, m.value));
  return Array.from(latest.entries()).map(([label, value]) => ({ label, value }));
}

export default function CryptOwlTimeline() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  const [progress, setProgress] = useState(0);
  const [activeNode, setActiveNode] = useState("TIME");

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));

    const idx = Math.min(
      TIMELINE_NODES.length - 1,
      Math.round(p * (TIMELINE_NODES.length - 1)),
    );
    setActiveNode(TIMELINE_NODES[idx].label);
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const p = progress / 100;
  const metrics = metricsForProgress(p);

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={480}
      stickyClassName="text-[#f8fdff]"
      hint={locale === "ko" ? "↓ 스크롤 — 3D 타임라인 카메라 이동" : "↓ Scroll — 3D timeline camera move"}
      showProgress={false}
    >
      <div
        className="relative h-full w-full"
        style={{ background: BASE }}
        onPointerMove={handlePointer}
      >
        <div className="absolute inset-0">
          <Canvas camera={{ position: [-5, 2, 5], fov: 48 }} dpr={[1, 1.75]}>
            <TimelineScene progressRef={progressRef} pointerRef={pointerRef} />
          </Canvas>
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#96cdde]">
              CryptOwl
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#7ce6ff]/70">
              {activeNode}
            </span>
          </div>

          <div className="relative mx-auto min-h-[180px] w-full max-w-xl text-center">
            {SECTIONS.map((s) => {
              const o = sectionOpacity(p, s.start, s.end);
              return (
                <div key={s.id} className="absolute inset-x-0" style={{ opacity: o }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#96cdde]">
                    {s.kicker}
                  </p>
                  <h3 className="mt-4 text-4xl font-light tracking-tight text-[#f8fdff] sm:text-6xl">
                    {s.title}
                  </h3>
                  <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#b7c6cf]">
                    {s.sub}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded border border-[#7ce6ff]/20 bg-[#0c121b]/80 px-3 py-2 backdrop-blur-sm"
                >
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#84949e]">
                    {m.label}
                  </p>
                  <p
                    className="font-mono text-sm font-medium tabular-nums"
                    style={{ color: m.value.startsWith("+") ? POSITIVE : "#f8fdff" }}
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] tabular-nums text-[#84949e]">{progress}%</p>
          </div>
        </div>
      </div>
    </LabStickyScroll>
  );
}
