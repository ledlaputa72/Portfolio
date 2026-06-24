"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useIrisAudio } from "./useIrisAudio";

const PHASES = [
  { id: "silence", label: "Silence", sub: "Press to break the silence" },
  { id: "pulse", label: "Pulse", sub: "Rhythm enters the visual field" },
  { id: "waveform", label: "Waveform", sub: "Frequency drives the canvas" },
  { id: "resonance", label: "Resonance", sub: "Particles carry the melody" },
] as const;

const BAR_COUNT = 72;
const PARTICLE_COUNT = 320;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function WaveformBars({
  freqGetter,
  ampRef,
  barGeometry,
}: {
  freqGetter: () => Uint8Array | null;
  ampRef: React.RefObject<number>;
  barGeometry: THREE.BoxGeometry;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const freq = freqGetter();
    const amp = ampRef.current;
    const t = clock.elapsedTime;

    for (let i = 0; i < BAR_COUNT; i++) {
      const x = (i / (BAR_COUNT - 1) - 0.5) * 7.2;
      let h = 0.04;

      if (freq) {
        const bin = Math.floor((i / BAR_COUNT) * freq.length * 0.6);
        h = (freq[bin] / 255) * amp * 2.4 + 0.04;
      } else {
        h = (Math.sin(i * 0.35 + t * 1.8) * 0.5 + 0.5) * 0.12 * amp + 0.03;
      }

      dummy.position.set(x, h * 0.5 - 1.2, 0);
      dummy.scale.set(0.06, h, 0.06);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[barGeometry, undefined, BAR_COUNT]}>
      <meshBasicMaterial color="#efefef" transparent opacity={0.85} />
    </instancedMesh>
  );
}

function WaveformCurve({
  freqGetter,
  ampRef,
}: {
  freqGetter: () => Uint8Array | null;
  ampRef: React.RefObject<number>;
}) {
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(96 * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    });
    return new THREE.Line(geometry, material);
  }, []);

  useFrame(({ clock }) => {
    const freq = freqGetter();
    const amp = ampRef.current;
    const t = clock.elapsedTime;
    const pos = lineObj.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < 96; i++) {
      let y = 0;
      if (freq) {
        const bin = Math.floor((i / 96) * freq.length * 0.55);
        y = (freq[bin] / 255) * amp * 1.8;
      } else {
        y = Math.sin(i * 0.25 + t * 2) * 0.15 * amp;
      }
      pos.setXYZ(i, (i / 95 - 0.5) * 8, y + 0.6, -0.5);
    }
    pos.needsUpdate = true;
  });

  return <primitive object={lineObj} />;
}

function SoftParticles({
  freqGetter,
  ampRef,
  scrollRef,
}: {
  freqGetter: () => Uint8Array | null;
  ampRef: React.RefObject<number>;
  scrollRef: React.RefObject<number>;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => {
    const v = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      v[i] = 0.002 + Math.random() * 0.006;
    }
    return v;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const freq = freqGetter();
    const amp = ampRef.current;
    const scroll = scrollRef.current;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;

    let energy = 0.3 + scroll * 0.7;
    if (freq) {
      let sum = 0;
      for (let i = 0; i < 16; i++) sum += freq[i];
      energy += (sum / 16 / 255) * amp;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      pos[ix] += Math.sin(t * 0.4 + i) * velocities[i] * energy;
      pos[ix + 1] += velocities[i] * energy * 1.4;
      pos[ix + 2] += Math.cos(t * 0.3 + i * 0.5) * velocities[i] * 0.5;

      if (pos[ix + 1] > 5) pos[ix + 1] = -4;
      if (pos[ix] > 8) pos[ix] = -8;
      if (pos[ix] < -8) pos[ix] = 8;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#efefef"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function StaffLines({ opacityRef }: { opacityRef: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const lines = [-0.2, 0, 0.2, 0.4, 0.6];

  useFrame(() => {
    if (!groupRef.current) return;
    const o = opacityRef.current;
    groupRef.current.visible = o > 0.02;
    groupRef.current.scale.setScalar(Math.max(0.001, o));
  });

  return (
    <group ref={groupRef} position={[0, 1.8, -1]} visible={false}>
      {lines.map((y) => (
        <Line
          key={y}
          points={[
            [-3.5, y, 0],
            [3.5, y, 0],
          ]}
          color="#efefef"
          transparent
          opacity={0.2}
          lineWidth={1}
        />
      ))}
      {[ -2, -0.5, 1, 2.2 ].map((x, i) => (
        <mesh key={x} position={[x, 0.1 + (i % 2) * 0.2, 0.01]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function IrisScene({
  freqGetter,
  ampRef,
  scrollRef,
  staffOpacityRef,
}: {
  freqGetter: () => Uint8Array | null;
  ampRef: React.RefObject<number>;
  scrollRef: React.RefObject<number>;
  staffOpacityRef: React.RefObject<number>;
}) {
  const barGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <>
      <color attach="background" args={["#101010"]} />
      <fog attach="fog" args={["#101010", 5, 16]} />
      <ambientLight intensity={0.15} />
      <SoftParticles freqGetter={freqGetter} ampRef={ampRef} scrollRef={scrollRef} />
      <WaveformBars freqGetter={freqGetter} ampRef={ampRef} barGeometry={barGeometry} />
      <WaveformCurve freqGetter={freqGetter} ampRef={ampRef} />
      <StaffLines opacityRef={staffOpacityRef} />
    </>
  );
}

export default function IrisKWaveform() {
  const progressRef = useRef(0);
  const ampRef = useRef(0.15);
  const staffOpacityRef = useRef(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [silenceBroken, setSilenceBroken] = useState(false);
  const [muted, setMuted] = useState(false);
  const { start, toggleMute, getFrequencyData, isPlaying } = useIrisAudio();

  const breakSilence = useCallback(() => {
    if (!silenceBroken) {
      start();
      setSilenceBroken(true);
    }
  }, [silenceBroken, start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        breakSilence();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [breakSilence]);

  const handleProgress = (p: number) => {
    progressRef.current = p;

    const idx = Math.min(3, Math.floor(p * 4));
    setPhaseIndex(idx);

    const audioBoost = isPlaying() ? 1 : 0.45;
    ampRef.current = lerp(0.1, 1.15, p) * audioBoost;

    if (p < 0.25) staffOpacityRef.current = 0;
    else if (p < 0.55) staffOpacityRef.current = (p - 0.25) / 0.3;
    else if (p < 0.85) staffOpacityRef.current = 1;
    else staffOpacityRef.current = lerp(1, 0.2, (p - 0.85) / 0.15);
  };

  const handleMute = () => {
    toggleMute();
    setMuted((m) => !m);
  };

  const phase = PHASES[phaseIndex];

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#101010] text-[#efefef]"
      hint="↓ 스크롤 — 화면 고정, 파형·파티클이 진행됩니다"
      progressLabel="Movement"
    >
      <Canvas camera={{ position: [0, 0.5, 6], fov: 42 }} dpr={[1, 2]}>
        <IrisScene
          freqGetter={getFrequencyData}
          ampRef={ampRef}
          scrollRef={progressRef}
          staffOpacityRef={staffOpacityRef}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-10">
        <p className="text-center text-[10px] uppercase tracking-[0.45em] text-[#efefef]/40">
          Composer · Violinist · Iris K
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 px-8 sm:px-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#efefef]/35">
          {phase.label}
        </p>
        <p className="mt-1 max-w-sm text-sm text-[#efefef]/55">{phase.sub}</p>
      </div>

      {!silenceBroken ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#101010]/92 backdrop-blur-sm">
          <button
            type="button"
            onClick={breakSilence}
            className="group flex flex-col items-center gap-6 transition-transform hover:scale-[1.02]"
          >
            <span className="rounded-full border border-[#efefef]/25 px-8 py-3 text-[10px] uppercase tracking-[0.4em] text-[#efefef]/70 transition-colors group-hover:border-[#efefef]/50 group-hover:text-[#efefef]">
              Break the Silence
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#efefef]/30">
              Press any button
            </span>
          </button>
          <p className="mt-12 text-[10px] text-[#efefef]/25">
            For the best experience, use headphones.
          </p>
        </div>
      ) : null}

      {silenceBroken ? (
        <button
          type="button"
          onClick={handleMute}
          className="absolute bottom-6 left-6 z-20 rounded-full border border-[#efefef]/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-[#efefef]/50 transition-colors hover:border-[#efefef]/40 hover:text-[#efefef]/80"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      ) : null}
    </LabStickyScroll>
  );
}
