"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";

const BG = "#f4f8fb";
const TEAL = "#0d9488";
const NAVY = "#1e3a5f";
const MUTED = "#64748b";
const WHITE = "#ffffff";
const WARM = "#e0f2f1";

const SCROLL_VH = 2800;

const TREATMENTS = [
  {
    title: "NHS Dentistry",
    body: "Clinically necessary care to achieve and maintain good oral health — available at all practices.",
  },
  {
    title: "Weekend & Late Evening",
    body: "Open Saturdays, Sundays and late evenings — the only UK group to routinely offer this.",
  },
  {
    title: "Private Dentistry",
    body: "Whitening, implants, endodontics, periodontics and sedation beyond standard NHS care.",
  },
  {
    title: "Hygiene Package",
    body: "Professional cleaning with guidance on keeping your mouth healthy — first hygiene visit free.",
  },
] as const;

const STATS = [
  { value: 45, suffix: "", label: "Years of Experience" },
  { value: 546, suffix: "K", label: "Registered Patients", prefix: "+" },
  { value: 100, suffix: "", label: "5-Star Google Reviews", prefix: "+" },
  { value: 100, suffix: "%", label: "Would Recommend Us" },
] as const;

const PRACTICES = [
  { id: "chichester", name: "Chichester", region: "West Sussex", x: -2.2, z: -2 },
  { id: "brighton", name: "Brighton", region: "East Sussex", x: 2.4, z: -8 },
  { id: "canterbury", name: "Canterbury", region: "Kent", x: -1.8, z: -14 },
  { id: "southampton", name: "Southampton", region: "Hampshire", x: 2.2, z: -20 },
  { id: "salisbury", name: "Salisbury", region: "Wiltshire", x: -2.4, z: -26 },
] as const;

const SECTIONS = [
  {
    id: "hero",
    start: 0,
    end: 0.16,
    kicker: "South Cliff Dental Group",
    title: "Award Winning Dental Practices",
    sub: "NHS and private dental care across Sussex, Kent, Hampshire and Wiltshire.",
  },
  {
    id: "about",
    start: 0.14,
    end: 0.28,
    kicker: "Who we are",
    title: "Patients first.",
    sub: "Founded in 2015 — practices open 7 days a week with late evenings, accepting new NHS patients.",
  },
  {
    id: "treatments",
    start: 0.26,
    end: 0.42,
    kicker: "Our treatments",
    title: "The whole spectra of care.",
    sub: "From NHS essentials to implants, whitening and sedation — in plain language.",
  },
  {
    id: "emergency",
    start: 0.4,
    end: 0.52,
    kicker: "Emergency care",
    title: "Seen as soon as possible.",
    sub: "If you need an emergency appointment we will do our best to see you without delay.",
  },
  {
    id: "patients",
    start: 0.5,
    end: 0.64,
    kicker: "Our patients",
    title: "+546K registered patients.",
    sub: "Booking through South Cliff Dental Group is easy — contact the practice nearest you.",
  },
  {
    id: "locations",
    start: 0.62,
    end: 0.82,
    kicker: "Our locations",
    title: "Find your nearest practice.",
    sub: "Click a location — the 3D scene navigates to that practice.",
  },
  {
    id: "cta",
    start: 0.8,
    end: 1,
    kicker: "Discover more",
    title: "Book your appointment.",
    sub: "Network of practices in cities, towns, health centres and purpose-built premises.",
  },
] as const;

const CAMERA_KEYS = [
  { t: 0, pos: [0, 2.4, 6] as const, look: [0, 1.2, 0] as const },
  { t: 0.16, pos: [0, 1.7, -1] as const, look: [0, 0.9, -3] as const },
  { t: 0.28, pos: [1.8, 1.65, -7] as const, look: [2, 0.85, -9] as const },
  { t: 0.42, pos: [-1.2, 1.6, -13] as const, look: [-1.5, 0.8, -15] as const },
  { t: 0.55, pos: [0, 3.2, -18] as const, look: [0, 0, -22] as const },
  { t: 0.72, pos: [0, 2.2, -24] as const, look: [0, 1, -26] as const },
  { t: 0.88, pos: [0, 1.85, -30] as const, look: [0, 1, -34] as const },
  { t: 1, pos: [0, 2, -36] as const, look: [0, 1.1, -40] as const },
] as const;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

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

function sectionOpacity(progress: number, start: number, end: number, fade = 0.12) {
  const range = end - start;
  const fadeW = range * fade;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeW) return (progress - start) / fadeW;
  if (progress > end - fadeW) return (end - progress) / fadeW;
  return 1;
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
  const local = clamp01((progress - a.t) / span);
  const ease = local * local * (3 - 2 * local);
  return { pos: lerp3(a.pos, b.pos, ease), look: lerp3(a.look, b.look, ease) };
}

function countUp(target: number, t: number, prefix = "", suffix = "") {
  const val = Math.round(lerp(0, target, easeInOutCubic(t)));
  return `${prefix}${val}${suffix}`;
}

function ToothIcon({ position, scale = 1, emissive = 0 }: { position: [number, number, number]; scale?: number; emissive?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />
        <meshStandardMaterial color={WHITE} emissive={TEAL} emissiveIntensity={emissive} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.22, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <coneGeometry args={[0.14, 0.2, 8]} />
        <meshStandardMaterial color={WHITE} emissive={TEAL} emissiveIntensity={emissive * 0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function DentalChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.35, 0]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.9, 0.12, 1.6]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, -0.75]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.12]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.35} />
      </mesh>
      <mesh position={[0.55, 0.5, 0.2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PracticeBuilding({
  practice,
  active,
}: {
  practice: (typeof PRACTICES)[number];
  active: boolean;
}) {
  const glow = active ? 0.45 : 0.08;
  return (
    <group position={[practice.x, 0, practice.z]}>
      <RoundedBox args={[2.8, 2.2, 2.4]} radius={0.08} smoothness={4} position={[0, 1.1, 0]}>
        <meshStandardMaterial color={WHITE} roughness={0.55} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, 1.1, 1.22]}>
        <planeGeometry args={[2.2, 1.6]} />
        <meshStandardMaterial
          color={TEAL}
          transparent
          opacity={0.35}
          emissive={TEAL}
          emissiveIntensity={glow}
        />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[2.4, 0.15, 2.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <DentalChair position={[-0.4, 0, 0]} />
      <ToothIcon position={[0.6, 1.8, 0.5]} scale={0.7} emissive={active ? 0.6 : 0.15} />
      {active && (
        <pointLight position={[0, 2.5, 1]} color={TEAL} intensity={1.2} distance={6} />
      )}
    </group>
  );
}

function LocationPin({
  practice,
  active,
  onClick,
}: {
  practice: (typeof PRACTICES)[number];
  active: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const bob = active ? Math.sin(clock.elapsedTime * 3) * 0.08 : 0;
    meshRef.current.position.y = 3.2 + bob;
  });

  return (
    <group position={[practice.x, 0, practice.z]}>
      <mesh
        ref={meshRef}
        position={[0, 3.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[active ? 0.22 : 0.16, 16, 16]} />
        <meshStandardMaterial
          color={active ? TEAL : NAVY}
          emissive={active ? TEAL : NAVY}
          emissiveIntensity={active ? 0.8 : 0.2}
        />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color={active ? TEAL : "#94a3b8"} />
      </mesh>
    </group>
  );
}

function DentalCampus({
  selectedId,
  onSelectPractice,
}: {
  selectedId: string | null;
  onSelectPractice: (id: string) => void;
}) {
  const length = 42;

  return (
    <group>
      <mesh position={[0, 0, -length / 2 + 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, length]} />
        <meshStandardMaterial color="#e8f0f5" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.01, -length / 2 + 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, length]} />
        <meshStandardMaterial color={TEAL} roughness={0.6} opacity={0.4} transparent />
      </mesh>

      <group position={[0, 0, 2]}>
        <RoundedBox args={[4, 2.8, 3]} radius={0.1} smoothness={4} position={[0, 1.4, 0]}>
          <meshStandardMaterial color={WHITE} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 1.4, 1.52]}>
          <planeGeometry args={[3.2, 2.2]} />
          <meshStandardMaterial color={WARM} emissive={TEAL} emissiveIntensity={0.15} transparent opacity={0.5} />
        </mesh>
        <ToothIcon position={[0, 2.6, 0.8]} scale={1.2} emissive={0.35} />
      </group>

      {PRACTICES.map((p) => (
        <group key={p.id}>
          <PracticeBuilding practice={p} active={selectedId === p.id} />
          <LocationPin
            practice={p}
            active={selectedId === p.id}
            onClick={() => onSelectPractice(p.id)}
          />
        </group>
      ))}

      <mesh position={[0, 1.5, -length + 6]}>
        <planeGeometry args={[12, 3]} />
        <meshStandardMaterial color={WHITE} roughness={0.9} />
      </mesh>
    </group>
  );
}

function ChapterSlide({
  rise,
  zIndex,
  children,
  light = true,
}: {
  rise: number;
  zIndex: number;
  children: ReactNode;
  light?: boolean;
}) {
  if (rise < 0.001) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex,
        transform: `translateY(${lerp(108, 0, rise)}%)`,
        background: light ? "rgba(244,248,251,0.94)" : "rgba(30,58,95,0.94)",
        color: light ? NAVY : WHITE,
      }}
    >
      <div className="pointer-events-auto h-full">{children}</div>
    </div>
  );
}

export default function SouthCliffDentalExplore() {
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const selectedIdRef = useRef<string | null>(null);
  const focusBlendRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(p);
    if (p < 0.58 || p > 0.88) {
      focusBlendRef.current = lerp(focusBlendRef.current, 0, 0.08);
    }
  }, []);

  const handleSelectPractice = useCallback((id: string) => {
    const next = selectedIdRef.current === id ? null : id;
    selectedIdRef.current = next;
    setSelectedId(next);
    focusBlendRef.current = next ? 1 : 0;
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const statsReveal = smoothstep(0.48, 0.58, progress);
  const heroFade = 1 - smoothstep(0.1, 0.2, progress);

  const riseTreatments = panelRise(progress, 0.24, 0.36);
  const riseEmergency = panelRise(progress, 0.36, 0.48);
  const riseStats = panelRise(progress, 0.46, 0.58);
  const riseLocations = panelRise(progress, 0.58, 0.72);
  const riseCta = panelRise(progress, 0.7, 0.84);

  const selectedPractice = PRACTICES.find((p) => p.id === selectedId);
  let activeSection = 0;
  let bestOpacity = 0;
  SECTIONS.forEach((s, i) => {
    const o = sectionOpacity(progress, s.start, s.end);
    if (o > bestOpacity) {
      bestOpacity = o;
      activeSection = i;
    }
  });

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#1e3a5f]"
      hint="↓ 스크롤 — 3D practice 탐색 · 위치 클릭"
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: BG }} onPointerMove={handlePointer}>
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 2.4, 6], fov: 50 }} dpr={[1, 1.5]}>
            <ExploreSceneWithSelection
              progressRef={progressRef}
              pointerRef={pointerRef}
              selectedIdRef={selectedIdRef}
              focusBlendRef={focusBlendRef}
              selectedId={selectedId}
              onSelectPractice={handleSelectPractice}
            />
          </Canvas>
        </div>

        <header className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-center justify-between px-6 py-5 sm:px-10">
          <span className="text-xs font-semibold tracking-tight" style={{ color: NAVY }}>
            South Cliff Dental
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
            {SECTIONS[activeSection]?.kicker ?? "NHS & Private"}
          </span>
        </header>

        <div
          className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 py-16 sm:px-12 sm:py-20"
          style={{ opacity: heroFade }}
        >
          <div />
          <div className="max-w-2xl">
            <h1 className="text-4xl font-light leading-tight tracking-tight sm:text-6xl" style={{ color: NAVY }}>
              Award Winning
              <br />
              <span style={{ color: TEAL }}>Dental Practices</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
              NHS and private dental care across Sussex, Kent, Hampshire and Wiltshire.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: MUTED }}>
            Scroll
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-[15] px-6 sm:px-12">
          {SECTIONS.map((s) => {
            const o = sectionOpacity(progress, s.start, s.end) * (1 - smoothstep(0.2, 0.28, progress));
            if (o < 0.01 || ["hero", "treatments", "patients", "locations", "cta"].includes(s.id)) return null;
            return (
              <div key={s.id} className="mx-auto max-w-xl text-center" style={{ opacity: o }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: TEAL }}>
                  {s.kicker}
                </p>
                <h2 className="mt-3 text-2xl font-light sm:text-4xl" style={{ color: NAVY }}>
                  {s.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>
                  {s.sub}
                </p>
              </div>
            );
          })}
        </div>

        <ChapterSlide rise={riseTreatments} zIndex={30}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: TEAL }}>
              Our treatments
            </p>
            <h2 className="mt-4 text-3xl font-light sm:text-4xl" style={{ color: NAVY }}>
              The whole spectra of care.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {TREATMENTS.map((t, i) => (
                <div
                  key={t.title}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "rgba(13,148,136,0.2)",
                    background: WHITE,
                    opacity: smoothstep(0.26 + i * 0.02, 0.34 + i * 0.02, progress),
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: NAVY }}>
                    {t.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: MUTED }}>
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseEmergency} zIndex={35} light={false}>
          <div className="flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">Emergency care</p>
            <h2 className="mt-4 text-3xl font-light sm:text-5xl">Seen as soon as possible.</h2>
            <p className="mt-6 max-w-md text-sm text-white/60">
              If you require an emergency appointment we will do our best to see you without delay.
            </p>
            <span className="mt-10 border-b border-white/40 pb-1 font-mono text-[10px] uppercase tracking-[0.35em]">
              Call us now
            </span>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseStats} zIndex={40}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: TEAL }}>
              Our patients
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-light tabular-nums sm:text-4xl" style={{ color: TEAL }}>
                    {countUp(
                      s.value,
                      statsReveal,
                      "prefix" in s ? s.prefix : "",
                      s.suffix,
                    )}
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-wider" style={{ color: MUTED }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <blockquote className="mt-10 max-w-lg border-l-2 pl-4 text-sm italic" style={{ borderColor: TEAL, color: MUTED }}>
              &ldquo;Appointments start on time — efficient without feeling rushed. Highly recommend.&rdquo;
              <footer className="mt-2 not-italic font-mono text-[9px] uppercase tracking-wider">★★★★★ · Patient review</footer>
            </blockquote>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseLocations} zIndex={45}>
          <div className="flex h-full flex-col justify-center gap-6 px-6 sm:flex-row sm:items-center sm:px-12">
            <div className="sm:w-1/2">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: TEAL }}>
                Our locations
              </p>
              <h2 className="mt-4 text-3xl font-light sm:text-4xl" style={{ color: NAVY }}>
                Find your nearest practice.
              </h2>
              <p className="mt-4 text-sm" style={{ color: MUTED }}>
                Click a location — the 3D scene navigates to that practice. Pins are also clickable in the viewport.
              </p>
              <ul className="mt-6 space-y-2">
                {PRACTICES.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectPractice(p.id)}
                      className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
                      style={{
                        borderColor: selectedId === p.id ? TEAL : "rgba(30,58,95,0.12)",
                        background: selectedId === p.id ? `${TEAL}12` : WHITE,
                      }}
                    >
                      <span className="text-sm font-medium" style={{ color: NAVY }}>
                        {p.name}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: MUTED }}>
                        {p.region}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {selectedPractice && (
                <p className="mt-4 text-xs" style={{ color: TEAL }}>
                  Navigating to {selectedPractice.name}, {selectedPractice.region}
                </p>
              )}
            </div>
            <div className="rounded-xl border p-4 sm:w-1/2" style={{ borderColor: "rgba(13,148,136,0.2)", background: WHITE }}>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
                3D practice network
              </p>
              <p className="mt-3 text-sm" style={{ color: NAVY }}>
                West Sussex · East Sussex · Kent · Hampshire · Wiltshire
              </p>
              <p className="mt-4 text-xs leading-relaxed" style={{ color: MUTED }}>
                Purpose-built premises, health centres and town-centre practices — scroll or click to explore each
                location in the WebGL scene behind this panel.
              </p>
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseCta} zIndex={50} light={false}>
          <div className="flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">Discover more</p>
            <h2 className="mt-6 text-4xl font-light sm:text-6xl">Book your appointment.</h2>
            <p className="mt-6 max-w-md text-sm text-white/55">
              Open 7 days a week with late evenings — accepting new NHS patients across our network.
            </p>
            <span className="mt-10 border-b border-white/35 pb-1 font-mono text-[10px] uppercase tracking-[0.35em]">
              Discover our practices
            </span>
          </div>
        </ChapterSlide>

        <div className="pointer-events-none absolute bottom-6 left-6 z-[100] font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
          {selectedPractice ? `${selectedPractice.name} · ${selectedPractice.region}` : "Scroll · click locations"}
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 z-[100] font-mono text-[9px] tabular-nums" style={{ color: MUTED }}>
          {Math.round(progress * 100)}%
        </div>
      </div>
    </LabStickyScroll>
  );
}

function ExploreSceneWithSelection({
  progressRef,
  pointerRef,
  selectedIdRef,
  focusBlendRef,
  selectedId,
  onSelectPractice,
}: {
  progressRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  selectedIdRef: React.RefObject<string | null>;
  focusBlendRef: React.RefObject<number>;
  selectedId: string | null;
  onSelectPractice: (id: string) => void;
}) {
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const focusPos = useMemo(() => new THREE.Vector3(), []);
  const focusLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = progressRef.current;
    const { pos, look } = sampleCamera(p);
    const { x, y } = pointerRef.current;

    targetPos.copy(pos);
    targetPos.x += x * 0.12;
    targetPos.y += y * 0.06;
    targetLook.copy(look);
    targetLook.x += x * 0.08;

    const practice = PRACTICES.find((pr) => pr.id === selectedIdRef.current);
    const blend = focusBlendRef.current;

    if (practice && blend > 0.01) {
      focusPos.set(practice.x + 2.5, 1.8, practice.z + 3);
      focusLook.set(practice.x, 1.2, practice.z);
      targetPos.lerp(focusPos, blend * 0.85);
      targetLook.lerp(focusLook, blend * 0.9);
    }

    camera.position.lerp(targetPos, 0.07);
    camera.lookAt(targetLook);
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 8, 28]} />
      <ambientLight intensity={0.55} color="#f0f9ff" />
      <directionalLight position={[5, 10, 8]} intensity={0.65} color="#ffffff" />
      <directionalLight position={[-4, 6, -10]} intensity={0.25} color={TEAL} />
      <DentalCampus selectedId={selectedId} onSelectPractice={onSelectPractice} />
    </>
  );
}
