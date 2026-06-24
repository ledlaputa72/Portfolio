"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Mesh, Points, ShaderMaterial } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";

const BG = "#050a14";
const GLOW = "#e8f4ff";
const BLUE = "#9bb8e1";
const BLUE_DEEP = "#2c4e73";
const SHARD = "#1a2838";

const PHASE = {
  heroEnd: 0.16,
  manifestoEnd: 0.36,
  investorsEnd: 0.58,
  teamEnd: 0.8,
} as const;

const SECTIONS = [
  {
    id: "hero",
    num: null,
    start: 0,
    end: PHASE.heroEnd,
    title: "The next wave of venture capital",
    body: null,
    cta: "Scroll down to discover more",
    titlePos: "bottom-left" as const,
  },
  {
    id: "manifesto",
    num: "//01",
    label: "Manifesto",
    start: PHASE.heroEnd,
    end: PHASE.manifestoEnd,
    title: "Capital with conviction",
    body: "Hashgraph Ventures is an early-stage VC fund at the intersection of blockchain infrastructure and AI — pre-seed through Series A. We believe decentralised infrastructure and AI-native applications will rewire how value, data, and trust move across the world.",
    titlePos: "mid-left" as const,
  },
  {
    id: "investors",
    num: "//02",
    label: "Investors",
    start: PHASE.manifestoEnd,
    end: PHASE.investorsEnd,
    titleLines: ["Early access", "permanent", "advantage"],
    body: "Hashgraph Ventures sits at the apex of a deliberate trifecta — Hashgraph Group, the Association, and Ventures as fast-moving capital. Infrastructure first. Returns follow.",
    cta: "Explore our portfolio",
    titlePos: "top-left" as const,
  },
  {
    id: "team",
    num: "//03",
    label: "Team",
    start: PHASE.investorsEnd,
    end: PHASE.teamEnd,
    title: "Experience you can build on",
    body: "No career investors. No tourists. We've been the founder who couldn't sleep. The investor who got it wrong and came back smarter. 50+ years of combined experience — forged, not assembled.",
    titlePos: "mid-left" as const,
  },
  {
    id: "footer",
    num: null,
    start: PHASE.teamEnd,
    end: 1,
    title: "Hashgraph Ventures",
    body: "AI & Blockchain Venture Capital",
    titlePos: "center" as const,
  },
] as const;

const PORTFOLIO = ["Debyt", "Rava", "100s", "Bloxtel"] as const;
const TEAM = [
  { name: "Dara Campbell", role: "Managing Partner" },
  { name: "Will Patterson", role: "Head of Venture" },
  { name: "Arjun Chirumamilla", role: "Senior Associate" },
  { name: "Jeff Sun", role: "Venture Capital Analyst" },
  { name: "Tracie Hutchins", role: "Executive Operations Manager" },
  { name: "Stefan Deiss", role: "Co-Founder" },
  { name: "Kamal Youssefi", role: "Co-Founder & Executive Chairman" },
] as const;

const SHARD_COUNT = 56;
const FIGURE_PARTICLES = 2200;
const STREAM_COUNT = 400;
const DEBRIS_COUNT = 14;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function sectionOpacityFixed(p: number, start: number, end: number, fade = 0.11) {
  const range = end - start;
  const fadeW = range * fade;
  if (p < start || p > end) return 0;
  if (p < start + fadeW) return (p - start) / fadeW;
  if (p > end - fadeW) return (end - p) / fadeW;
  return 1;
}

function diagonalPeak(p: number, boundary: number, width = 0.09) {
  if (p < boundary - width || p > boundary + width) return 0;
  const local = (p - (boundary - width)) / (width * 2);
  return Math.sin(local * Math.PI);
}

function diagonalLineY(xPercent: number, p: number) {
  const base = lerp(58, 38, smoothstep(clamp01((p - 0.1) / 0.7)));
  const sway = Math.sin(p * Math.PI * 3) * 4;
  return base + (xPercent - 50) * 0.22 + sway;
}

type ShardBody = {
  home: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
  geo: THREE.BufferGeometry;
};

function jitterGeometry(geo: THREE.BufferGeometry, amp: number) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * amp);
    pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * amp);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * amp);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function createShards(): ShardBody[] {
  return Array.from({ length: SHARD_COUNT }, () => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.35 + Math.random() * 0.55;
    const home = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * r,
      (Math.random() - 0.3) * 0.9,
      Math.sin(phi) * Math.sin(theta) * r,
    );
    const geo = jitterGeometry(
      new THREE.OctahedronGeometry(0.08 + Math.random() * 0.14, 0),
      0.06,
    );
    return {
      home,
      pos: home.clone(),
      vel: new THREE.Vector3(),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      rotVel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0),
      scale: 0.7 + Math.random() * 0.9,
      geo,
    };
  });
}

function sampleHumanoid(i: number, total: number) {
  const t = i / total;
  let x = 0;
  let y = 0;
  let z = 0;
  if (t < 0.12) {
    const u = t / 0.12;
    const a = u * Math.PI * 2;
    const rr = 0.28 * Math.sqrt(Math.random());
    x = Math.cos(a) * rr;
    y = 1.05 + Math.random() * 0.25;
    z = Math.sin(a) * rr;
  } else if (t < 0.55) {
    x = (Math.random() - 0.5) * 0.55;
    y = 0.15 + Math.random() * 0.85;
    z = (Math.random() - 0.5) * 0.35;
  } else if (t < 0.7) {
    x = -0.35 + (Math.random() - 0.5) * 0.2;
    y = 0.45 + Math.random() * 0.45;
    z = (Math.random() - 0.5) * 0.2;
  } else if (t < 0.85) {
    x = 0.35 + (Math.random() - 0.5) * 0.2;
    y = 0.45 + Math.random() * 0.45;
    z = (Math.random() - 0.5) * 0.2;
  } else {
    const leg = t < 0.925 ? -0.18 : 0.18;
    x = leg + (Math.random() - 0.5) * 0.12;
    y = -0.15 + Math.random() * 0.55;
    z = (Math.random() - 0.5) * 0.18;
  }
  return new THREE.Vector3(x, y - 0.35, z);
}

type FigureParticle = {
  home: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
};

function createFigureParticles(): FigureParticle[] {
  return Array.from({ length: FIGURE_PARTICLES }, (_, i) => {
    const home = sampleHumanoid(i, FIGURE_PARTICLES);
    return { home, pos: home.clone(), vel: new THREE.Vector3() };
  });
}

const waterVertex = /* glsl */ `
varying vec2 vUv;
varying float vElev;
uniform float uTime;
void main() {
  vUv = uv;
  vec3 p = position;
  float wave = sin(p.x * 2.2 + uTime * 0.9) * 0.06
    + sin(p.z * 1.8 + uTime * 0.7) * 0.05;
  p.y += wave;
  vElev = wave;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const waterFragment = /* glsl */ `
varying vec2 vUv;
varying float vElev;
uniform float uOpacity;
void main() {
  vec3 deep = vec3(0.02, 0.05, 0.12);
  vec3 crest = vec3(0.45, 0.62, 0.82);
  float fres = pow(1.0 - abs(vElev) * 4.0, 2.0);
  vec3 col = mix(deep, crest, fres * 0.35 + 0.08);
  gl_FragColor = vec4(col, uOpacity);
}
`;

function WaterSurface({ progressRef }: { progressRef: React.RefObject<number> }) {
  const matRef = useRef<ShaderMaterial>(null!);
  const meshRef = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const hero = 1 - smoothstep(clamp01((p - 0.06) / 0.14));
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
      matRef.current.uniforms.uOpacity.value = hero * 0.92;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2 + lerp(0, -0.32, 1 - hero);
      meshRef.current.position.y = lerp(-1.6, -2.2, p);
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    }),
    [],
  );

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
      <planeGeometry args={[28, 28, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={waterVertex}
        fragmentShader={waterFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function CrystalCluster({
  hoverRef,
  pointerRef,
  progressRef,
}: {
  hoverRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  progressRef: React.RefObject<number>;
}) {
  const shardsRef = useRef(createShards());
  const groupRef = useRef<Group>(null!);
  const coreRef = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    const h = hoverRef.current;
    const { x: px, y: py } = pointerRef.current;
    const p = progressRef.current;
    const pointerWorld = new THREE.Vector3(px * 1.8, py * 1.4 + 0.2, 0.5);

    const explode = h * 1.15 + diagonalPeak(p, PHASE.heroEnd) * 0.5;

    shardsRef.current.forEach((shard, i) => {
      const child = groupRef.current.children[i] as Mesh | undefined;
      if (!child) return;

      const toP = shard.pos.clone().sub(pointerWorld);
      const dist = toP.length() + 0.01;
      const repulse = h * Math.max(0, 2.2 - dist) * 0.22;
      const burstDir = shard.pos.clone().normalize().add(toP.normalize().multiplyScalar(repulse * 0.4));

      shard.vel.add(burstDir.multiplyScalar(explode * 0.018 + repulse * 0.04));
      shard.vel.add(shard.home.clone().sub(shard.pos).multiplyScalar(0.035));
      shard.vel.multiplyScalar(0.9);
      shard.pos.add(shard.vel);

      child.position.copy(shard.pos);
      child.rotation.x += shard.rotVel.x + h * 0.02;
      child.rotation.y += shard.rotVel.y + h * 0.015;
      child.scale.setScalar(shard.scale * (1 + explode * 0.08));

      const mat = child.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.35 + explode * 1.8 + Math.sin(clock.elapsedTime * 2 + i) * 0.08;
    });

    if (coreRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.6) * 0.06 + h * 0.12;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + h * 0.35;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.08 + p * 0.4;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08 + lerp(0.1, -0.2, p);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.15, 0]}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      {shardsRef.current.map((shard, i) => (
        <mesh key={i} geometry={shard.geo} position={shard.pos} rotation={shard.rot} scale={shard.scale}>
          <meshStandardMaterial
            color={SHARD}
            emissive={GLOW}
            emissiveIntensity={0.4}
            roughness={0.35}
            metalness={0.65}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function ParticleFigure({
  hoverRef,
  pointerRef,
  progressRef,
}: {
  hoverRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  progressRef: React.RefObject<number>;
}) {
  const ptsRef = useRef<Points>(null!);
  const partsRef = useRef(createFigureParticles());

  useFrame(() => {
    const p = progressRef.current;
    const manifesto = sectionOpacityFixed(p, PHASE.heroEnd, PHASE.investorsEnd, 0.08);
    const h = hoverRef.current;
    const { x: px, y: py } = pointerRef.current;
    const pointer = new THREE.Vector3(px * 1.5, py * 1.2, 0);

    const attr = ptsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    partsRef.current.forEach((part, i) => {
      const toP = part.pos.clone().sub(pointer);
      const dist = toP.length() + 0.01;
      const repulse = h * Math.max(0, 1.6 - dist) * 0.12;

      part.vel.add(toP.normalize().multiplyScalar(repulse));
      part.vel.add(part.home.clone().sub(part.pos).multiplyScalar(0.04));
      part.vel.multiplyScalar(0.88);
      part.pos.add(part.vel);

      const yBoost = manifesto * 0.15;
      attr.setXYZ(i, part.pos.x, part.pos.y + yBoost, part.pos.z);
    });
    attr.needsUpdate = true;

    const mat = ptsRef.current.material as THREE.PointsMaterial;
    mat.opacity = manifesto * (0.75 + h * 0.2);
    mat.size = 0.028 + h * 0.012;
  });

  const positions = useMemo(() => {
    const a = new Float32Array(FIGURE_PARTICLES * 3);
    partsRef.current.forEach((pt, i) => {
      a[i * 3] = pt.pos.x;
      a[i * 3 + 1] = pt.pos.y;
      a[i * 3 + 2] = pt.pos.z;
    });
    return a;
  }, []);

  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={FIGURE_PARTICLES} />
      </bufferGeometry>
      <pointsMaterial
        color={GLOW}
        size={0.03}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ParticleStream({ progressRef }: { progressRef: React.RefObject<number> }) {
  const ptsRef = useRef<Points>(null!);
  const dataRef = useRef(
    Array.from({ length: STREAM_COUNT }, () => ({
      x: (Math.random() - 0.5) * 0.35,
      y: 0.5 + Math.random() * 1.2,
      z: (Math.random() - 0.5) * 0.25,
      speed: 0.008 + Math.random() * 0.015,
    })),
  );

  useFrame(() => {
    const p = progressRef.current;
    const active =
      diagonalPeak(p, PHASE.heroEnd, 0.12) +
      diagonalPeak(p, PHASE.manifestoEnd, 0.1) +
      diagonalPeak(p, PHASE.investorsEnd, 0.1);
    const strength = clamp01(active);

    const attr = ptsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    dataRef.current.forEach((d, i) => {
      d.y -= d.speed * (0.5 + strength);
      if (d.y < -1.8) {
        d.y = 1.2 + Math.random() * 0.6;
        d.x = (Math.random() - 0.5) * 0.4;
      }
      attr.setXYZ(i, d.x, d.y, d.z);
    });
    attr.needsUpdate = true;
    (ptsRef.current.material as THREE.PointsMaterial).opacity = strength * 0.85;
  });

  const positions = useMemo(() => new Float32Array(STREAM_COUNT * 3), []);

  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={STREAM_COUNT} />
      </bufferGeometry>
      <pointsMaterial
        color={GLOW}
        size={0.02}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DebrisShards() {
  const groupRef = useRef<Group>(null!);
  const debris = useMemo(
    () =>
      Array.from({ length: DEBRIS_COUNT }, () => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          -2 - Math.random() * 4,
        ),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: 0.4 + Math.random() * 1.2,
        speed: 0.1 + Math.random() * 0.2,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const d = debris[i];
      child.position.y = d.pos.y + Math.sin(t * d.speed + i) * 0.15;
      child.rotation.y += 0.002;
    });
  });

  return (
    <group ref={groupRef}>
      {debris.map((d, i) => (
        <mesh key={i} position={d.pos} rotation={d.rot} scale={d.scale}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#0a1018" emissive={BLUE_DEEP} emissiveIntensity={0.15} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function VortexTunnel({ progressRef }: { progressRef: React.RefObject<number> }) {
  const meshRef = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const vortex = smoothstep(clamp01((p - 0.1) / 0.65));
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.elapsedTime * 0.04;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = vortex * 0.35;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -6]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[5, 2.5, 18, 48, 1, true]} />
      <meshStandardMaterial
        color={BLUE_DEEP}
        emissive={BLUE}
        emissiveIntensity={0.08}
        side={THREE.BackSide}
        transparent
        opacity={0}
        roughness={0.95}
      />
    </mesh>
  );
}

function HashgraphScene({
  progressRef,
  hoverRef,
  hoverTargetRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  hoverRef: React.RefObject<number>;
  hoverTargetRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }) => {
    hoverRef.current += (hoverTargetRef.current - hoverRef.current) * 0.1;

    const p = progressRef.current;
    const { x, y } = pointerRef.current;

    let camY = lerp(0.35, -0.15, smoothstep(clamp01((p - 0.12) / 0.5)));
    let camZ = lerp(6.2, 4.8, smoothstep(p));
    let lookY = lerp(0, -0.25, smoothstep(clamp01((p - 0.15) / 0.45)));

    if (p < PHASE.heroEnd) {
      camY = 0.4;
      camZ = 6.5;
      lookY = 0.05;
    } else if (p < PHASE.investorsEnd) {
      camY = -0.05 + y * 0.12;
      lookY = -0.15;
    }

    camera.position.lerp(new THREE.Vector3(x * 0.35, camY + y * 0.08, camZ + x * 0.15), 0.06);
    cameraTarget.set(x * 0.2, lookY, 0);
    camera.lookAt(cameraTarget);

    camera.rotation.z = lerp(0, -0.04, diagonalPeak(p, PHASE.heroEnd)) + clock.elapsedTime * 0.001;
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 6, 22]} />
      <ambientLight intensity={0.12} color={BLUE} />
      <pointLight position={[0, 0.5, 1.5]} intensity={2.5} color={GLOW} distance={12} />
      <pointLight position={[0, -2.5, 2]} intensity={1.8} color={GLOW} distance={14} />
      <directionalLight position={[2, 4, 3]} intensity={0.25} color={BLUE} />

      <VortexTunnel progressRef={progressRef} />
      <WaterSurface progressRef={progressRef} />
      <DebrisShards />
      <CrystalCluster hoverRef={hoverRef} pointerRef={pointerRef} progressRef={progressRef} />
      <ParticleFigure hoverRef={hoverRef} pointerRef={pointerRef} progressRef={progressRef} />
      <ParticleStream progressRef={progressRef} />
    </>
  );
}

function DiagonalScreenSplit({ progress }: { progress: number }) {
  const peaks = [
    diagonalPeak(progress, PHASE.heroEnd, 0.1),
    diagonalPeak(progress, PHASE.manifestoEnd, 0.09),
    diagonalPeak(progress, PHASE.investorsEnd, 0.09),
    diagonalPeak(progress, PHASE.teamEnd, 0.09),
  ];
  const strength = Math.max(...peaks, progress > 0.08 && progress < 0.92 ? 0.15 : 0);
  if (strength < 0.03) return null;

  const y0 = diagonalLineY(0, progress);
  const y100 = diagonalLineY(100, progress);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-25"
        style={{
          opacity: strength * 0.95,
          background: `linear-gradient(180deg, rgba(120,160,210,0.18) 0%, rgba(5,10,20,0) 45%)`,
          clipPath: `polygon(0 0, 100% 0, 100% ${y100}%, 0 ${y0}%)`,
          mixBlendMode: "screen",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-25"
        style={{
          opacity: strength,
          background: `radial-gradient(ellipse 80% 55% at 50% 110%, rgba(232,244,255,0.55) 0%, rgba(5,10,20,0) 65%)`,
          clipPath: `polygon(0 ${y0}%, 100% ${y100}%, 100% 100%, 0 100%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute z-30 h-px w-[140%]"
        style={{
          left: "-20%",
          top: `${(y0 + y100) / 2}%`,
          transform: `rotate(${lerp(-8, -14, progress)}deg)`,
          opacity: strength * 0.7,
          background: `linear-gradient(90deg, transparent, ${GLOW}, transparent)`,
          boxShadow: `0 0 24px ${GLOW}`,
        }}
        aria-hidden
      />
    </>
  );
}

function FilmGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 opacity-[0.14] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden
    />
  );
}

export default function HashgraphVenturesNetwork() {
  const progressRef = useRef(0);
  const hoverRef = useRef(0);
  const hoverTarget = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  const [progress, setProgress] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));
    const teamP = clamp01((p - PHASE.investorsEnd) / (PHASE.teamEnd - PHASE.investorsEnd));
    setTeamIndex(Math.min(TEAM.length - 1, Math.floor(teamP * TEAM.length * 1.02)));
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
    hoverTarget.current = 1;
  }, []);

  const handlePointerLeave = useCallback(() => {
    hoverTarget.current = 0;
    pointerRef.current = { x: 0, y: 0 };
  }, []);

  const p = progress / 100;
  const activeSection = SECTIONS.find((s) => p >= s.start && p < s.end) ?? SECTIONS[0];

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={920}
      stickyClassName="text-[#eee]"
      hint="↓ 스크롤 — 대각선 전환 · 크리스탈 분열 · 파티클"
      showProgress={false}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: BG }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0.4, 6.5], fov: 42 }} dpr={[1, 2]}>
            <HashgraphScene
              progressRef={progressRef}
              hoverRef={hoverRef}
              hoverTargetRef={hoverTarget}
              pointerRef={pointerRef}
            />
          </Canvas>
        </div>

        <DiagonalScreenSplit progress={p} />
        <FilmGrain />

        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
          aria-hidden
        />

        {/* Chrome */}
        <header className="absolute left-6 top-6 z-40 flex items-center gap-3 sm:left-10 sm:top-8">
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
            <path d="M16 4 L28 12 V24 L16 28 L4 24 V12 Z" fill="none" stroke="#eee" strokeWidth="1.2" />
            <path d="M16 10 L22 14 V22 L16 26 L10 22 V14 Z" fill="none" stroke="#9bb8e1" strokeWidth="0.8" />
          </svg>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.32em] text-[#eee] sm:inline">
            Hashgraph Ventures
          </span>
        </header>

        <div className="absolute right-6 top-7 z-40 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#eee] sm:right-10">
          <span>Sound on</span>
          <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
            <path d="M0 6 Q3 2 6 6 T12 6 T18 6 T24 6" fill="none" stroke="#9bb8e1" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="pointer-events-none absolute right-6 top-1/2 z-40 hidden h-40 w-px -translate-y-1/2 bg-[#9bb8e1]/25 sm:block">
          <div
            className="w-full bg-[#e3f4ff]"
            style={{ height: 32, transform: `translateY(${p * 128}px)` }}
          />
        </div>

        {/* Content layers */}
        {SECTIONS.map((section) => {
          const o = sectionOpacityFixed(p, section.start, section.end, 0.1);
          if (o < 0.02) return null;

          const posClass =
            section.titlePos === "bottom-left"
              ? "items-end justify-start pb-16 pl-6 sm:pb-20 sm:pl-10"
              : section.titlePos === "top-left"
                ? "items-start justify-start pt-28 pl-6 sm:pt-32 sm:pl-10"
                : section.titlePos === "center"
                  ? "items-center justify-center text-center"
                  : "items-center justify-start pl-6 pt-32 sm:pl-10 sm:pt-36";

          return (
            <div
              key={section.id}
              className={`pointer-events-none absolute inset-0 z-30 flex flex-col ${posClass}`}
              style={{ opacity: o }}
            >
              {section.num ? (
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#9bb8e1]">
                  {section.num} {section.label}
                </p>
              ) : null}

              {"titleLines" in section && section.titleLines ? (
                <h2 className="max-w-3xl font-sans text-3xl font-bold uppercase leading-[1.05] tracking-[0.06em] text-[#eee] sm:text-5xl md:text-6xl">
                  {section.titleLines.map((line, i) => (
                    <span
                      key={line}
                      className="block"
                      style={{
                        marginLeft: i === 1 ? "4.5rem" : i === 2 ? "2rem" : 0,
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </h2>
              ) : "title" in section ? (
                <h2
                  className={`max-w-3xl font-sans text-3xl font-bold uppercase leading-[1.05] tracking-[0.08em] text-[#eee] sm:text-5xl ${
                    section.id === "hero" ? "sm:text-4xl md:text-5xl" : ""
                  }`}
                >
                  {section.title}
                </h2>
              ) : null}

              {section.body ? (
                <p className="mt-6 max-w-md text-sm leading-relaxed text-[#c8d8ec]/90">{section.body}</p>
              ) : null}

              {"cta" in section && section.cta ? (
                <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.28em] text-[#9bb8e1]/80">
                  {section.cta}
                </p>
              ) : null}

              {section.id === "investors" && "cta" in section ? (
                <span className="mt-6 inline-flex border border-[#9bb8e1]/50 px-5 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#eee]">
                  Explore our portfolio
                </span>
              ) : null}

              {section.id === "investors" ? (
                <div className="mt-10 flex flex-wrap gap-3">
                  {PORTFOLIO.map((name, i) => (
                    <span
                      key={name}
                      className="border border-[#9bb8e1]/20 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-[#9bb8e1]"
                      style={{ opacity: smoothstep(clamp01((p - PHASE.manifestoEnd) / 0.12 - i * 0.08)) }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : null}

              {section.id === "team" ? (
                <div className="mt-8 min-h-[3.5rem]">
                  {TEAM.map((m, i) => (
                    <div
                      key={m.name}
                      className="absolute transition-opacity duration-500"
                      style={{ opacity: i === teamIndex ? 1 : 0 }}
                    >
                      <p className="text-lg text-[#eee]">{m.name}</p>
                      <p className="text-sm text-[#9bb8e1]">{m.role}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {section.id !== "hero" && section.id !== "footer" ? (
                <div className="mt-8 flex gap-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#9bb8e1]/70">
                  <span className="border-b border-[#9bb8e1]/30 pb-1">Read more</span>
                  <span className="opacity-40">Back to homepage</span>
                </div>
              ) : null}
            </div>
          );
        })}

        {activeSection.id === "hero" && (
          <p className="pointer-events-none absolute bottom-8 right-6 z-40 max-w-[120px] text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.22em] text-[#9bb8e1]/80 sm:bottom-10 sm:right-10">
            Scroll down to discover more
          </p>
        )}
      </div>
    </LabStickyScroll>
  );
}
