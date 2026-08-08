"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const TRACK_LENGTH = 64;
const MARKER_COUNT = 18;
const TRIGGER_TOTAL = 108;

const SPRINT_SECTIONS = [
  { num: "01", title: "Agentic Stack", kicker: "Your business has a new co-founder" },
  { num: "02", title: "International Payments", kicker: "Local experience, global reach" },
  { num: "03", title: "Payment Gateway", kicker: "Engineered for performance" },
  { num: "04", title: "D2C", kicker: "Connected commerce system" },
  { num: "05", title: "For Marketers", kicker: "Payment intelligence across lifecycle" },
  { num: "06", title: "Business Banking", kicker: "Autonomous finance" },
] as const;

function ShoeRunner() {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <mesh position={[0, -0.12, 0.08]} castShadow>
        <boxGeometry args={[0.52, 0.1, 0.95]} />
        <meshStandardMaterial color="#0039ff" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.08, -0.02]} castShadow>
        <boxGeometry args={[0.48, 0.28, 0.62]} />
        <meshStandardMaterial color="#0039ff" roughness={0.28} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.14, 0.32]} castShadow>
        <boxGeometry args={[0.42, 0.22, 0.28]} />
        <meshStandardMaterial color="#0039ff" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, -0.22]} castShadow>
        <sphereGeometry args={[0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#0039ff" roughness={0.25} />
      </mesh>
    </group>
  );
}

function TrackMarker({
  index,
  z,
  progressRef,
}: {
  index: number;
  z: number;
  progressRef: React.RefObject<number>;
}) {
  const leftRef = useRef<Mesh>(null!);
  const rightRef = useRef<Mesh>(null!);
  const threshold = (index + 1) / MARKER_COUNT;

  useFrame(() => {
    const passed = progressRef.current >= threshold - 0.015;
    const pulse = passed ? 0.85 + Math.sin(Date.now() * 0.012 + index) * 0.15 : 0.35;
    const color = passed ? new THREE.Color("#ffffff") : new THREE.Color("#0039ff");

    [leftRef, rightRef].forEach((ref) => {
      const mat = ref.current?.material as THREE.MeshStandardMaterial | undefined;
      if (!mat) return;
      mat.color.copy(color);
      mat.emissive.set(passed ? "#0039ff" : "#000000");
      mat.emissiveIntensity = passed ? 0.45 * pulse : 0;
    });
  });

  return (
    <group position={[0, 0, z]}>
      <mesh ref={leftRef} position={[-1.55, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 0.9]} />
        <meshStandardMaterial color="#0039ff" />
      </mesh>
      <mesh ref={rightRef} position={[1.55, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 0.9]} />
        <meshStandardMaterial color="#0039ff" />
      </mesh>
    </group>
  );
}

function TrackScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const runnerRef = useRef<Group>(null!);
  const cameraTargetZ = useRef(0);

  useFrame(({ camera, clock }) => {
    const progress = progressRef.current;
    const targetZ = -progress * TRACK_LENGTH;
    cameraTargetZ.current += (targetZ - cameraTargetZ.current) * 0.1;

    if (runnerRef.current) {
      const bob = Math.sin(clock.elapsedTime * 8) * 0.05;
      const stride = Math.sin(clock.elapsedTime * 8) * 0.12;
      runnerRef.current.position.z = targetZ;
      runnerRef.current.position.y = 0.42 + Math.abs(bob);
      runnerRef.current.rotation.x = stride * 0.25;
    }

    camera.position.z = cameraTargetZ.current + 4.2;
    camera.position.y = 1.75;
    camera.lookAt(0, 0.55, cameraTargetZ.current - 2);
  });

  const markers = Array.from({ length: MARKER_COUNT }, (_, i) => {
    const z = -((i + 1) / MARKER_COUNT) * TRACK_LENGTH;
    return (
      <TrackMarker key={i} index={i} z={z} progressRef={progressRef} />
    );
  });

  return (
    <>
      <color attach="background" args={["#151515"]} />
      <fog attach="fog" args={["#151515", 8, 22]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 4]} intensity={1.15} color="#ffffff" />
      <pointLight position={[-2, 3, 2]} intensity={0.35} color="#0039ff" />

      <mesh position={[0, 0, -TRACK_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, TRACK_LENGTH + 16]} />
        <meshStandardMaterial color="#151515" />
      </mesh>

      <mesh position={[0, 0.01, -TRACK_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, TRACK_LENGTH + 16]} />
        <meshStandardMaterial color="#0039ff" emissive="#0039ff" emissiveIntensity={0.25} />
      </mesh>

      {markers}

      <group ref={runnerRef} position={[0, 0.42, 0]}>
        <ShoeRunner />
      </group>
    </>
  );
}

export default function RazorpaySprintTrack() {
  const progressRef = useRef(0);
  const [triggerCount, setTriggerCount] = useState(0);
  const [percent, setPercent] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);

  const handleProgress = (p: number) => {
    progressRef.current = p;
    setTriggerCount(Math.min(TRIGGER_TOTAL, Math.floor(p * TRIGGER_TOTAL) + 1));
    setPercent(Math.round(p * 100));
    setSectionIndex(Math.min(SPRINT_SECTIONS.length - 1, Math.floor(p * SPRINT_SECTIONS.length)));
  };

  const section = SPRINT_SECTIONS[sectionIndex];
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#151515] text-white"
      hint={locale === "ko" ? "↓ 스크롤 — 화면 고정, 신발 오브제가 트랙을 따라 전진합니다" : "↓ Scroll — view pins, shoe object advances along the track"}
      showProgress={false}
    >
      <Canvas camera={{ position: [0, 1.75, 4.2], fov: 48 }} dpr={[1, 2]}>
        <TrackScene progressRef={progressRef} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-14 z-10 px-8 sm:px-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#0039ff]">
          Sprint 2026 · {section.num}
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight sm:text-4xl">
          {section.title}
        </h2>
        <p className="mt-2 text-sm text-white/45">{section.kicker}</p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/45">
            Triggers Fired
          </p>
          <p className="text-3xl font-bold tabular-nums text-white">
            {triggerCount}
            <span className="text-base font-normal text-white/40"> / {TRIGGER_TOTAL}+</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/45">
            Journey Progress
          </p>
          <p className="text-3xl font-bold tabular-nums text-[#0039ff]">{percent}%</p>
        </div>
      </div>
    </LabStickyScroll>
  );
}
