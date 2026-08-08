"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const YELLOW = "#f5d800";
const RED = "#e8261a";
const BEIGE = "#e8e0d4";
const BROWN = "#6b4f3a";
const TEAL = "#1e4a58";

const SLASH_START = new THREE.Vector2(0.05, 0.54);
const SLASH_END = new THREE.Vector2(0.95, 0.5);
const SLASH_HIT = 0.09;

/** Scroll phase boundaries (0–1) */
const P = {
  heroEnd: 0.14,
  beigeIn: 0.26,
  slashLock: 0.4,
  shellPeel: 0.52,
  inspYellow: 0.64,
  inspRed: 0.8,
  end: 1,
} as const;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function mapRange(v: number, a: number, b: number, outA: number, outB: number) {
  return outA + clamp01((v - a) / (b - a)) * (outB - outA);
}

function projectOntoSlash(x: number, y: number) {
  const ax = SLASH_START.x;
  const ay = SLASH_START.y;
  const bx = SLASH_END.x;
  const by = SLASH_END.y;
  const abx = bx - ax;
  const aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  const t = clamp01(((x - ax) * abx + (y - ay) * aby) / lenSq);
  const px = ax + abx * t;
  const py = ay + aby * t;
  const dist = Math.hypot(x - px, y - py);
  return { t, dist };
}

/** Scroll progress with slash gate — can't pass beige lock until slash ~complete */
function effectiveScroll(raw: number, slashReveal: number) {
  if (raw <= P.beigeIn) return raw;
  const unlocked = slashReveal >= 0.9;
  if (!unlocked && raw > P.beigeIn) {
    const overshoot = Math.min(raw - P.beigeIn, 0.2);
    return P.beigeIn + overshoot * 0.08;
  }
  if (!unlocked) return raw;
  const gate = P.beigeIn;
  const remapped = gate + ((raw - gate) / (1 - gate)) * (1 - gate);
  return Math.min(1, remapped);
}

function DanzanChrome() {
  return (
    <>
      <div className="pointer-events-none absolute left-6 top-6 z-50">
        <div className="h-5 w-5 rounded-full bg-black" />
      </div>
      <div className="pointer-events-none absolute right-6 top-6 z-50">
        <div
          className="bg-black px-5 py-2 text-[10px] font-bold uppercase italic tracking-widest text-white"
          style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}
        >
          Subscribe
        </div>
      </div>
      <p className="pointer-events-none absolute bottom-6 left-6 z-50 text-[10px] text-black/70">
        Design by @JIEJOE 2026
      </p>
      <div className="pointer-events-none absolute bottom-6 right-6 z-50 flex flex-col items-center gap-1">
        <div className="h-10 w-1 bg-black" />
        <div className="border border-black bg-white px-1 py-2 text-[8px] font-bold uppercase tracking-widest text-black [writing-mode:vertical-rl]">
          Scroll
        </div>
      </div>
    </>
  );
}

function MouseTrail({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number; life: number }[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      pointsRef.current.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (pointsRef.current.length > 24) pointsRef.current.shift();
    };
    window.addEventListener("mousemove", onMove);

    const ctx = canvas.getContext("2d");
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pointsRef.current.forEach((p, i) => {
        p.life -= 0.04;
        if (p.life <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + (1 - p.life) * 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,10,10,${p.life * 0.3})`;
        ctx.fill();
        if (i > 0) {
          const prev = pointsRef.current[i - 1];
          if (prev.life > 0) {
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(10,10,10,${p.life * 0.18})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      });
      pointsRef.current = pointsRef.current.filter((pt) => pt.life > 0);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-40" aria-hidden />;
}

const SHARDS: [number, number, number, number, number, number][] = [
  [-0.7, 0.5, 0.1, 0.5, -0.2, 0.3],
  [0.5, -0.1, -0.3, -0.4, 0.7, -0.3],
  [-0.2, -0.5, 0.4, 0.2, -0.6, 0.4],
  [0.8, 0.4, 0.0, -0.3, 0.1, -0.5],
  [-0.4, 0.0, -0.2, 0.6, 0.3, 0.2],
  [0.1, 0.6, 0.5, -0.5, -0.4, -0.3],
];

function ShardCluster({ pointerRef }: { pointerRef: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    const { x, y } = pointerRef.current;
    groupRef.current.rotation.y = x * 0.5;
    groupRef.current.rotation.x = y * 0.3;
    groupRef.current.position.x = x * 0.2;
    groupRef.current.position.y = y * 0.12;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 4, 5]} intensity={0.55} />
      {SHARDS.map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]}>
          <tetrahedronGeometry args={[0.5 + (i % 2) * 0.18, 0]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} flatShading />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.56, 6]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/** Updates CSS mask on shell layer — cut opens along slash to reveal layer beneath */
function useSlashShellMask(
  shellRef: React.RefObject<HTMLDivElement | null>,
  revealRef: React.RefObject<number>,
  active: boolean,
) {
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = document.createElement("canvas");
    maskCanvasRef.current = canvas;
    let raf = 0;
    let last = 0;

    const draw = (now: number) => {
      if (now - last < 32) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      const shell = shellRef.current;
      if (!shell) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const w = shell.clientWidth;
      const h = shell.clientHeight;
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(draw);
        return;
      }
      canvas.width = Math.floor(w * 0.35);
      canvas.height = Math.floor(h * 0.35);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const mw = canvas.width;
      const mh = canvas.height;
      const reveal = revealRef.current;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, mw, mh);

      const img = ctx.getImageData(0, 0, mw, mh);
      const data = img.data;
      const abx = SLASH_END.x - SLASH_START.x;
      const aby = SLASH_END.y - SLASH_START.y;
      const lenSq = abx * abx + aby * aby;
      for (let py = 0; py < mh; py++) {
        for (let px = 0; px < mw; px++) {
          const u = px / mw;
          const v = 1 - py / mh;
          const t = clamp01(((u - SLASH_START.x) * abx + (v - SLASH_START.y) * aby) / lenSq);
          if (t < reveal - 0.01) {
            const idx = (py * mw + px) * 4;
            data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(img, 0, 0);

      shell.style.maskImage = `url(${canvas.toDataURL()})`;
      shell.style.webkitMaskImage = shell.style.maskImage;
      shell.style.maskSize = "100% 100%";
      shell.style.webkitMaskSize = "100% 100%";

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, revealRef, shellRef]);
}

function BeigeStripes() {
  return (
    <div className="absolute inset-0 flex justify-center gap-[11vw]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-[4.5vw] max-w-[44px]" style={{ background: BROWN }} />
      ))}
    </div>
  );
}

function SamuraiSvg() {
  return (
    <svg viewBox="0 0 200 280" className="h-[52vh] max-h-[400px] w-auto" aria-hidden>
      <path
        fill="#0a0a0a"
        d="M100 20c-28 8-42 32-42 58 0 18 8 34 22 44l-8 120h56l-8-120c14-10 22-26 22-44 0-26-14-50-42-58zm-50 95c-8 12-14 28-16 48h20c2-16 6-30 12-42l-16-6zm100 0l-16 6c6 12 10 26 12 42h20c-2-20-8-36-16-48z"
      />
      <ellipse cx="118" cy="175" rx="18" ry="8" fill="#0a0a0a" />
    </svg>
  );
}

function SlashGuide({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <svg
      className="pointer-events-none absolute left-[5%] right-[5%] top-[47%] z-30 h-10 w-[90%]"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M 1 5 Q 50 1.5 99 5"
        fill="none"
        stroke="white"
        strokeWidth="0.9"
        strokeDasharray="2.8 2.8"
      />
    </svg>
  );
}

function RedDripTop({ amount }: { amount: number }) {
  const h = 8 + amount * 28;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10"
      style={{
        height: `${h}%`,
        background: RED,
        clipPath: `polygon(0 0,100% 0,100% ${100 - amount * 35}%,94% 100%,86% ${78 - amount * 20}%,78% 100%,70% ${82 - amount * 15}%,62% 100%,54% ${75 - amount * 18}%,46% 100%,38% ${80 - amount * 12}%,30% 100%,22% ${72 - amount * 16}%,14% 100%,6% ${85 - amount * 10}%,0 ${100 - amount * 30}%)`,
        transition: "height 0.05s linear",
      }}
    />
  );
}

function YellowDripBottom({ amount }: { amount: number }) {
  const h = 12 + amount * 32;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      style={{
        height: `${h}%`,
        background: YELLOW,
        clipPath: `polygon(0 ${amount * 25}%,6% ${18 + amount * 8}%,14% ${amount * 22}%,22% ${12 + amount * 10}%,30% ${amount * 28}%,38% ${14 + amount * 6}%,46% ${amount * 24}%,54% ${10 + amount * 12}%,62% ${amount * 26}%,70% ${16 + amount * 8}%,78% ${amount * 20}%,86% ${8 + amount * 14}%,94% ${amount * 30}%,100% ${amount * 18}%,100% 100%,0 100%)`,
      }}
    />
  );
}

export default function DanzanSlashReveal() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const revealRef = useRef(0);
  const dragRevealRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const shellRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [revealPct, setRevealPct] = useState(0);
  const [slashUnlocked, setSlashUnlocked] = useState(false);
  const [scroll, setScroll] = useState(0);

  const syncProgress = useCallback((raw: number) => {
    progressRef.current = raw;
    const eff = effectiveScroll(raw, revealRef.current);
    setScroll(eff);
    setProgress(Math.round(raw * 100));
    setSlashUnlocked(revealRef.current >= 0.9);
    setRevealPct(Math.round(revealRef.current * 100));

    if (eff < P.beigeIn * 0.5) {
      dragRevealRef.current = 0;
      revealRef.current = 0;
    }
  }, []);

  const updateReveal = useCallback((t: number) => {
    dragRevealRef.current = Math.max(dragRevealRef.current, t);
    revealRef.current = Math.max(revealRef.current, dragRevealRef.current);
    setRevealPct(Math.round(revealRef.current * 100));
    setSlashUnlocked(revealRef.current >= 0.9);
    setScroll(effectiveScroll(progressRef.current, revealRef.current));
  }, []);

  const inSlashZone =
    scroll >= P.beigeIn - 0.02 && scroll < P.shellPeel && revealRef.current < 0.98;

  useSlashShellMask(shellRef, revealRef, scroll >= P.beigeIn - 0.05 && scroll < P.inspYellow);

  const handlePointer = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      if (!inSlashZone && revealRef.current < 0.9) return;
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      const { t, dist } = projectOntoSlash(x, y);
      if (dist < SLASH_HIT) updateReveal(t);
    },
    [inSlashZone, updateReveal],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scroll < P.beigeIn - 0.03) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (draggingRef.current) {
      handlePointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
    }
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const heroY = -mapRange(scroll, 0, P.beigeIn, 0, 100);
  const beigeY = mapRange(scroll, P.heroEnd, P.beigeIn, 100, 0);
  const shellPeelY = -mapRange(scroll, P.slashLock, P.shellPeel, 0, 100);
  const showHero = scroll < P.beigeIn + 0.08;
  const showBeigeShell = scroll >= P.heroEnd - 0.02 && scroll < P.inspYellow;
  const showSlashHint = inSlashZone && revealRef.current < 0.85;

  const inspScroll = mapRange(scroll, P.shellPeel, P.inspRed, 0, 1);
  const redDripAmt = mapRange(scroll, P.shellPeel, P.inspYellow, 0, 1);
  const yellowToRed = mapRange(scroll, P.inspYellow, P.inspRed, 0, 1);
  const samuraiStyleY = -mapRange(scroll, P.inspRed, P.end, 0, 100);

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={syncProgress}
      scrollHeightVh={800}
      stickyClassName="bg-[#f5d800] text-black"
      hint={locale === "ko" ? "↓ 스크롤 — 레이어 슬라이드 · 점선으로 껍질 절단" : "↓ Scroll — layers slide · cut the shell along the dotted line"}
      showProgress={false}
    >
      <div
        className={`relative h-full w-full overflow-hidden ${showSlashHint ? "cursor-crosshair" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* ── LAYER: Inner content revealed through slash (灵感 yellow) ── */}
        <div
          className="absolute inset-0 z-0 flex flex-col items-center justify-center"
          style={{
            background: YELLOW,
            opacity: scroll >= P.beigeIn - 0.05 ? 1 : 0,
          }}
        >
          <RedDripTop amount={redDripAmt * 0.4} />
          <p className="relative z-20 font-serif text-7xl text-black sm:text-9xl">灵感</p>
          <p className="relative z-20 mt-3 text-xs font-bold uppercase tracking-[0.35em] text-white drop-shadow-sm">
            ( Inspiration )
          </p>
        </div>

        {/* ── LAYER: Beige shell (masked by slash — NOT a background swap) ── */}
        {showBeigeShell ? (
          <div
            ref={shellRef}
            className="absolute inset-0 z-20 will-change-transform"
            style={{
              background: BEIGE,
              transform: `translateY(${beigeY + shellPeelY}%)`,
            }}
          >
            <BeigeStripes />
            <div className="relative flex h-full flex-col items-center justify-end pb-[16vh]">
              {showSlashHint ? (
                <p
                  className="absolute left-1/2 top-[36%] z-30 -translate-x-1/2 text-center text-sm font-bold uppercase sm:text-base"
                  style={{ color: RED }}
                >
                  swipe across the dotted line now
                </p>
              ) : null}
              <SamuraiSvg />
            </div>
          </div>
        ) : null}

        <SlashGuide visible={showSlashHint} />

        {/* ── LAYER: Inspiration scroll — yellow → red paint bleed (continuous) ── */}
        <div
          className="absolute inset-0 z-[5] flex flex-col"
          style={{
            transform: `translateY(${(1 - inspScroll) * 100 + samuraiStyleY}%)`,
            pointerEvents: scroll < P.shellPeel ? "none" : "auto",
          }}
        >
          <section
            className="relative flex h-screen shrink-0 flex-col items-center justify-center"
            style={{ background: YELLOW }}
          >
            <RedDripTop amount={0.35 + redDripAmt * 0.65} />
            <p className="relative z-20 font-serif text-8xl text-black">灵感</p>
            <p className="relative z-20 mt-2 text-xs font-bold uppercase tracking-[0.3em] text-white">
              ( Inspiration )
            </p>
          </section>

          <section
            className="relative flex h-screen shrink-0 items-center justify-center overflow-hidden"
            style={{ background: RED }}
          >
            <YellowDripBottom amount={1 - yellowToRed * 0.3} />
            <div
              className="absolute inset-0 z-0"
              style={{
                background: YELLOW,
                opacity: Math.max(0, 1 - yellowToRed * 1.2),
                transform: `translateY(${-yellowToRed * 30}%)`,
              }}
            />
            <div className="relative z-20 max-w-lg px-6 text-center">
              <p className="text-3xl font-black uppercase leading-[0.92] text-white sm:text-5xl">
                WE SLICE
                <br />
                THE
                <br />
                FALSE MASK
                <br />
                WIDE OPEN
                <br />
                TO GRIND
                <br />
                <span className="text-white/90">THE RAW TRUTH</span>
                <br />
                HIDDEN DEEP
              </p>
            </div>
          </section>

          <section className="relative h-screen shrink-0 overflow-hidden">
            <div className="flex h-[30%] items-center justify-center" style={{ background: RED }}>
              <p className="text-3xl font-black uppercase text-white sm:text-4xl">Hidden Deep</p>
            </div>
            <div
              className="relative flex h-[40%] flex-col items-center justify-center px-6"
              style={{
                background: TEAL,
                clipPath:
                  "polygon(0 6%,4% 0,10% 7%,18% 0,26% 8%,34% 0,42% 6%,50% 0,58% 7%,66% 0,74% 8%,82% 0,90% 6%,100% 0,100% 94%,96% 100%,88% 92%,80% 100%,72% 90%,64% 100%,56% 93%,48% 100%,40% 91%,32% 100%,24% 92%,16% 100%,8% 94%,0 100%)",
              }}
            >
              <span
                className="absolute left-[10%] font-serif text-6xl sm:text-7xl"
                style={{ color: YELLOW }}
              >
                武
              </span>
              <span
                className="absolute right-[10%] font-serif text-6xl sm:text-7xl"
                style={{ color: YELLOW }}
              >
                士
              </span>
              <div
                className="flex h-32 w-32 items-center justify-center rounded-full sm:h-40 sm:w-40"
                style={{ background: RED }}
              >
                <p className="text-center text-sm font-black uppercase text-white sm:text-base">
                  Samurai
                  <br />
                  Style
                </p>
              </div>
            </div>
            <div className="flex h-[30%] items-center justify-center" style={{ background: RED }}>
              <p className="text-3xl font-black uppercase">
                <span className="text-black">The </span>
                <span style={{ color: YELLOW }}>Katana</span>
              </p>
            </div>
          </section>
        </div>

        {/* ── LAYER: Hero yellow + 3D shards ── */}
        {showHero ? (
          <div
            className="absolute inset-0 z-30 will-change-transform"
            style={{ transform: `translateY(${heroY}%)` }}
          >
            <Canvas className="absolute inset-0" camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
              <color attach="background" args={[YELLOW]} />
              <ShardCluster pointerRef={pointerRef} />
            </Canvas>
            <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center text-center">
              <p className="font-serif text-7xl text-white/95 sm:text-9xl">斬</p>
              <p className="mt-1 text-4xl font-black tracking-[0.3em] sm:text-6xl" style={{ color: RED }}>
                DANZAN
              </p>
              <div className="absolute inset-x-10 top-[40%] flex justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-white">
                <span>Slash the rules</span>
                <span>Grind the raw</span>
              </div>
              <p
                className="absolute bottom-20 max-w-xs text-[9px] font-bold uppercase leading-relaxed tracking-wide"
                style={{ color: RED }}
              >
                A highly creative street culture IP designed for the raw era
              </p>
            </div>
            <MouseTrail active />
          </div>
        ) : null}

        <DanzanChrome />

        <div className="pointer-events-none absolute left-6 top-16 z-50 text-[10px] font-bold uppercase tracking-widest text-black/50">
          {scroll < P.heroEnd
            ? "3D Hero"
            : showSlashHint
              ? `Slash ${revealPct}%`
              : scroll < P.shellPeel
                ? slashUnlocked
                  ? "Shell peeling"
                  : "Cut the shell"
                : scroll < P.inspRed
                  ? "Inspiration"
                  : "Samurai style"}
        </div>

        <div className="pointer-events-none absolute bottom-20 left-6 z-50">
          <p className="text-[10px] uppercase tracking-widest text-black/40">Journey</p>
          <p className="text-2xl font-bold tabular-nums">{progress}%</p>
        </div>
      </div>
    </LabStickyScroll>
  );
}
