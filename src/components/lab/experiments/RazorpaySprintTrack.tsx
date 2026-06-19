"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TRACK_LENGTH = 60;
const MARKER_COUNT = 12;

function TrackScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const runnerRef = useRef<Group>(null!);
  const cameraTargetZ = useRef(0);

  useFrame(({ camera, clock }) => {
    const progress = progressRef.current;
    const targetZ = -progress * TRACK_LENGTH;
    cameraTargetZ.current += (targetZ - cameraTargetZ.current) * 0.1;

    if (runnerRef.current) {
      const bob = Math.sin(clock.elapsedTime * 9) * 0.06;
      const stride = Math.sin(clock.elapsedTime * 9) * 0.15;
      runnerRef.current.position.z = targetZ;
      runnerRef.current.position.y = 0.5 + Math.abs(bob);
      runnerRef.current.rotation.x = stride * 0.3;
    }

    camera.position.z = cameraTargetZ.current + 4;
    camera.position.y = 1.8;
    camera.lookAt(0, 0.6, cameraTargetZ.current - 2);
  });

  const markers = Array.from({ length: MARKER_COUNT }, (_, i) => {
    const z = -(i + 1) * (TRACK_LENGTH / MARKER_COUNT);
    return (
      <group key={i} position={[0, 0, z]}>
        <mesh position={[-1.6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 1]} />
          <meshStandardMaterial color="#0039ff" />
        </mesh>
        <mesh position={[1.6, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 1]} />
          <meshStandardMaterial color="#0039ff" />
        </mesh>
      </group>
    );
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 3]} intensity={1.1} />

      <mesh
        position={[0, 0, -TRACK_LENGTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[4, TRACK_LENGTH + 20]} />
        <meshStandardMaterial color="#151515" />
      </mesh>

      {markers}

      <group ref={runnerRef} position={[0, 0.5, 0]}>
        <mesh>
          <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
          <meshStandardMaterial color="#0039ff" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
    </>
  );
}

export default function RazorpaySprintTrack() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [distance, setDistance] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setDistance(Math.round(self.progress * 400));
        setPercent(Math.round(self.progress * 100));
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div ref={triggerRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#151515]">
        <Canvas camera={{ position: [0, 1.8, 4], fov: 50 }} dpr={[1, 2]}>
          <TrackScene progressRef={progressRef} />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">
              Trigger Distance
            </p>
            <p className="text-3xl font-bold text-white">
              {distance}<span className="text-base text-white/60"> pt</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Scroll Progress
            </p>
            <p className="text-3xl font-bold text-[#0039ff]">{percent}%</p>
          </div>
        </div>

        <div className="pointer-events-none absolute left-6 top-6 text-xs text-white/50">
          스크롤하면 쇼퍼의 여정을 따라 오브제가 전진합니다 ↓
        </div>
      </div>
    </div>
  );
}
