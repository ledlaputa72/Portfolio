"use client";

import { useCallback, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";

const DEEP = "#050d1a";
const CYAN = "#00d4ff";
const AQUA = "#4de8ff";

const SECTIONS = [
  {
    id: "hero",
    start: 0,
    end: 0.28,
    kicker: "Pre-Trade Energy",
    title: "HYDROFLOW",
    sub: "Tokenizing hydration — pure, refreshing, blockchain-powered.",
  },
  {
    id: "product",
    start: 0.28,
    end: 0.52,
    kicker: "Solana Splash",
    title: "330ML",
    sub: "Zero sugar. Caffeine, magnesium citrate, natural flavor.",
  },
  {
    id: "about",
    start: 0.52,
    end: 0.78,
    kicker: "Introduction",
    title: "WATER MEETS INNOVATION",
    sub: "Each sip is clean, invigorating, and tokenized for a brighter future.",
  },
  {
    id: "cta",
    start: 0.78,
    end: 1,
    kicker: "Join the flow",
    title: "SCAN IT, TRADE IT",
    sub: "Become part of our hood — refresh your life. Redefine the future.",
  },
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
uniform float uFill;
varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float wave = sin(p.x * 4.0 + uTime * 0.8) * 0.04
    + sin(p.x * 7.0 - uTime * 1.1) * 0.02;
  float surface = 0.15 + wave + uFill * 0.55;
  float depth = smoothstep(surface - 0.08, surface + 0.02, p.y);

  vec3 deep = vec3(0.02, 0.05, 0.12);
  vec3 aqua = vec3(0.0, 0.83, 1.0);
  vec3 glow = vec3(0.3, 0.91, 1.0);

  vec3 col = mix(deep, mix(aqua, glow, 0.35 + sin(uTime + p.x * 3.0) * 0.1), depth);
  col += glow * (1.0 - depth) * 0.08 * (1.0 + uFill * 0.5);

  gl_FragColor = vec4(col, 1.0);
}
`;

function sectionOpacity(progress: number, start: number, end: number, fade = 0.14) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function FluidBackdrop({
  fillRef,
  timeRef,
}: {
  fillRef: React.RefObject<number>;
  timeRef: React.RefObject<number>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uFill: { value: 0 },
  }).current;

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    timeRef.current = clock.elapsedTime;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uFill.value = fillRef.current;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, -2]}>
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

function HydroBottle({
  fillRef,
  progressRef,
  pointerRef,
}: {
  fillRef: React.RefObject<number>;
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<Group>(null!);
  const liquidRef = useRef<Mesh>(null!);
  const liquidMatRef = useRef<THREE.MeshPhysicalMaterial>(null!);

  const liquidHeight = 1.05;
  const baseY = -0.55;

  useFrame((state) => {
    if (!groupRef.current || !liquidRef.current) return;
    const fill = fillRef.current;
    const { x, y } = pointerRef.current;
    const p = progressRef.current;

    groupRef.current.rotation.y = x * 0.45 + p * Math.PI * 0.35;
    groupRef.current.rotation.x = y * 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;

    const h = Math.max(0.02, fill * liquidHeight);
    liquidRef.current.scale.y = h / liquidHeight;
    liquidRef.current.position.y = baseY + h * 0.5;

    if (liquidMatRef.current) {
      liquidMatRef.current.emissiveIntensity = 0.15 + fill * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 1.35, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          thickness={0.5}
          roughness={0.05}
          metalness={0.05}
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.22, 32]} />
        <meshPhysicalMaterial color="#e8f4ff" transmission={0.7} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#b8d4e8" metalness={0.4} roughness={0.3} />
      </mesh>

      <mesh ref={liquidRef} position={[0, baseY + liquidHeight * 0.5, 0]}>
        <cylinderGeometry args={[0.36, 0.4, liquidHeight, 48]} />
        <meshPhysicalMaterial
          ref={liquidMatRef}
          color={CYAN}
          emissive={AQUA}
          emissiveIntensity={0.2}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      <mesh position={[0, baseY + 0.02, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.04, 48]} />
        <meshStandardMaterial color="#1a3a4a" roughness={0.6} />
      </mesh>
    </group>
  );
}

function HydroScene({
  fillRef,
  progressRef,
  pointerRef,
  timeRef,
}: {
  fillRef: React.RefObject<number>;
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  timeRef: React.RefObject<number>;
}) {
  return (
    <>
      <color attach="background" args={[DEEP]} />
      <fog attach="fog" args={[DEEP, 4, 12]} />
      <ambientLight intensity={0.5} color="#a8e8ff" />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-2, 1, 3]} intensity={0.6} color={CYAN} />
      <FluidBackdrop fillRef={fillRef} timeRef={timeRef} />
      <HydroBottle fillRef={fillRef} progressRef={progressRef} pointerRef={pointerRef} />
    </>
  );
}

export default function HydroflowFill() {
  const progressRef = useRef(0);
  const fillRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [fillPct, setFillPct] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));

    const fill = Math.max(0, Math.min(1, (p - 0.08) / 0.72));
    fillRef.current = fill;
    setFillPct(Math.round(fill * 100));

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
  }, []);

  const p = progress / 100;
  const section = SECTIONS[sectionIndex];

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={450}
      stickyClassName="text-white"
      hint="↓ 스크롤 — 병 액체 채움 · 유체 배경"
      showProgress={false}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: DEEP }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }}
      >
        <Canvas className="absolute inset-0" camera={{ position: [0, 0.1, 4.5], fov: 40 }} dpr={[1, 2]}>
          <HydroScene
            fillRef={fillRef}
            progressRef={progressRef}
            pointerRef={pointerRef}
            timeRef={timeRef}
          />
        </Canvas>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-10 sm:px-12">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: AQUA }}>
              Hydroflow
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              Rotate bottle
            </span>
          </div>

          <div className="relative min-h-[200px]">
            {SECTIONS.map((s) => {
              const opacity = sectionOpacity(p, s.start, s.end);
              if (opacity <= 0.01) return null;
              return (
                <div
                  key={s.id}
                  className="absolute inset-x-0 bottom-0 max-w-lg"
                  style={{ opacity, transform: `translateY(${(1 - opacity) * 20}px)` }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: CYAN }}>
                    {s.kicker}
                  </p>
                  <h2 className="mt-2 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
                    {s.title}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">{s.sub}</p>
                  {s.id === "cta" ? (
                    <span
                      className="mt-6 inline-block rounded-full border px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ borderColor: `${CYAN}66`, color: AQUA }}
                    >
                      Scan QR →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/35">Fill level</p>
              <p className="font-mono text-3xl font-bold tabular-nums" style={{ color: CYAN }}>
                {fillPct}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/35">{section.kicker}</p>
              <p className="font-mono text-lg tabular-nums text-white/60">{progress}%</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
          {SECTIONS.map((s, i) => (
            <span
              key={s.id}
              className="h-1 w-1 rounded-full transition-colors"
              style={{
                background: i === sectionIndex ? CYAN : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </LabStickyScroll>
  );
}
