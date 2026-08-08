"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const BG = "#0a100d";
const RADAR = "#3dff8b";
const RADAR_DIM = "#1a5c38";
const ALERT = "#f87171";
const MUTED = "#6b7c72";
const SURGE = "#2d4a38";

const CAMERA_KEYS = [
  { t: 0, pos: [0, 16, 24] as const, look: [0, 0, -4] as const },
  { t: 0.18, pos: [4, 9, 14] as const, look: [0, 0.4, 0] as const },
  { t: 0.38, pos: [1.8, 3.6, 6.5] as const, look: [0, 0.7, 0] as const },
  { t: 0.55, pos: [0.5, 1.15, 2.6] as const, look: [0, 0.55, 0] as const },
  { t: 0.72, pos: [1.6, 1.35, 2.1] as const, look: [0, 0.65, 0] as const },
  { t: 1, pos: [2.2, 1.5, 2.4] as const, look: [0, 0.6, 0] as const },
] as const;

const CONTENT_CARDS = [
  {
    id: "detect",
    at: 0.52,
    step: "01",
    title: "Detection & Jamming",
    body: "Continuous surveillance across the spectrum — off-the-shelf, DIY, and adversarial RF.",
  },
  {
    id: "deploy",
    at: 0.64,
    step: "02",
    title: "Modularity & Deployment",
    body: "Manpack, mounted, and vehicle configurations built for rapid field deployment.",
  },
  {
    id: "os",
    at: 0.76,
    step: "03",
    title: "Samaritan OS",
    body: "AI/ML scans millions of times per second — classify, track, and geolocate threats.",
  },
  {
    id: "ew",
    at: 0.88,
    step: "04",
    title: "Electronic Warfare",
    body: "ECM, direction finding, and geolocation — integrated countermeasure suite.",
  },
] as const;

const DISTANT_DRONES = [
  { x: -8, z: -12, y: 2.2, scale: 0.55 },
  { x: 6, z: -16, y: 1.8, scale: 0.5 },
  { x: -4, z: -20, y: 2.5, scale: 0.45 },
  { x: 10, z: -8, y: 1.6, scale: 0.48 },
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function lerp3(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
) {
  return new THREE.Vector3(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

function sampleCamera(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  let i = 0;
  for (let k = 0; k < CAMERA_KEYS.length - 1; k++) {
    if (p >= CAMERA_KEYS[k].t && p <= CAMERA_KEYS[k + 1].t) {
      i = k;
      break;
    }
    if (p > CAMERA_KEYS[k + 1].t) i = k + 1;
  }
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[Math.min(i + 1, CAMERA_KEYS.length - 1)];
  const span = b.t - a.t || 1;
  const local = smoothstep(Math.max(0, Math.min(1, (p - a.t) / span)));
  return { pos: lerp3(a.pos, b.pos, local), look: lerp3(a.look, b.look, local) };
}

function cardReveal(progress: number, at: number) {
  const t = smoothstep(Math.max(0, Math.min(1, (progress - at) / 0.1)));
  return { opacity: t, y: (1 - t) * 28, scale: 0.94 + t * 0.06 };
}

function LoadingRadar({ visible }: { visible: boolean }) {
  const sweepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !sweepRef.current) return;
    const tween = gsap.to(sweepRef.current, {
      rotation: 360,
      duration: 1.4,
      repeat: -1,
      ease: "none",
    });
    return () => {
      tween.kill();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#0a100d]">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-full border border-[#1a5c38]" />
          <div className="absolute inset-3 rounded-full border border-[#1a5c38]/60" />
          <div className="absolute inset-6 rounded-full border border-[#1a5c38]/40" />
          <div
            ref={sweepRef}
            className="absolute left-1/2 top-1/2 h-14 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full bg-gradient-to-t from-[#3dff8b] to-transparent"
          />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(61,255,139,0.14),transparent_68%)]" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#6b7c72]">
          Initializing SURGE
        </p>
      </div>
    </div>
  );
}

function WireframeDrone({
  scale = 1,
  emissive = 0.12,
  color = MUTED,
  pulse = false,
}: {
  scale?: number;
  emissive?: number;
  color?: string;
  pulse?: boolean;
}) {
  const groupRef = useRef<Group>(null!);
  const bodyRef = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    if (!groupRef.current || !bodyRef.current) return;
    if (pulse) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.6) * 0.06;
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = emissive + Math.sin(clock.elapsedTime * 2.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh ref={bodyRef}>
        <boxGeometry args={[0.9, 0.18, 0.9]} />
        <meshStandardMaterial
          color={color}
          emissive={RADAR}
          emissiveIntensity={emissive}
          wireframe
        />
      </mesh>
      {[
        [1.1, 0, 0],
        [-1.1, 0, 0],
        [0, 0, 1.1],
        [0, 0, -1.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.7, 0.05, 0.05]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshBasicMaterial color={RADAR_DIM} wireframe />
      </mesh>
    </group>
  );
}

function SurgeUnit() {
  return (
    <group position={[0, 0, -1.2]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.5, 20]} />
        <meshStandardMaterial color={SURGE} roughness={0.75} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.75, 0]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a2e22" emissive={RADAR_DIM} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.95, 0.15]} rotation={[0.5, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshStandardMaterial
          color="#0f1812"
          emissive={RADAR}
          emissiveIntensity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Terrain() {
  const gridLines = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = -12; i <= 12; i += 2) {
      lines.push(
        [new THREE.Vector3(i, 0, -28), new THREE.Vector3(i, 0, 8)],
        [new THREE.Vector3(-12, 0, i - 10), new THREE.Vector3(12, 0, i - 10)],
      );
    }
    return lines;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -8]} receiveShadow>
        <planeGeometry args={[48, 48, 1, 1]} />
        <meshStandardMaterial color="#0d1610" roughness={0.95} metalness={0.05} />
      </mesh>
      {gridLines.map((pts, i) => (
        <Line key={i} points={pts} color={RADAR_DIM} transparent opacity={0.22} lineWidth={1} />
      ))}
      {[
        [-10, -18, 2.5],
        [8, -22, 3],
        [-6, -24, 2],
        [12, -14, 2.8],
      ].map(([x, z, h], i) => (
        <mesh key={i} position={[x, h / 2 - 0.5, z]}>
          <coneGeometry args={[2.2, h, 5]} />
          <meshStandardMaterial color="#0a120d" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function ThreatField({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const far = 1 - smoothstep(Math.max(0, (p - 0.35) / 0.25));
    groupRef.current.visible = far > 0.04;
    const s = 0.55 + far * 0.45;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      {DISTANT_DRONES.map((d, i) => (
        <group key={i} position={[d.x, d.y, d.z]}>
          <WireframeDrone scale={d.scale} emissive={0.06} color={MUTED} />
        </group>
      ))}
    </group>
  );
}

function DollyScene({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const heroRef = useRef<Group>(null!);

  useFrame(({ camera, clock }) => {
    const p = progressRef.current;
    const { pos, look } = sampleCamera(p);
    const { x, y } = pointerRef.current;
    const dollyEase = smoothstep(Math.min(1, p / 0.55));

    targetPos.copy(pos);
    targetPos.x += x * 0.22 * (1 - dollyEase * 0.4);
    targetPos.y += y * 0.1;

    targetLook.copy(look);
    targetLook.x += x * 0.12;
    targetLook.y += y * 0.05;

    camera.position.lerp(targetPos, 0.07);
    camera.lookAt(targetLook);

    if (heroRef.current) {
      heroRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.15 * dollyEase;
    }
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 10, 42]} />
      <ambientLight intensity={0.18} color="#8fa89a" />
      <directionalLight position={[6, 14, 8]} intensity={0.45} color="#d1fae5" />
      <pointLight position={[0, 2, 2]} intensity={0.55} color={RADAR} distance={16} />
      <pointLight position={[-6, 4, -10]} intensity={0.25} color={ALERT} distance={20} />

      <Terrain />
      <ThreatField progressRef={progressRef} />
      <SurgeUnit />

      <group ref={heroRef} position={[0, 0.85, 0]}>
        <WireframeDrone scale={1.15} emissive={0.22} color={RADAR} pulse />
      </group>
    </>
  );
}

export default function ArmoryRadarScan() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(t);
  }, []);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));
    if (p > 0.02) setLoading(false);
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const p = progress / 100;
  const heroCopyOpacity = Math.max(0, 1 - smoothstep((p - 0.42) / 0.12));

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={480}
      stickyClassName="text-[#d1fae5]"
      hint={locale === "ko" ? "↓ 스크롤 — 원경→드론 근접 · capability 카드" : "↓ Scroll — far→near drone approach · capability cards"}
      showProgress={false}
    >
      <div
        className="relative h-full w-full"
        style={{ background: BG }}
        onPointerMove={handlePointer}
      >
        <LoadingRadar visible={loading} />

        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 16, 24], fov: 42 }} dpr={[1, 1.75]}>
            <DollyScene progressRef={progressRef} pointerRef={pointerRef} />
          </Canvas>
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#6b7c72]">
              Armory · SURGE
            </span>
            <span className="font-mono text-[10px] tabular-nums text-[#3dff8b]">
              CAM {p < 0.55 ? "DOLLY" : "LOCK"}
            </span>
          </div>

          <div
            className="mx-auto max-w-2xl text-center transition-opacity duration-300"
            style={{ opacity: heroCopyOpacity }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b7c72]">
              C-UAS · Made in Bharat
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[#ecfdf5] sm:text-5xl">
              Detect. Deter. Destroy.
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8fa89a]">
              Dominate drone threats — from wide-area surveillance to close-range neutralization.
            </p>
          </div>

          <div className="absolute inset-y-0 right-6 z-20 flex w-full max-w-[340px] flex-col justify-center gap-3 sm:right-10">
            {CONTENT_CARDS.map((card) => {
              const reveal = cardReveal(p, card.at);
              return (
                <div
                  key={card.id}
                  className="pointer-events-none rounded border border-[#3dff8b]/20 bg-[#0a100d]/85 p-4 backdrop-blur-md"
                  style={{
                    opacity: reveal.opacity,
                    transform: `translateY(${reveal.y}px) scale(${reveal.scale})`,
                  }}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#3dff8b]">
                    {card.step}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#ecfdf5]">{card.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#8fa89a]">{card.body}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b7c72]">
            <span>{p < 0.55 ? "Approach vector" : "Capability stack"}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>
    </LabStickyScroll>
  );
}
