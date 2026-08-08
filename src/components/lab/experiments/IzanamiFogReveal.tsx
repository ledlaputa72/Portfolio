"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const PRACTICES = [
  {
    id: "school",
    num: "01",
    title: "School",
    kicker: "Nurturing the foundations of life",
    body: "Mama School — where the wishes of parent and child are gently met.",
  },
  {
    id: "craft",
    num: "02",
    title: "Craft",
    kicker: "Awakening the senses through Japanese aesthetics",
    body: "Objects and spaces of quiet refinement — rooted in the spirit of harmony.",
  },
  {
    id: "retreat",
    num: "03",
    title: "Retreat",
    kicker: "Returning to your essence",
    body: "Private ceremonies for a return to one's original senses and way of being.",
  },
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function visibilityForSection(sectionIndex: number, progress: number) {
  const center = (sectionIndex + 0.5) / 3;
  const dist = Math.abs(progress - center) * 3;
  return Math.max(0, 1 - dist * 1.15);
}

function SchoolObject({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null!);
  useFrame(() => {
    const v = visibilityForSection(0, progressRef.current);
    if (groupRef.current) groupRef.current.scale.setScalar(Math.max(0.001, v * 1.1));
  });
  return (
    <group ref={groupRef}>
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.35}>
      <group>
        <mesh>
          <torusGeometry args={[0.75, 0.06, 32, 64]} />
          <meshStandardMaterial color="#b8aea2" roughness={0.65} metalness={0.05} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 48]} />
          <meshStandardMaterial color="#d4ccc2" roughness={0.8} transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
    </group>
  );
}

function CraftObject({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null!);
  useFrame(() => {
    const v = visibilityForSection(1, progressRef.current);
    if (groupRef.current) groupRef.current.scale.setScalar(Math.max(0.001, v * 1.05));
  });
  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
    <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.4}>
      <group>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.32, 0.42, 0.55, 32]} />
          <meshStandardMaterial color="#a89f94" roughness={0.55} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.48, 0.38, 0.25, 32]} />
          <meshStandardMaterial color="#8f8578" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.5, 0.52, 0.18, 32]} />
          <meshStandardMaterial color="#7a7168" roughness={0.7} />
        </mesh>
      </group>
    </Float>
    </group>
  );
}

function RetreatObject({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<Group>(null!);
  useFrame(() => {
    const v = visibilityForSection(2, progressRef.current);
    if (groupRef.current) groupRef.current.scale.setScalar(Math.max(0.001, v));
  });
  return (
    <group ref={groupRef}>
    <Float speed={0.5} rotationIntensity={0.12} floatIntensity={0.3}>
      <group>
        <mesh position={[0, -0.15, 0]} scale={[1.4, 0.45, 1]}>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#9a9188" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.15, 0.35, 0.1]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#6b7a62" roughness={0.7} />
        </mesh>
        <mesh position={[-0.2, 0.28, -0.05]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#7d8b72" roughness={0.75} />
        </mesh>
      </group>
    </Float>
    </group>
  );
}

function FogGradingPlane({ densityRef }: { densityRef: React.RefObject<number> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();

  const uniforms = useRef({
    uDensity: { value: 0.6 },
    uTime: { value: 0 },
  }).current;

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uDensity.value = densityRef.current;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    uniform float uDensity;
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      float n = hash(uv * 120.0 + uTime * 0.02) * 0.04;
      vec3 mist = vec3(0.92, 0.89, 0.84);
      float vignette = smoothstep(0.85, 0.2, length(uv - 0.5) * 1.2);
      float alpha = uDensity * vignette * (0.55 + n);
      gl_FragColor = vec4(mist, alpha);
    }
  `;

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 2]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function IzanamiWorld({
  progressRef,
  fogDensityRef,
}: {
  progressRef: React.RefObject<number>;
  fogDensityRef: React.RefObject<number>;
}) {
  const groupRef = useRef<Group>(null!);
  const { pointer } = useThree();
  const vis = useRef([0, 0, 0]);

  useFrame(() => {
    const p = progressRef.current;
    vis.current[0] = visibilityForSection(0, p);
    vis.current[1] = visibilityForSection(1, p);
    vis.current[2] = visibilityForSection(2, p);

    const maxVis = Math.max(...vis.current);
    const local = (p * 3) % 1;
    const edgeFog = Math.min(local / 0.18, (1 - local) / 0.18, 1);
    fogDensityRef.current = lerp(0.75, 0.08, maxVis * edgeFog);

    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.18 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (pointer.y * 0.08 - groupRef.current.rotation.x) * 0.03;
    }
  });

  return (
    <>
      <color attach="background" args={["#ebe6dc"]} />
      <fog attach="fog" args={["#ebe6dc", 4, 14]} />
      <ambientLight intensity={0.65} color="#fff8f0" />
      <directionalLight position={[2, 4, 3]} intensity={0.85} color="#fff5eb" />
      <directionalLight position={[-3, 1, -2]} intensity={0.25} color="#c4b8a8" />

      <group ref={groupRef}>
        <group position={[-0.3, 0, 0]}>
          <SchoolObject progressRef={progressRef} />
        </group>
        <group position={[0.35, 0.1, -0.5]}>
          <CraftObject progressRef={progressRef} />
        </group>
        <group position={[-0.15, -0.1, 0.4]}>
          <RetreatObject progressRef={progressRef} />
        </group>
      </group>

      <FogGradingPlane densityRef={fogDensityRef} />
    </>
  );
}

export default function IzanamiFogReveal() {
  const progressRef = useRef(0);
  const fogDensityRef = useRef(0.7);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [fogPercent, setFogPercent] = useState(70);

  const handleProgress = (p: number) => {
    progressRef.current = p;
    const idx = Math.min(2, Math.floor(p * 3 + 0.001));
    setSectionIndex(idx);
    setFogPercent(Math.round(fogDensityRef.current * 100));
  };

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setFogPercent(Math.round(fogDensityRef.current * 100));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const practice = PRACTICES[sectionIndex];
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#ebe6dc] text-[#1c1917]"
      hint={locale === "ko" ? "↓ 스크롤 — 화면 고정, 안개가 걷히며 practice가 드러납니다" : "↓ Scroll — view pins, fog clears to reveal practices"}
      progressLabel="Harmony"
    >
      <Canvas camera={{ position: [0, 0.2, 5], fov: 42 }} dpr={[1, 2]}>
        <IzanamiWorld progressRef={progressRef} fogDensityRef={fogDensityRef} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-8 pt-10 sm:px-12">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#1c1917]/35">
          Izanami
        </span>
        <span className="font-serif text-lg text-[#1c1917]/25">和</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 px-8 sm:px-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#8b7355]">
          {practice.num} · {practice.title}
        </p>
        <h2 className="mt-2 max-w-lg font-serif text-2xl font-light tracking-tight sm:text-4xl">
          {practice.kicker}
        </h2>
        <p className="mt-3 max-w-sm text-sm text-[#1c1917]/50">{practice.body}</p>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-8 sm:left-12">
        <p className="text-[10px] uppercase tracking-widest text-[#1c1917]/35">Mist</p>
        <p className="font-serif text-2xl tabular-nums text-[#1c1917]/70">{fogPercent}%</p>
      </div>
    </LabStickyScroll>
  );
}
