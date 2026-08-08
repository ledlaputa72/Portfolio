"use client";

import { useCallback, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const SECTIONS = [
  {
    id: "hero",
    start: 0,
    end: 0.26,
    kicker: "La burbuja Ibérica",
    title: "LA REVOLTOSA",
    sub: "Setenta años en los mismos vasos. Cosas que nunca fueron una moda.",
    accent: "#fff5e6",
  },
  {
    id: "terrace",
    start: 0.26,
    end: 0.52,
    kicker: "Sobremesas en terrazas",
    title: "PICOTEO",
    sub: "Buena compañía, algo para brindar — eso sí, que sea con gas.",
    accent: "#ffe8f5",
  },
  {
    id: "drinks",
    start: 0.52,
    end: 0.78,
    kicker: "Mis bebidas",
    title: "SIFÓN · LIMÓN · COLA",
    sub: "Unos días más ácida, otros más dulce. La esencia siempre es la misma.",
    accent: "#f5ffe0",
  },
  {
    id: "cta",
    start: 0.78,
    end: 1,
    kicker: "¿Qué te trae por aquí?",
    title: "A TODO, GAS",
    sub: "Dime qué necesitas y vemos cómo te puedo ayudar, cariño.",
    accent: "#fff0f8",
  },
] as const;

const DRINKS = [
  { name: "Sifón", hue: "from-[#ff4d6d] to-[#ff8c42]" },
  { name: "Limón", hue: "from-[#c6ff00] to-[#ffe135]" },
  { name: "Cola", hue: "from-[#7b2fbe] to-[#c41e3a]" },
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
uniform float uProgress;
uniform float uPulse;
varying vec2 vUv;

vec3 palette(float t) {
  vec3 a = vec3(1.0, 0.30, 0.43);
  vec3 b = vec3(1.0, 0.55, 0.26);
  vec3 c = vec3(0.88, 0.25, 0.98);
  vec3 d = vec3(1.0, 0.08, 0.58);
  vec3 e = vec3(0.78, 1.0, 0.0);
  vec3 f = vec3(1.0, 0.88, 0.21);
  vec3 g = vec3(0.48, 0.18, 0.75);
  vec3 h = vec3(0.77, 0.12, 0.23);

  float s0 = smoothstep(0.0, 0.22, t);
  float s1 = smoothstep(0.18, 0.48, t);
  float s2 = smoothstep(0.44, 0.74, t);
  float s3 = smoothstep(0.70, 1.0, t);

  vec3 col = mix(a, b, s0);
  col = mix(col, mix(c, d, 0.55), s1);
  col = mix(col, mix(e, f, 0.45), s2);
  col = mix(col, mix(g, h, 0.5), s3);
  return col;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float t = uProgress;

  float sweep = smoothstep(t - 0.08, t + 0.02, vUv.y + sin(vUv.x * 6.0 + uTime * 1.4) * 0.06);
  vec3 base = palette(t);
  vec3 next = palette(min(t + 0.12, 1.0));
  vec3 col = mix(base, next, sweep);

  float n = hash(vUv * 120.0 + uTime * 0.15) * 0.04;
  col += n;

  float vignette = 1.0 - length(p) * 0.22;
  col *= vignette;

  float pulse = sin(uTime * 2.2 + p.x * 4.0) * uPulse * 0.08;
  col += pulse;

  float grain = (hash(vUv + uTime) - 0.5) * 0.03;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
`;

function sectionOpacity(progress: number, start: number, end: number, fade = 0.12) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
}

function GradientBackdrop({
  progressRef,
  pulseRef,
}: {
  progressRef: React.RefObject<number>;
  pulseRef: React.RefObject<number>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPulse: { value: 0 },
  }).current;

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uProgress.value = progressRef.current;
    matRef.current.uniforms.uPulse.value = pulseRef.current;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, -1]}>
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

function IberianBubbles({
  progressRef,
  pointerRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<Group>(null!);

  const bubbles = useRef(
    Array.from({ length: 9 }, (_, i) => ({
      x: (Math.random() - 0.5) * 2.4,
      y: (Math.random() - 0.5) * 1.6,
      z: (Math.random() - 0.5) * 0.8,
      scale: 0.12 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    })),
  ).current;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const p = progressRef.current;
    const { x, y } = pointerRef.current;
    const t = clock.elapsedTime;

    groupRef.current.rotation.y = x * 0.25 + p * 0.6;
    groupRef.current.rotation.x = y * 0.15;

    groupRef.current.children.forEach((child, i) => {
      const b = bubbles[i];
      child.position.x = b.x + Math.sin(t * b.speed + b.phase) * 0.12;
      child.position.y = b.y + Math.cos(t * b.speed * 0.9 + b.phase) * 0.1 + p * 0.35;
      const s = b.scale * (0.85 + p * 0.35);
      child.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef}>
      {bubbles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.88}
            thickness={0.4}
            roughness={0.05}
            metalness={0.05}
            transparent
            opacity={0.55}
            ior={1.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function RevoltosaScene({
  progressRef,
  pointerRef,
  pulseRef,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  pulseRef: React.RefObject<number>;
}) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <pointLight position={[-2, -1, 3]} intensity={0.5} color="#ff8c42" />
      <GradientBackdrop progressRef={progressRef} pulseRef={pulseRef} />
      <IberianBubbles progressRef={progressRef} pointerRef={pointerRef} />
    </>
  );
}

export default function LaRevoltosaGradient() {
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(0);
  const drinksRef = useRef<HTMLDivElement>(null);
  const prevSectionRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [gradientLabel, setGradientLabel] = useState("Coral");

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(Math.round(p * 100));

    let best = 0;
    let bestO = 0;
    SECTIONS.forEach((s, i) => {
      const o = sectionOpacity(p, s.start, s.end);
      if (o > bestO) {
        bestO = o;
        best = i;
      }
    });

    if (best !== prevSectionRef.current) {
      pulseRef.current = 1;
      prevSectionRef.current = best;
    }
    pulseRef.current = Math.max(0, pulseRef.current - 0.04);

    setSectionIndex(best);
    const labels = ["Coral", "Magenta", "Limón", "Cola"];
    setGradientLabel(labels[best] ?? "Coral");

    if (drinksRef.current && p > 0.48) {
      const cards = drinksRef.current.querySelectorAll("[data-drink]");
      const local = gsap.utils.clamp(0, 1, (p - 0.48) / 0.34);
      cards.forEach((card, i) => {
        const start = i / DRINKS.length;
        const end = (i + 1) / DRINKS.length;
        const t = gsap.utils.clamp(0, 1, (local - start) / Math.max(0.001, end - start));
        gsap.set(card, {
          opacity: 0.15 + t * 0.85,
          y: 48 * (1 - t),
          scale: 0.92 + t * 0.08,
        });
      });
    }
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const p = progress / 100;
  const section = SECTIONS[sectionIndex];
  const showDrinks = p > 0.48;
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={420}
      stickyClassName="text-white"
      hint={locale === "ko" ? "↓ 스크롤 — 비비드 그라디언트 전환 · 버블 3D" : "↓ Scroll — vivid gradient transition · 3D bubbles"}
      showProgress={false}
    >
      <div
        className="relative h-full w-full"
        onPointerMove={handlePointer}
      >
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <RevoltosaScene
              progressRef={progressRef}
              pointerRef={pointerRef}
              pulseRef={pulseRef}
            />
          </Canvas>
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-10 sm:px-12">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">
              {section.kicker}
            </p>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/45">Gradient</p>
              <p className="text-lg font-black tabular-nums">{gradientLabel}</p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl text-center">
            {SECTIONS.map((s, i) => {
              const o = sectionOpacity(p, s.start, s.end);
              return (
                <div
                  key={s.id}
                  className="absolute inset-x-6 top-1/2 -translate-y-1/2 sm:inset-x-12"
                  style={{ opacity: o, pointerEvents: o > 0.5 ? "auto" : "none" }}
                >
                  <h3
                    className="text-4xl font-black uppercase leading-[0.92] tracking-tight drop-shadow-lg sm:text-6xl md:text-7xl"
                    style={{ color: s.accent }}
                  >
                    {s.title}
                  </h3>
                  <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/80 drop-shadow">
                    {s.sub}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="relative min-h-[120px]">
            <div
              ref={drinksRef}
              className="flex justify-center gap-3 sm:gap-5"
              style={{ opacity: showDrinks ? 1 : 0 }}
            >
              {DRINKS.map((drink) => (
                <div
                  key={drink.name}
                  data-drink
                  className={`w-24 rounded-2xl border border-white/25 bg-gradient-to-br ${drink.hue} p-4 text-center shadow-lg backdrop-blur-sm sm:w-28`}
                  style={{ opacity: 0.15, transform: "translateY(48px) scale(0.92)" }}
                >
                  <div className="mx-auto mb-2 h-10 w-6 rounded-t-lg rounded-b-sm bg-white/30" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-white">
                    {drink.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-end justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                larevoltosa.es
              </p>
              <p className="text-3xl font-bold tabular-nums text-white/90">{progress}%</p>
            </div>
          </div>
        </div>
      </div>
    </LabStickyScroll>
  );
}
