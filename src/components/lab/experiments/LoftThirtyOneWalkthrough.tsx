"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { PointLight } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";

const WOOD = "#8b6f52";
const WALL = "#f3efe8";
const CONCRETE = "#b8b0a6";
const WARM = "#ffd4a0";

const SECTIONS = [
  {
    id: "hero",
    start: 0,
    end: 0.22,
    kicker: "Design · Build · Deliver",
    title: "We build sensational spaces",
    sub: "Your partner from day one — dirt to décor, coast to coast.",
  },
  {
    id: "living",
    start: 0.22,
    end: 0.46,
    kicker: "Living",
    title: "Open Loft Living",
    sub: "End-to-end delivery for residential & commercial interiors.",
  },
  {
    id: "kitchen",
    start: 0.46,
    end: 0.7,
    kicker: "Kitchen & Dining",
    title: "From Concept to Elevations",
    sub: "Full-service beyond interior design — we advocate, design, build, and execute.",
  },
  {
    id: "suite",
    start: 0.7,
    end: 1,
    kicker: "Suite",
    title: "Award-Winning Build",
    sub: "Let's talk — turn your vision into a finished space.",
  },
] as const;

const CAMERA_KEYS = [
  { t: 0, pos: [3.2, 1.75, 4.5] as const, look: [0, 1.2, -1] as const },
  { t: 0.22, pos: [2.4, 1.65, 0.5] as const, look: [-0.5, 1.1, -4] as const },
  { t: 0.46, pos: [0.5, 1.6, -7.5] as const, look: [0, 1.05, -11] as const },
  { t: 0.7, pos: [-1.8, 1.55, -14] as const, look: [0.2, 1, -18] as const },
  { t: 1, pos: [1.5, 1.7, -20] as const, look: [0, 1.15, -24] as const },
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerp3(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): THREE.Vector3 {
  return new THREE.Vector3(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

function sampleCamera(progress: number) {
  let i = 0;
  for (let k = 0; k < CAMERA_KEYS.length - 1; k++) {
    if (progress >= CAMERA_KEYS[k].t && progress <= CAMERA_KEYS[k + 1].t) {
      i = k;
      break;
    }
    if (progress > CAMERA_KEYS[k + 1].t) i = k + 1;
  }
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[Math.min(i + 1, CAMERA_KEYS.length - 1)];
  const span = b.t - a.t || 1;
  const local = Math.max(0, Math.min(1, (progress - a.t) / span));
  const ease = local * local * (3 - 2 * local);
  return {
    pos: lerp3(a.pos, b.pos, ease),
    look: lerp3(a.look, b.look, ease),
  };
}

function sectionOpacity(progress: number, start: number, end: number, fade = 0.12) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function WindowWall({ x, z, rotY = 0 }: { x: number; z: number; rotY?: number }) {
  return (
    <group position={[x, 1.4, z]} rotation={[0, rotY, 0]}>
      <mesh>
        <planeGeometry args={[3.2, 2.2]} />
        <meshStandardMaterial color={WARM} emissive="#ffe8c8" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.3, 2.3]} />
        <meshStandardMaterial color="#2a2622" />
      </mesh>
    </group>
  );
}

function LivingRoom({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.35, -1.2]}>
        <boxGeometry args={[2.8, 0.7, 1]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.18, -0.2]}>
        <boxGeometry args={[1.4, 0.08, 0.8]} />
        <meshStandardMaterial color="#3d342c" roughness={0.6} />
      </mesh>
      <mesh position={[-1.8, 0.5, -2.5]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 1, 0.4]} />
        <meshStandardMaterial color="#6b5a48" />
      </mesh>
      <WindowWall x={-3.8} z={-2} rotY={Math.PI / 2} />
    </group>
  );
}

function Kitchen({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.45, -0.5]}>
        <boxGeometry args={[2.2, 0.9, 1.1]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.92, -0.5]}>
        <boxGeometry args={[2.3, 0.06, 1.15]} />
        <meshStandardMaterial color="#2a2622" metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[-2.2, 1.1, -1]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.5, 2.2, 0.35]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.55} />
      </mesh>
      <mesh position={[1.2, 0.55, -1.8]}>
        <boxGeometry args={[0.5, 1.1, 0.5]} />
        <meshStandardMaterial color="#1a1814" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function DiningRoom({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.42, -0.8]}>
        <boxGeometry args={[2.4, 0.08, 1.2]} />
        <meshStandardMaterial color="#4a3f35" roughness={0.5} />
      </mesh>
      {[-0.8, 0, 0.8].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.5, -1.5]}>
            <boxGeometry args={[0.45, 0.06, 0.45]} />
            <meshStandardMaterial color="#3d342c" />
          </mesh>
          <mesh position={[x, 0.25, -1.5]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color="#2a2622" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.6, -3.2]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f5efe4" emissive={WARM} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function SuiteRoom({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0.8, 0.28, -1]}>
        <boxGeometry args={[2, 0.35, 1.6]} />
        <meshStandardMaterial color="#e0d8cc" roughness={0.7} />
      </mesh>
      <mesh position={[-1.5, 0.4, -2.2]}>
        <boxGeometry args={[1.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#5c4a3a" />
      </mesh>
      <mesh position={[-1.5, 0.65, -2.2]}>
        <boxGeometry args={[0.08, 0.5, 0.08]} />
        <meshStandardMaterial color="#2a2622" />
      </mesh>
      <WindowWall x={3.6} z={-2.5} rotY={-Math.PI / 2} />
    </group>
  );
}

function LoftShell() {
  const length = 30;
  const segments = [
    { z: 0, label: "living" },
    { z: -8, label: "kitchen" },
    { z: -16, label: "dining" },
    { z: -24, label: "suite" },
  ];

  return (
    <group>
      <mesh position={[0, 0, -length / 2 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, length]} />
        <meshStandardMaterial color={WOOD} roughness={0.75} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.02, -length / 2 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, length]} />
        <meshStandardMaterial color="#6b5340" roughness={0.6} />
      </mesh>

      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 1.5, -length / 2 + 2]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[length, 3]} />
          <meshStandardMaterial color={WALL} roughness={0.92} />
        </mesh>
      ))}

      <mesh position={[0, 3, -length / 2 + 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, length]} />
        <meshStandardMaterial color="#ebe4da" roughness={0.9} />
      </mesh>

      {[-4, 0, 4].map((x) => (
        <mesh key={x} position={[x, 2.85, -length / 2 + 2]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.18, 0.22, length]} />
          <meshStandardMaterial color="#5c4a3a" roughness={0.8} />
        </mesh>
      ))}

      <mesh position={[0, 1.5, 2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.5, -length + 4]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>

      {segments.map((s) => (
        <group key={s.label}>
          {s.label === "living" && <LivingRoom z={s.z} />}
          {s.label === "kitchen" && <Kitchen z={s.z} />}
          {s.label === "dining" && <DiningRoom z={s.z} />}
          {s.label === "suite" && <SuiteRoom z={s.z} />}
        </group>
      ))}
    </group>
  );
}

function RoomLights({ progressRef }: { progressRef: React.RefObject<number> }) {
  const lights = useRef<(PointLight | null)[]>([]);
  const zones = useMemo(
    () => [
      { z: 0, color: WARM },
      { z: -8, color: "#fff0d8" },
      { z: -16, color: "#ffe8c0" },
      { z: -24, color: "#ffd9a8" },
    ],
    [],
  );

  useFrame(() => {
    const p = progressRef.current;
    const cam = sampleCamera(p);
    zones.forEach((zone, i) => {
      const light = lights.current[i];
      if (!light) return;
      const dist = Math.abs(cam.pos.z - zone.z);
      const intensity = Math.max(0.15, 1.4 - dist * 0.12);
      light.intensity = intensity;
    });
  });

  return (
    <>
      {zones.map((zone, i) => (
        <pointLight
          key={zone.z}
          ref={(el) => {
            lights.current[i] = el;
          }}
          position={[0, 2.2, zone.z]}
          color={zone.color}
          intensity={0.8}
          distance={14}
          decay={2}
        />
      ))}
    </>
  );
}

function WalkthroughScene({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = progressRef.current;
    const { pos, look } = sampleCamera(p);
    const { x, y } = pointerRef.current;

    targetPos.copy(pos);
    targetPos.x += x * 0.18;
    targetPos.y += y * 0.08;

    targetLook.copy(look);
    targetLook.x += x * 0.1;

    camera.position.lerp(targetPos, 0.08);
    camera.lookAt(targetLook);
  });

  return (
  <>
    <color attach="background" args={["#ebe6dc"]} />
    <fog attach="fog" args={["#ebe6dc", 6, 22]} />
    <ambientLight intensity={0.35} color="#fff5e8" />
    <directionalLight position={[4, 8, 6]} intensity={0.55} color="#fff8f0" />
    <RoomLights progressRef={progressRef} />
    <LoftShell />
  </>
  );
}

export default function LoftThirtyOneWalkthrough() {
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  const [progress, setProgress] = useState(0);
  const [roomLabel, setRoomLabel] = useState("Entry");

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));

    if (p < 0.22) setRoomLabel("Entry");
    else if (p < 0.46) setRoomLabel("Living");
    else if (p < 0.7) setRoomLabel("Kitchen · Dining");
    else setRoomLabel("Suite");
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const p = progress / 100;

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={500}
      stickyClassName="text-[#1c1916]"
      hint="↓ 스크롤 — 로프트 3D 워크스루 카메라"
      showProgress={false}
    >
      <div className="relative h-full w-full" onPointerMove={handlePointer}>
        <div className="absolute inset-0">
          <Canvas camera={{ position: [3.2, 1.75, 4.5], fov: 52 }} dpr={[1, 1.75]}>
            <WalkthroughScene progressRef={progressRef} pointerRef={pointerRef} />
          </Canvas>
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10">
          <div className="flex items-start justify-between">
            <p
              className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#1c1916]/50"
              style={{ fontFamily: "Georgia, 'Noto Serif Display', serif" }}
            >
              LOFT THIRTY ONE
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#1c1916]/40">
              {roomLabel}
            </p>
          </div>

          <div className="relative mx-auto min-h-[200px] w-full max-w-xl text-center">
            {SECTIONS.map((s) => {
              const o = sectionOpacity(p, s.start, s.end);
              return (
                <div
                  key={s.id}
                  className="absolute inset-x-0"
                  style={{ opacity: o }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.3em] text-[#1c1916]/45"
                    style={{ fontFamily: "ui-monospace, 'Fragment Mono', monospace" }}
                  >
                    {s.kicker}
                  </p>
                  <h3
                    className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#1c1916] sm:text-5xl"
                    style={{ fontFamily: "Georgia, 'Noto Serif Display', serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#1c1916]/65">
                    {s.sub}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#1c1916]/40">
            <span>Dirt to décor</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>
    </LabStickyScroll>
  );
}
