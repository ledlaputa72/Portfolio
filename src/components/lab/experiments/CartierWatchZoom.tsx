"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const GOLD = "#c9a227";
/** Inner radius of the cylindrical stage — camera sits at origin */
const CYLINDER_R = 7;

const UNIVERSES = [
  {
    id: "baignoire",
    title: "Baignoire Allongée",
    subtitle: "The Eye of the Jeweller",
    sand: "#e4ddd2",
    sky: "#f3f0eb",
    fog: "#efecea",
    accent: GOLD,
    watch: "baignoire" as const,
  },
  {
    id: "tank",
    title: "Tank Louis",
    subtitle: "Refined geometry — ivory atelier",
    sand: "#e8e2d8",
    sky: "#f0ece6",
    fog: "#ece8e2",
    accent: "#b8960c",
    watch: "tank" as const,
  },
  {
    id: "santos",
    title: "Santos de Cartier",
    subtitle: "Pioneering spirit — luminous horizon",
    sand: "#dde4e8",
    sky: "#eef2f5",
    fog: "#e8ecef",
    accent: "#7a9ab8",
    watch: "santos" as const,
  },
  {
    id: "panthere",
    title: "Panthère",
    subtitle: "Bold elegance — golden dunes",
    sand: "#e6dcc8",
    sky: "#f2ebe0",
    fog: "#ede6da",
    accent: "#d4af37",
    watch: "panthere" as const,
  },
  {
    id: "ballon",
    title: "Ballon Bleu",
    subtitle: "Floating crown — soft mirage",
    sand: "#e0e4ec",
    sky: "#eef0f6",
    fog: "#e8eaf0",
    accent: "#5a7aa8",
    watch: "ballon" as const,
  },
  {
    id: "crash",
    title: "Crash",
    subtitle: "Sculptural asymmetry — desert light",
    sand: "#e2dcd4",
    sky: "#f0ebe5",
    fog: "#ebe6e0",
    accent: "#a08040",
    watch: "crash" as const,
  },
] as const;

function goldMat(color = GOLD) {
  return <meshStandardMaterial color={color} metalness={0.94} roughness={0.16} />;
}

function WatchDial({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.38, 0.38, 0.05, 48]} />
        <meshStandardMaterial color="#f8f4ec" roughness={0.4} metalness={0.05} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 0.3;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * r, Math.cos(a) * r, 0.03]}
            rotation={[0, 0, -a]}
          >
            <boxGeometry args={[0.015, i % 3 === 0 ? 0.06 : 0.03, 0.008]} />
            <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
}

function TankWatch() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.72, 0.52, 0.14]} />
        {goldMat()}
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.58, 0.4, 0.04]} />
        <meshStandardMaterial color="#f8f4ec" roughness={0.4} />
      </mesh>
    </group>
  );
}

function SantosWatch() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.055, 16, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.44, 0.44, 0.16, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      <group position={[0, 0.02, 0.06]}>
        <WatchDial />
      </group>
    </group>
  );
}

function PanthereWatch() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.62, 0.48, 0.12]} />
        <meshStandardMaterial color={GOLD} metalness={0.93} roughness={0.16} />
      </mesh>
      <group position={[0, 0, 0.07]}>
        <WatchDial scale={0.85} />
      </group>
    </group>
  );
}

function BallonBleuWatch() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.05, 16, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.14, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      <group position={[0, 0, 0.05]}>
        <WatchDial scale={0.9} />
      </group>
      <mesh position={[0, -0.38, 0.12]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.12} />
      </mesh>
    </group>
  );
}

function CrashWatch() {
  return (
    <group rotation={[0, 0, 0.35]}>
      <mesh>
        <boxGeometry args={[0.65, 0.5, 0.12]} />
        <meshStandardMaterial color={GOLD} metalness={0.91} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BaignoireWatch() {
  return (
    <group scale={[1.2, 0.9, 1]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.055, 16, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.14} />
      </mesh>
      <mesh scale={[1, 0.75, 1]}>
        <cylinderGeometry args={[0.38, 0.38, 0.14, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.93} roughness={0.16} />
      </mesh>
      <group position={[0, 0, 0.06]} scale={[1, 0.75, 1]}>
        <WatchDial scale={0.8} />
      </group>
      <mesh position={[0.32, 0.05, 0.08]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#1e4a8a" metalness={0.3} roughness={0.2} />
      </mesh>
    </group>
  );
}

function WatchModel({ type }: { type: (typeof UNIVERSES)[number]["watch"] }) {
  switch (type) {
    case "tank":
      return <TankWatch />;
    case "santos":
      return <SantosWatch />;
    case "panthere":
      return <PanthereWatch />;
    case "ballon":
      return <BallonBleuWatch />;
    case "crash":
      return <CrashWatch />;
    case "baignoire":
      return <BaignoireWatch />;
    default:
      return <BaignoireWatch />;
  }
}

function Workbench({ x }: { x: number }) {
  return (
    <group position={[x, -0.55, 3.2]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.7]} />
        <meshStandardMaterial color="#3a322c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.42, -0.12]}>
        <boxGeometry args={[0.55, 0.75, 0.06]} />
        <meshStandardMaterial color="#2c2620" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, -0.1]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#4a4038" roughness={0.8} />
      </mesh>
    </group>
  );
}

function SandDunes({ sand, sky }: { sand: string; sky: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 2.5]}>
        <planeGeometry args={[9, 11]} />
        <meshStandardMaterial color={sand} roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.8, 5.5]} scale={[1, 1, 1]}>
        <planeGeometry args={[8, 5.5]} />
        <meshStandardMaterial color={sky} roughness={1} />
      </mesh>
      <mesh position={[-2.5, -0.2, 4.5]} rotation={[0, 0.3, 0]}>
        <coneGeometry args={[1.2, 1.8, 4]} />
        <meshStandardMaterial color={sand} roughness={0.98} />
      </mesh>
      <mesh position={[2.8, -0.35, 4.8]} rotation={[0, -0.4, 0]}>
        <coneGeometry args={[1.5, 2.2, 4]} />
        <meshStandardMaterial color={sand} roughness={0.98} />
      </mesh>
    </group>
  );
}

/** Distance in front of camera for the hero watch */
const HERO_Z = -2.8;

function UniversePanel({ config }: { config: (typeof UNIVERSES)[number] }) {
  return (
    <group>
      <SandDunes sand={config.sand} sky={config.sky} />
      <Workbench x={-2.2} />
      <Workbench x={2.2} />
      <pointLight position={[0, 2, 3]} intensity={0.6} color="#fff8f0" distance={12} />
    </group>
  );
}

function CylinderStage({
  progressRef,
  stageRotYRef,
}: {
  progressRef: React.RefObject<number>;
  stageRotYRef: React.MutableRefObject<number>;
}) {
  const stageRef = useRef<Group>(null!);
  const panelRefs = useRef<(Group | null)[]>([]);

  useFrame(() => {
    const p = progressRef.current;
    const n = UNIVERSES.length;
    const section = Math.min(n - 1, Math.floor(p * n));
    const local = (p * n) % 1;

    if (!stageRef.current) return;

    // 180° pivot per scroll section — camera at center, stage rotates
    const targetY = -(section * Math.PI + local * Math.PI);
    stageRef.current.rotation.y = targetY;
    stageRotYRef.current = targetY;

    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const panelAngle = i * Math.PI;
      const relative = panelAngle + stageRef.current.rotation.y;
      const facing = Math.cos(relative);
      const fade = THREE.MathUtils.smoothstep(facing, 0.05, 0.72);

      panel.visible = fade > 0.02;
      panel.scale.setScalar(Math.max(0.001, fade));
    });
  });

  return (
    <group ref={stageRef}>
      {UNIVERSES.map((config, i) => {
        const angle = i * Math.PI;
        const x = Math.sin(angle) * CYLINDER_R;
        const z = -Math.cos(angle) * CYLINDER_R;
        return (
          <group
            key={config.id}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            position={[x, 0, z]}
            rotation={[0, angle + Math.PI, 0]}
          >
            <UniversePanel config={config} />
          </group>
        );
      })}
    </group>
  );
}

function FixedCenterCamera() {
  const { camera } = useThree();
  useFrame(({ pointer }) => {
    camera.position.set(0, 0, 0);
    camera.lookAt(pointer.x * 0.15, pointer.y * 0.08, -1);
  });
  return null;
}

/** Hero watch — follows camera, counter-rotates against stage, swaps at section pivot */
function HeroWatch({
  progressRef,
  stageRotYRef,
}: {
  progressRef: React.RefObject<number>;
  stageRotYRef: React.MutableRefObject<number>;
}) {
  const mountRef = useRef<Group>(null!);
  const counterRef = useRef<Group>(null!);
  const watchRefs = useRef<(Group | null)[]>([]);
  const offset = useRef(new THREE.Vector3());
  const lookDir = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!mountRef.current || !counterRef.current) return;

    const { camera } = state;
    lookDir.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
    offset.current.copy(camera.position).addScaledVector(lookDir.current, -HERO_Z);
    mountRef.current.position.copy(offset.current);
    mountRef.current.quaternion.copy(camera.quaternion);

    counterRef.current.rotation.y = -stageRotYRef.current;
    counterRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.02;

    const p = progressRef.current;
    const n = UNIVERSES.length;
    const section = Math.min(n - 1, Math.floor(p * n));
    const local = (p * n) % 1;
    const transition = THREE.MathUtils.smoothstep(local, 0.76, 0.98);

    watchRefs.current.forEach((group, i) => {
      if (!group) return;

      let alpha = 0;
      if (i === section) {
        alpha = section < n - 1 ? 1 - transition : 1;
      } else if (i === section + 1 && section < n - 1) {
        alpha = transition;
      }

      group.visible = alpha > 0.02;
      group.scale.setScalar(Math.max(0.001, alpha));
    });
  });

  return (
    <group ref={mountRef}>
      <pointLight position={[0.6, 0.8, 1.2]} intensity={1.4} color="#fff5e8" distance={6} />
      <pointLight position={[-0.8, -0.3, 0.8]} intensity={0.35} color="#c9a227" distance={5} />
      <group ref={counterRef} scale={1.35}>
        {UNIVERSES.map((config, i) => (
          <group
            key={config.id}
            ref={(el) => {
              watchRefs.current[i] = el;
            }}
          >
            <WatchModel type={config.watch} />
          </group>
        ))}
      </group>
    </group>
  );
}

function CartierWorld({ progressRef }: { progressRef: React.RefObject<number> }) {
  const stageRotYRef = useRef(0);
  const { scene } = useThree();

  useFrame(() => {
    const p = progressRef.current;
    const idx = Math.min(UNIVERSES.length - 1, Math.floor(p * UNIVERSES.length));
    const targetFog = new THREE.Color(UNIVERSES[idx].fog);
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(targetFog, 0.08);
    }
  });

  return (
    <>
      <color attach="background" args={["#efecea"]} />
      <fog attach="fog" args={["#efecea", 8, 22]} />
      <ambientLight intensity={0.85} color="#fffaf5" />
      <directionalLight position={[2, 8, 4]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, 3, -2]} intensity={0.25} color="#ffe8c8" />
      <FixedCenterCamera />
      <CylinderStage progressRef={progressRef} stageRotYRef={stageRotYRef} />
      <HeroWatch progressRef={progressRef} stageRotYRef={stageRotYRef} />
    </>
  );
}

function stageRotationDeg(progress: number) {
  const n = UNIVERSES.length;
  const section = Math.min(n - 1, Math.floor(progress * n));
  const local = (progress * n) % 1;
  return Math.round(((section + local) * 180) % 360);
}

export default function CartierWatchZoom() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const [universeIndex, setUniverseIndex] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleProgress = (p: number) => {
    progressRef.current = p;
    const idx = Math.min(UNIVERSES.length - 1, Math.floor(p * UNIVERSES.length));
    setUniverseIndex(idx);
    setRotationDeg(stageRotationDeg(p));
    setScrollPercent(Math.round(p * 100));
  };

  const universe = UNIVERSES[universeIndex];

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={500}
      stickyClassName="bg-[#efecea] text-[#1a1816]"
      hint={locale === "ko" ? "↓ 스크롤 — 배경 무대가 180° 회전, 중앙 시계는 고정·반대 회전 후 교체" : "↓ Scroll — stage pivots 180°, center watch stays fixed, counter-rotates, then swaps"}
      progressLabel="Universe"
      showProgress={false}
    >
      <Canvas camera={{ position: [0, 0, 0], fov: 55, near: 0.1, far: 50 }} dpr={[1, 2]}>
        <CartierWorld progressRef={progressRef} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between px-8 pt-10 sm:px-12">
        <span className="text-[10px] uppercase tracking-[0.45em] text-[#1a1816]/40">
          Cartier
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#1a1816]/30">
          Watches &amp; Wonders
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[18%] z-10 px-8 text-center sm:px-12">
        <p className="font-serif text-xs uppercase tracking-[0.35em] text-[#1a1816]/45 sm:text-sm">
          {universe.subtitle}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-6 z-10 flex flex-col justify-center gap-2 sm:right-10">
        {UNIVERSES.map((u, i) => (
          <span
            key={u.id}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === universeIndex ? "bg-[#c9a227]" : "bg-[#1a1816]/20"
            }`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 px-8 sm:px-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#c9a227]">
          Universe {universeIndex + 1} / {UNIVERSES.length}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-light tracking-wide text-[#1a1816] sm:text-4xl">
          {universe.title}
        </h2>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-between px-8 sm:px-12">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#1a1816]/35">
            Stage pivot (180°)
          </p>
          <p className="font-serif text-3xl tabular-nums text-[#c9a227]">{rotationDeg}°</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#1a1816]/35">
            Scroll journey
          </p>
          <p className="font-serif text-3xl tabular-nums text-[#1a1816]/70">{scrollPercent}%</p>
        </div>
      </div>
    </LabStickyScroll>
  );
}
