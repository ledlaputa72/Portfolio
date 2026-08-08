"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const BG = "#f2f1ed";
const SKY_TOP = "#b4cfe8";
const SKY_BOTTOM = "#e4edf5";
const GLASS = "#c5d6e8";
const TEXT = "#111111";
const MUTED = "#6e6e6e";

const AIR_LOGO_PX = 14;
const MENU_BAR_H = AIR_LOGO_PX * 1.2;
const HEADER_TOP_PAD = 14;
const HEADER_TOTAL = HEADER_TOP_PAD + AIR_LOGO_PX + 8 + MENU_BAR_H;

const SCROLL_VH = 2200;
const FLOOR_H = 0.24;

const CENTER_TOWER = { floors: 12, twist: 0.078, width: 1.05, depth: 1.0 };
const SIDE_TOWERS = [
  { x: -1.85, floors: 8, twist: 0.055, scale: 0.72 },
  { x: 1.85, floors: 9, twist: 0.062, scale: 0.76 },
] as const;

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

/**
 * Scroll map (0–1) — slower spread + exposure settle
 * 0.00–0.14  AIR enter
 * 0.16–0.38  spread (white wash → reveal) + stairs bloom
 * 0.40–0.52  gather → header lock + sky tower hero rise
 * 0.52–0.64  3D towers slide (after hero settles)
 * 0.64+      editorial chapters → finale stairs
 */
function sceneState(p: number) {
  const enter = smoothstep(0, 0.14, p);
  const spread = smoothstep(0.16, 0.38, p);
  const gather = smoothstep(0.4, 0.52, p);
  const spreadAmt = spread * (1 - gather);
  const typoOpacity = smoothstep(0, 0.05, p);

  const exposureWash = clamp01(1 - easeInOutCubic(smoothstep(0.16, 0.44, spread)));

  const stairsIntroReveal = easeInOutCubic(smoothstep(0.24, 0.48, spread));
  const stairsIntroOpacity = stairsIntroReveal * (1 - smoothstep(0.4, 0.5, gather));
  const stairsScale = lerp(1.05, 1.55, stairsIntroReveal);

  const towerRise = smoothstep(0.38, 0.5, p);
  const headerLocked = gather >= 0.36 ? 1 : smoothstep(0.28, 0.36, gather);

  const towersRise = panelRise(p, 0.52, 0.64);
  const floorReveal = smoothstep(0.56, 0.68, p);

  const momentumRise = panelRise(p, 0.64, 0.74);
  const premiumRise = panelRise(p, 0.72, 0.82);
  const lobbyRise = panelRise(p, 0.8, 0.9);
  const twistRise = panelRise(p, 0.88, 0.96);
  const finaleRise = panelRise(p, 0.92, 0.99);

  const stairsFinaleOpacity = smoothstep(0.94, 0.99, p);
  const inTypoPhase = gather < 0.97;

  const stairsCamZ = lerp(6.8, 11.5, Math.max(stairsFinaleOpacity, stairsIntroOpacity * 0.25));

  return {
    enter,
    spread,
    gather,
    spreadAmt,
    typoOpacity,
    exposureWash,
    stairsIntroOpacity,
    stairsFinaleOpacity,
    stairsScale,
    towerRise,
    headerLocked,
    towersRise,
    floorReveal,
    momentumRise,
    premiumRise,
    lobbyRise,
    twistRise,
    finaleRise,
    inTypoPhase,
    stairsCamZ,
  };
}

const letterStyle = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontWeight: 300,
  lineHeight: 0.88,
  color: TEXT,
  display: "inline-block" as const,
  flexShrink: 0,
};

function AirTypography({
  enter,
  spreadAmt,
  gather,
  opacity,
  headerLocked,
}: {
  enter: number;
  spreadAmt: number;
  gather: number;
  opacity: number;
  headerLocked: number;
}) {
  if (opacity < 0.01 || headerLocked > 0.15) return null;

  const slideX = lerp(-42, 0, enter) * (1 - gather);
  const dockY = lerp(0, -47.5, gather);
  const dockScale = lerp(1, lerp(0.14, 0.09, spreadAmt), gather);
  const fadeOut = 1 - smoothstep(0.22, 0.36, gather);

  const rowWidth = lerp(26, 100, spreadAmt);
  const fontVw = lerp(28, 24, spreadAmt);
  const fontRem = lerp(22, 18, spreadAmt);
  const edgePad = lerp(0, 1.5, spreadAmt);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
      style={{
        opacity: opacity * fadeOut,
        transform: `translateX(${slideX}vw) translateY(${dockY}vh) scale(${dockScale})`,
        transformOrigin: "center center",
      }}
      aria-hidden={gather > 0.96}
    >
      <div
        className="flex items-baseline"
        style={{
          width: `${rowWidth}%`,
          maxWidth: "100%",
          justifyContent: spreadAmt < 0.06 ? "center" : "space-between",
          paddingInline: `${edgePad}vw`,
          letterSpacing: spreadAmt < 0.06 ? "-0.04em" : "0",
        }}
      >
        {(["A", "I", "R"] as const).map((char) => (
          <span key={char} style={{ ...letterStyle, fontSize: `min(${fontVw}vw, ${fontRem}rem)` }}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

function AirHeader({ visible }: { visible: number }) {
  if (visible < 0.02) return null;

  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-[200]"
      style={{ opacity: visible }}
    >
      <div className="flex w-full flex-col items-center" style={{ background: BG }}>
        <p
          className="font-mono font-medium uppercase tracking-[0.32em]"
          style={{
            fontSize: AIR_LOGO_PX,
            lineHeight: 1,
            color: TEXT,
            paddingTop: HEADER_TOP_PAD,
            paddingBottom: 8,
          }}
        >
          AIR
        </p>
        <div className="w-full" style={{ height: MENU_BAR_H, background: "rgba(0,0,0,0.5)" }} />
      </div>
    </header>
  );
}

function ExposureWash({ opacity }: { opacity: number }) {
  if (opacity < 0.01) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[48]"
      style={{
        opacity,
        background: "#ffffff",
        mixBlendMode: "normal",
      }}
      aria-hidden
    />
  );
}

function SlidePanel({
  rise,
  zIndex,
  children,
  className = "",
}: {
  rise: number;
  zIndex: number;
  children: ReactNode;
  className?: string;
}) {
  if (rise < 0.001) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`}
      style={{
        top: HEADER_TOTAL,
        zIndex,
        transform: `translateY(${lerp(108, 0, rise)}%)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

function StairsBloomOverlay({ opacity }: { opacity: number }) {
  if (opacity < 0.03) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: opacity * 0.8,
        background:
          "radial-gradient(ellipse 100% 90% at 50% 45%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 48%, transparent 76%)",
        mixBlendMode: "soft-light",
      }}
      aria-hidden
    />
  );
}

type HelixStep = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  width: number;
  depth: number;
};

function buildHelixRibbon(count: number, layer: "main" | "inner", vertical = false): HelixStep[] {
  const layerOff = layer === "inner" ? 0.14 : 0;
  const scale = layer === "inner" ? 0.88 : 1;

  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    if (vertical) {
      const angle = t * Math.PI * 3.2 + layerOff;
      const radius = 0.55 + Math.sin(t * Math.PI) * 0.25;
      const x = Math.cos(angle) * radius * scale;
      const y = lerp(-3.2, 3.2, t) * scale;
      const z = Math.sin(angle) * radius * 0.35 * scale;
      const rotY = angle + Math.PI / 2;
      const width = lerp(1.4, 2.0, Math.sin(t * Math.PI)) * scale;
      return { x, y, z, rotX: 0.08, rotY, width, depth: 0.58 * scale };
    }

    const theta = lerp(-0.62, Math.PI * 1.02, t) + layerOff;
    const radius = (1.05 + t * 1.55) * scale;
    const x = (Math.sin(theta) * radius - 1.25) * scale;
    const y = lerp(3.1, -3.0, t) * scale;
    const z = (Math.cos(theta) * radius * 0.2 - 0.15) * scale;
    const t2 = Math.min(1, t + 1 / (count - 1));
    const theta2 = lerp(-0.62, Math.PI * 1.02, t2) + layerOff;
    const radius2 = (1.05 + t2 * 1.55) * scale;
    const x2 = (Math.sin(theta2) * radius2 - 1.25) * scale;
    const y2 = lerp(3.1, -3.0, t2) * scale;
    const rotY = Math.atan2(x2 - x, y2 - y);
    const width = lerp(1.65, 2.45, Math.sin(t * Math.PI * 0.88)) * scale;
    return { x, y, z, rotX: lerp(0.32, -0.24, t), rotY, width, depth: lerp(0.52, 0.72, t) * scale };
  });
}

const SLAB_MAT = {
  color: "#f0efec",
  metalness: 0.06,
  roughness: 0.84,
  emissive: "#ffffff",
  emissiveIntensity: 0.05,
};

function HelixSlab({ step, layer }: { step: HelixStep; layer: "main" | "inner" }) {
  const mat = layer === "inner" ? { ...SLAB_MAT, color: "#e8e7e4", emissiveIntensity: 0.03 } : SLAB_MAT;
  return (
    <RoundedBox
      args={[step.width, 0.075, step.depth]}
      radius={0.022}
      smoothness={5}
      position={[step.x, step.y, step.z]}
      rotation={[step.rotX, step.rotY, 0.015]}
    >
      <meshStandardMaterial {...mat} />
    </RoundedBox>
  );
}

function StairSculpture({ vertical = false }: { vertical?: boolean }) {
  const mainSteps = useMemo(() => buildHelixRibbon(56, "main", vertical), [vertical]);
  const innerSteps = useMemo(() => buildHelixRibbon(48, "inner", vertical), [vertical]);
  return (
    <group position={[vertical ? 0 : 0.35, vertical ? 0 : 0.1, 0]} rotation={[vertical ? 0 : 0.04, vertical ? 0 : -0.12, 0]}>
      {mainSteps.map((step, i) => (
        <HelixSlab key={`m-${i}`} step={step} layer="main" />
      ))}
      {innerSteps.map((step, i) => (
        <HelixSlab key={`i-${i}`} step={step} layer="inner" />
      ))}
    </group>
  );
}

function StairsScene({ progressRef, vertical = false }: { progressRef: React.RefObject<number>; vertical?: boolean }) {
  const groupRef = useRef<Group>(null!);
  const lookAt = useMemo(() => new THREE.Vector3(vertical ? 0 : 0.1, 0, 0), [vertical]);
  const camPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, camera }) => {
    const st = sceneState(progressRef.current);
    if (!groupRef.current) return;

    groupRef.current.rotation.y = clock.elapsedTime * 0.06;
    groupRef.current.scale.setScalar(st.stairsScale);

    camPos.set(vertical ? 0.2 : 0.9, vertical ? 0.1 : 0.2, st.stairsCamZ);
    camera.position.lerp(camPos, 0.05);
    camera.lookAt(lookAt);
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 18, 42]} />
      <ambientLight intensity={0.96} color="#ffffff" />
      <directionalLight position={[3, 10, 7]} intensity={0.72} color="#ffffff" />
      <directionalLight position={[-5, 3, 4]} intensity={0.28} color="#e4ecf8" />
      <pointLight position={[-2, 2, 5]} intensity={0.9} color="#ffffff" distance={28} />
      <group ref={groupRef}>
        <StairSculpture vertical={vertical} />
      </group>
    </>
  );
}

function HeroTowerGlass() {
  const floors = 18;
  return (
    <group position={[0.35, -1.2, 0]} rotation={[0, -0.35, 0]}>
      {Array.from({ length: floors }, (_, i) => {
        const t = i / floors;
        const curve = Math.sin(t * Math.PI * 0.85) * 0.55;
        return (
          <mesh key={i} position={[curve, i * 0.22, 0]} rotation={[0, curve * 0.15, 0]}>
            <boxGeometry args={[1.35, 0.18, 0.72]} />
            <meshPhysicalMaterial
              color="#d8e8f8"
              metalness={0.55}
              roughness={0.08}
              transparent
              opacity={0.88}
              transmission={0.35}
              thickness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function HeroTowerScene() {
  return (
    <>
      <color attach="background" args={[SKY_BOTTOM]} />
      <ambientLight intensity={0.85} color="#f0f6ff" />
      <directionalLight position={[5, 12, 4]} intensity={0.7} color="#ffffff" />
      <HeroTowerGlass />
    </>
  );
}

function FloorSlab({
  i, total, x, twist, w, d, reveal,
}: {
  i: number; total: number; x: number; twist: number; w: number; d: number; reveal: number;
}) {
  const t = i / Math.max(1, total - 1);
  const active = Math.abs(reveal * (total - 1) - i) < 0.9;
  const lit = i <= reveal * (total - 1) + 0.3;
  const liftAmt = lit ? smoothstep(t, t + 0.08, reveal) * 0.1 : 0;
  return (
    <group position={[x, i * FLOOR_H + liftAmt, 0]} rotation={[0, i * twist, 0]}>
      <mesh>
        <boxGeometry args={[w, FLOOR_H * 0.88, d]} />
        <meshStandardMaterial
          color={active ? "#d8e8f8" : GLASS}
          metalness={0.35}
          roughness={0.2}
          transparent
          opacity={lit ? 0.92 : 0.38}
          emissive={active ? "#6a9ec8" : "#000000"}
          emissiveIntensity={active ? 0.14 : 0}
        />
      </mesh>
    </group>
  );
}

function Towers({ reveal }: { reveal: number }) {
  const centerFloors = useMemo(() => Array.from({ length: CENTER_TOWER.floors }, (_, i) => i), []);
  return (
    <group>
      {SIDE_TOWERS.map((t) => (
        <group key={t.x} scale={t.scale}>
          {Array.from({ length: t.floors }, (_, i) => (
            <FloorSlab key={i} i={i} total={t.floors} x={t.x} twist={t.twist} w={CENTER_TOWER.width * 0.9} d={CENTER_TOWER.depth * 0.9} reveal={reveal * 0.85} />
          ))}
        </group>
      ))}
      {centerFloors.map((i) => (
        <FloorSlab key={i} i={i} total={CENTER_TOWER.floors} x={0} twist={CENTER_TOWER.twist} w={CENTER_TOWER.width} d={CENTER_TOWER.depth} reveal={reveal} />
      ))}
    </group>
  );
}

function TowersScene({ progressRef, pointerRef }: { progressRef: React.RefObject<number>; pointerRef: React.RefObject<{ x: number; y: number }> }) {
  const towersRef = useRef<Group>(null!);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const frame = sceneState(progressRef.current);
    const { x, y } = pointerRef.current;
    const floorT = frame.floorReveal;
    targetPos.set(x * 0.1, lerp(1.2, 3.2, floorT) + y * 0.06, lerp(6.4, 5.8, floorT));
    targetLook.set(0, lerp(0.8, 2.4, floorT), 0);
    camera.position.lerp(targetPos, 0.08);
    camera.lookAt(targetLook);
    if (towersRef.current) {
      towersRef.current.rotation.y = lerp(towersRef.current.rotation.y, x * 0.04, 0.04);
    }
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <ambientLight intensity={0.72} color="#ffffff" />
      <directionalLight position={[4, 8, 6]} intensity={0.5} color="#fffaf5" />
      <directionalLight position={[-3, 4, 2]} intensity={0.18} color="#d0e0f0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ebe8e3" roughness={0.95} />
      </mesh>
      <group ref={towersRef}>
        <Towers reveal={sceneState(progressRef.current).floorReveal} />
      </group>
    </>
  );
}

function EditorialBlock({ title, body, align = "left" }: { title: string; body: string; align?: "left" | "center" | "split" }) {
  if (align === "center") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <h2 className="max-w-3xl text-2xl font-light leading-tight tracking-[-0.02em] sm:text-4xl md:text-5xl" style={{ color: TEXT }}>
          {title}
        </h2>
        <p className="mt-6 max-w-lg text-xs leading-relaxed tracking-wide sm:text-sm" style={{ color: MUTED }}>
          {body}
        </p>
      </div>
    );
  }
  if (align === "split") {
    return (
      <div className="grid h-full grid-cols-1 gap-8 px-8 py-12 md:grid-cols-2 md:items-center md:px-14">
        <p className="text-sm leading-relaxed tracking-wide sm:text-base" style={{ color: TEXT }}>
          {body}
        </p>
        <div className="flex aspect-[4/3] items-center justify-center rounded-sm" style={{ background: `linear-gradient(145deg, ${SKY_TOP}, ${SKY_BOTTOM})` }}>
          <div className="h-3/4 w-2/5 rounded-t-full opacity-80" style={{ background: "linear-gradient(180deg, #c5d8ec 0%, #8aa8c8 100%)" }} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-end px-8 pb-16 sm:px-12 sm:pb-20">
      <h2 className="max-w-xl text-xl font-light leading-tight sm:text-3xl md:text-4xl" style={{ color: TEXT }}>
        {title}
      </h2>
      <p className="mt-4 max-w-md text-xs leading-relaxed sm:text-sm" style={{ color: MUTED }}>
        {body}
      </p>
    </div>
  );
}

function PremiumFormatPanel() {
  return (
    <div className="flex h-full flex-col justify-center px-6 sm:px-12">
      <div className="flex items-baseline justify-between gap-4">
        {["A NEW", "PREMIUM", "FORMAT"].map((w) => (
          <span key={w} className="text-2xl font-light tracking-[-0.03em] sm:text-4xl md:text-5xl" style={{ color: TEXT }}>
            {w}
          </span>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-lg text-center text-xs leading-relaxed sm:text-sm" style={{ color: MUTED }}>
        AIR is not only a new generation of offices but also a strong architectural statement.
      </p>
    </div>
  );
}

function TwistPanel() {
  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-2">
      <div className="relative min-h-[40vh] md:min-h-0" style={{ background: `linear-gradient(180deg, ${SKY_TOP}, ${SKY_BOTTOM})` }}>
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-0">
          {[0.7, 1, 0.85].map((s, i) => (
            <div key={i} className="w-1/4 rounded-t-sm opacity-90" style={{ height: `${40 + i * 18}%`, background: "linear-gradient(180deg, #b8d0e8, #7a9cbc)", transform: `scaleX(${s})` }} />
          ))}
        </div>
      </div>
      <div className="flex items-center px-8 py-10 md:px-12">
        <p className="text-xs leading-relaxed tracking-wide sm:text-sm" style={{ color: MUTED }}>
          Three towers ranging from 14 to 34 floors reflect the dynamic character of office life through their expressive forms.
        </p>
      </div>
    </div>
  );
}

export default function AirBusinessCenterFloors() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(p);
  }, []);

  const st = sceneState(progress);
  const towerPanelY = lerp(108, 0, easeInOutCubic(st.towerRise));
  const showIntroStairs = st.stairsIntroOpacity > 0.02 || (st.spread > 0.45 && st.towerRise < 1);
  const showFinaleStairs = st.finaleRise > 0.02;

  return (
    <LabStickyScroll onProgress={handleProgress} scrollHeightVh={SCROLL_VH} stickyClassName="text-[#111]" hint={locale === "ko" ? "↓ 스크롤" : "↓ Scroll"} showProgress={false}>
      <div className="relative h-full w-full overflow-hidden" style={{ background: BG }}>
        {showIntroStairs ? (
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              opacity: st.stairsIntroOpacity,
              filter: `brightness(${1 + st.stairsIntroOpacity * 0.12 + st.exposureWash * 2.2}) contrast(${lerp(0.88, 1, 1 - st.exposureWash)})`,
            }}
          >
            <Canvas className="absolute inset-0" camera={{ position: [0.9, 0.15, 6.8], fov: 34 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
              <StairsScene progressRef={progressRef} />
            </Canvas>
            <StairsBloomOverlay opacity={st.stairsIntroOpacity} />
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-x-0 z-20 overflow-hidden"
          style={{ top: 0, bottom: 0, transform: `translateY(${towerPanelY}%)` }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_BOTTOM} 55%, ${BG} 100%)` }} />
          <Canvas className="absolute inset-0" camera={{ position: [1.8, 0.4, 5.5], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} frameloop={st.towerRise > 0.02 ? "always" : "never"}>
            <HeroTowerScene />
          </Canvas>
        </div>

        <SlidePanel rise={st.towersRise} zIndex={30}>
          <div className="relative h-full w-full">
            <Canvas
              className="absolute inset-0"
              camera={{ position: [0, 1.4, 6.2], fov: 36 }}
              dpr={[1, 1.5]}
              frameloop={st.towersRise > 0.1 ? "always" : "never"}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                pointerRef.current = {
                  x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                  y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
                };
              }}
            >
              <TowersScene progressRef={progressRef} pointerRef={pointerRef} />
            </Canvas>
            <div className="absolute inset-x-0 bottom-0 px-8 pb-12 sm:px-12">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>Three towers</p>
              <h2 className="mt-2 text-xl font-light sm:text-3xl" style={{ color: TEXT }}>The momentum to rise higher</h2>
            </div>
          </div>
        </SlidePanel>

        <SlidePanel rise={st.momentumRise} zIndex={35}>
          <div className="h-full" style={{ background: BG }}>
            <EditorialBlock
              title="The momentum to rise higher"
              body="AIR is a new generation of offices that brings a new level of premium quality and style to Class A business real estate."
              align="center"
            />
          </div>
        </SlidePanel>

        <SlidePanel rise={st.premiumRise} zIndex={40}>
          <div className="h-full" style={{ background: BG }}>
            <PremiumFormatPanel />
          </div>
        </SlidePanel>

        <SlidePanel rise={st.lobbyRise} zIndex={45}>
          <div className="h-full" style={{ background: BG }}>
            <EditorialBlock
              title="An intelligent harmony"
              body="Efficient layouts and premium infrastructure, panoramic glazing and impressive views, luxurious lobbies set a new benchmark."
              align="split"
            />
          </div>
        </SlidePanel>

        <SlidePanel rise={st.twistRise} zIndex={50}>
          <div className="h-full" style={{ background: BG }}>
            <TwistPanel />
          </div>
        </SlidePanel>

        <SlidePanel rise={st.finaleRise} zIndex={55}>
          <div
            className="relative h-full w-full"
            style={{ opacity: st.stairsFinaleOpacity, filter: `brightness(${1 + st.stairsFinaleOpacity * 0.18})` }}
          >
            <Canvas className="absolute inset-0" camera={{ position: [0.2, 0.1, 9.5], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }} frameloop={showFinaleStairs ? "always" : "never"}>
              <StairsScene progressRef={progressRef} vertical />
            </Canvas>
            <StairsBloomOverlay opacity={st.stairsFinaleOpacity} />
            <div className="absolute inset-y-0 right-8 flex max-w-xs items-center md:right-14">
              <p className="text-xs leading-relaxed tracking-wide sm:text-sm" style={{ color: MUTED }}>
                The smooth rotation of the facades around a central axis adds movement and energy to the overall silhouette.
              </p>
            </div>
          </div>
        </SlidePanel>

        <AirTypography
          enter={st.enter}
          spreadAmt={st.spreadAmt}
          gather={st.gather}
          opacity={st.typoOpacity}
          headerLocked={st.headerLocked}
        />
        <ExposureWash opacity={st.exposureWash} />
        <AirHeader visible={st.headerLocked} />
      </div>
    </LabStickyScroll>
  );
}
