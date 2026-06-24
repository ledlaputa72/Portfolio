"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import LabStickyScroll from "./LabStickyScroll";

const BG = "#061612";
const BG_MID = "#0c2a22";
const BG_LIGHT = "#eef5f1";
const BG_LIGHT_MID = "#dcebe4";
const ACCENT = "#2d9f6f";
const ACCENT_BRIGHT = "#4ade80";
const ACCENT_SOFT = "#86efac";
const MINT = "#bbf7d0";
const TEXT = "#ecfdf5";
const TEXT_DARK = "#0a1f18";
const MUTED = "#6b9b88";
const MUTED_LIGHT = "#5a7d6e";

const SCROLL_VH = 2600;

const BENEFITS = [
  "Boost efficiency and significantly reduce costs",
  "Live visibility across energy, water and emissions",
  "Decarbonise and identify the optimal net-zero pathway",
] as const;

const SOLUTIONS = [
  {
    tag: "Consulting Services",
    title: "Get situation awareness fast",
    body: "Identify sustainability risks and opportunities early — from operator to director level.",
  },
  {
    tag: "Smart-Zero™ Software",
    title: "Single source of truth",
    body: "Real-time capture, review and analysis with Digital Joules™ AI guidance.",
  },
  {
    tag: "Industrial IoT",
    title: "Pioneering IIoT",
    body: "Vendor-agnostic integration with scalable, low-maintenance sensor networks.",
  },
] as const;

const MODULES = [
  "Corporate Map",
  "Connectivity",
  "Asset Mngmt.",
  "Mission Packs",
  "Energy Mngmt.",
  "Net Zero",
  "ESG Ledger",
  "Roadmaps",
  "Digital Twins",
] as const;

const PROCESS_STEPS = [
  { num: "01", title: "Qualify", body: "Free remote sustainability study — size of the prize evaluation." },
  { num: "02", title: "Plan", body: "Accurate improvement roadmap in 4 weeks with on-site consultants." },
  { num: "03", title: "Execute", body: "Energy efficiency, water, IIoT and net-zero transition projects." },
  { num: "04", title: "Assess", body: "Before/after analysis with ongoing SmartZero™ guidance." },
] as const;

const COMPARE = {
  reventador: [
    "Comprehensive scope — one umbrella partner",
    "Pioneering data quality standards",
    "Self-learning toolset with 20+ years know-how",
    "Scales single factory to global enterprise",
  ],
  alt: [
    "Multiple partners — lack of cohesion",
    "No strategy for data quality issues",
    "High rotation without digitised knowledge hub",
    "Underexploits inter-factory opportunities",
  ],
} as const;

const STATS = [
  { value: "100+", label: "Industrial projects delivered globally" },
  { value: "25+ yrs", label: "Practical manufacturing experience" },
  { value: "16%", label: "Validated footprint & cost reduction" },
  { value: "Top 3%", label: "Talent engaged for product quality" },
] as const;

const METRICS = [
  { label: "Scope 1+2", unit: "tCO₂e", from: 42500, to: 16200 },
  { label: "Energy", unit: "USD", from: 2.4, to: 1.1, decimals: 1, prefix: "$", suffix: "M" },
  { label: "Water", unit: "m³", from: 8.2, to: 5.1, decimals: 1, suffix: "M" },
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

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function panelRise(p: number, start: number, end: number) {
  return easeInOutCubic(smoothstep(start, end, p));
}

function curveReduction(p: number) {
  return easeOutCubic(smoothstep(0.26, 0.58, p));
}

function baselineEmissions(x: number) {
  const plateau = 0.2 + Math.sin(x * Math.PI * 0.9 + 0.4) * 0.04;
  const rise = Math.pow(x, 0.55) * 0.38;
  return clamp01(plateau + rise);
}

function targetEmissions(x: number) {
  const glide = 0.14 + x * 0.58;
  const ripple = Math.sin(x * Math.PI * 2.1) * 0.018 * (1 - x);
  return clamp01(glide + ripple);
}

function emissionsAt(x: number, reduction: number) {
  return lerp(baselineEmissions(x), targetEmissions(x), reduction);
}

function buildCurvePath(reduction: number, w: number, h: number, padX: number, padY: number) {
  const steps = 48;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const x = padX + t * innerW;
    const y = padY + emissionsAt(t, reduction) * innerH;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function buildAreaPath(reduction: number, w: number, h: number, padX: number, padY: number) {
  const line = buildCurvePath(reduction, w, h, padX, padY);
  return `${line} L ${w - padX} ${h - padY} L ${padX} ${h - padY} Z`;
}

function formatMetric(m: (typeof METRICS)[number], reduction: number) {
  const val = lerp(m.from, m.to, reduction);
  const decimals = "decimals" in m ? m.decimals : 0;
  const prefix = "prefix" in m ? m.prefix : "";
  const suffix = "suffix" in m ? m.suffix : "";
  return `${prefix}${val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
}

function CarbonChart({ reduction, reveal }: { reduction: number; reveal: number }) {
  const gradId = useId().replace(/:/g, "");
  const w = 640;
  const h = 360;
  const padX = 36;
  const padY = 40;
  const linePath = useMemo(() => buildCurvePath(reduction, w, h, padX, padY), [reduction]);
  const areaPath = useMemo(() => buildAreaPath(reduction, w, h, padX, padY), [reduction]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={ACCENT_BRIGHT} stopOpacity={0.4} />
          <stop offset="100%" stopColor={BG_MID} stopOpacity={0} />
        </linearGradient>
      </defs>
      {Array.from({ length: 4 }, (_, i) => {
        const y = padY + (i / 3) * (h - padY * 2);
        return <line key={i} x1={padX} y1={y} x2={w - padX} y2={y} stroke="rgba(134,239,172,0.1)" strokeDasharray="4 8" />;
      })}
      <path d={areaPath} fill={`url(#${gradId})`} opacity={reveal} />
      <path
        d={linePath}
        fill="none"
        stroke={ACCENT_BRIGHT}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={reveal}
      />
      {[0.33, 0.66].map((mx) => {
        const x = padX + mx * (w - padX * 2);
        const y = padY + emissionsAt(mx, reduction) * (h - padY * 2);
        return <circle key={mx} cx={x} cy={y} r={4} fill={MINT} opacity={reveal * 0.9} />;
      })}
    </svg>
  );
}

function ScreenFrame({
  children,
  tilt = 0,
  scale = 1,
}: {
  children: ReactNode;
  tilt?: number;
  scale?: number;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[min(100%,520px)]"
      style={{ transform: `perspective(900px) rotateY(${tilt}deg) scale(${scale})`, transformStyle: "preserve-3d" }}
    >
      <div
        className="rounded-xl p-[10px] sm:p-3"
        style={{
          background: "linear-gradient(145deg, #1a2e28 0%, #0a1512 50%, #1a2e28 100%)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(134,239,172,0.12)",
        }}
      >
        <div className="overflow-hidden rounded-lg" style={{ background: BG_MID }}>
          <div
            className="flex items-center gap-2 border-b px-3 py-2"
            style={{ borderColor: "rgba(134,239,172,0.12)", background: "rgba(0,0,0,0.25)" }}
          >
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber-300/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
            <span className="ml-2 font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
              SmartZero™ · Net-Zero pathway
            </span>
          </div>
          <div className="relative aspect-[16/10] w-full">{children}</div>
          <div
            className="flex justify-between border-t px-3 py-1.5 font-mono text-[8px] uppercase tracking-wider"
            style={{ borderColor: "rgba(134,239,172,0.08)", color: MUTED }}
          >
            <span>Emissions</span>
            <span>Live</span>
          </div>
        </div>
      </div>
      <div
        className="mx-auto -mt-1 h-3 w-[42%] rounded-b-md"
        style={{ background: "linear-gradient(180deg, #1a2e28, #0a1512)" }}
      />
      <div
        className="mx-auto h-1.5 w-[18%] rounded-full"
        style={{ background: "#1a2e28", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
      />
    </div>
  );
}

function ChapterSlide({
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
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        zIndex,
        transform: `translateY(${lerp(105, 0, rise)}%)`,
        willChange: rise > 0 && rise < 1 ? "transform" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function SiteHeader({ progress }: { progress: number }) {
  const opaque = smoothstep(0.04, 0.12, progress);
  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-[300] flex items-center justify-between px-6 py-5 sm:px-10"
      style={{
        background: `rgba(6,22,18,${lerp(0, 0.92, opaque)})`,
        borderBottom: `1px solid rgba(134,239,172,${lerp(0, 0.1, opaque)})`,
        backdropFilter: opaque > 0.3 ? "blur(8px)" : undefined,
      }}
    >
      <span className="text-sm font-semibold tracking-tight" style={{ color: TEXT }}>
        Reventador
      </span>
      <nav className="hidden gap-6 font-mono text-[10px] uppercase tracking-[0.2em] sm:flex" style={{ color: MUTED }}>
        <span>Solutions</span>
        <span>SmartZero™</span>
        <span>Process</span>
      </nav>
      <span
        className="rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-widest"
        style={{ borderColor: `${ACCENT_BRIGHT}44`, color: ACCENT_SOFT }}
      >
        Request demo
      </span>
    </header>
  );
}

export default function ReventadorCarbonCurve() {
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((p: number) => setProgress(p), []);

  const riseBenefits = panelRise(progress, 0.1, 0.2);
  const riseSolutions = panelRise(progress, 0.18, 0.3);
  const riseSmartZero = panelRise(progress, 0.28, 0.4);
  const riseModules = panelRise(progress, 0.38, 0.5);
  const riseProcess = panelRise(progress, 0.48, 0.6);
  const riseCompare = panelRise(progress, 0.58, 0.7);
  const riseStats = panelRise(progress, 0.68, 0.8);
  const riseCta = panelRise(progress, 0.78, 0.9);

  const reduction = curveReduction(progress);
  const chartReveal = smoothstep(0.3, 0.45, progress);
  const benefitIndex = Math.min(2, Math.floor(smoothstep(0.1, 0.2, progress) * 3));
  const moduleIndex = Math.min(MODULES.length - 1, Math.floor(smoothstep(0.4, 0.5, progress) * MODULES.length));
  const processFocus = Math.min(3, Math.floor(smoothstep(0.5, 0.6, progress) * 4));
  const monitorTilt = lerp(8, -4, smoothstep(0.28, 0.42, progress));
  const monitorScale = lerp(0.88, 1, smoothstep(0.28, 0.38, progress));

  const heroFade = 1 - smoothstep(0.08, 0.18, progress);

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#ecfdf5]"
      hint="↓ 스크롤 — Reventador chapters"
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: BG }}>
        <SiteHeader progress={progress} />

        {/* Ch 0 — Hero */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 pb-16 sm:px-12 sm:pb-20"
          style={{
            opacity: heroFade,
            background: `radial-gradient(ellipse 100% 70% at 50% 20%, ${BG_MID} 0%, ${BG} 60%)`,
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT_SOFT }}>
            Industrial decarbonisation
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-light leading-[1.08] tracking-tight sm:text-5xl md:text-6xl" style={{ color: TEXT }}>
            Activate situation awareness for your sustainability journey
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: MUTED }}>
            It&apos;s not about the destination — choose the right flight path. Be guided ahead in a constantly evolving environment.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <span className="h-px w-8" style={{ background: ACCENT_BRIGHT }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
              Scroll
            </span>
          </div>
        </div>

        {/* Ch 1 — Benefits marquee */}
        <ChapterSlide rise={riseBenefits} zIndex={20}>
          <div
            className="flex h-full flex-col justify-center px-6 sm:px-12"
            style={{ background: `linear-gradient(160deg, ${BG} 0%, ${BG_MID} 100%)` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
              Sustainability solutions
            </p>
            <div className="relative mt-8 min-h-[120px] max-w-4xl">
              {BENEFITS.map((line, i) => {
                const active = i === benefitIndex;
                const near = Math.abs(i - benefitIndex) <= 1;
                return (
                  <h2
                    key={line}
                    className="absolute inset-x-0 text-2xl font-light leading-tight transition-none sm:text-4xl md:text-5xl"
                    style={{
                      color: active ? TEXT : MUTED,
                      opacity: active ? 1 : near ? 0.25 : 0,
                      transform: `translateY(${(i - benefitIndex) * 28}px)`,
                    }}
                  >
                    {line}
                  </h2>
                );
              })}
            </div>
          </div>
        </ChapterSlide>

        {/* Ch 2 — Solutions trio */}
        <ChapterSlide rise={riseSolutions} zIndex={30}>
          <div className="flex h-full flex-col justify-center px-6 py-20 sm:px-12" style={{ background: BG_LIGHT, color: TEXT_DARK }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: MUTED_LIGHT }}>
              Three pillars
            </p>
            <h2 className="mt-3 max-w-lg text-3xl font-light sm:text-4xl">Tools, tech and expertise to deliver sustainability</h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {SOLUTIONS.map((s, i) => {
                const reveal = smoothstep(0.18 + i * 0.04, 0.28 + i * 0.04, progress);
                return (
                  <article
                    key={s.tag}
                    className="rounded-lg border p-6"
                    style={{
                      borderColor: "rgba(45,159,111,0.2)",
                      background: "#fff",
                      opacity: reveal,
                      transform: `translateY(${(1 - reveal) * 24}px)`,
                    }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
                      {s.tag}
                    </p>
                    <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED_LIGHT }}>
                      {s.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </ChapterSlide>

        {/* Ch 3 — SmartZero + monitor chart */}
        <ChapterSlide rise={riseSmartZero} zIndex={40}>
          <div
            className="flex h-full flex-col justify-center gap-10 px-6 py-20 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12"
            style={{ background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${BG_MID} 0%, ${BG} 70%)` }}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT_SOFT }}>
                SmartZero™ Software
              </p>
              <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl" style={{ color: TEXT }}>
                Drive sustainability from your single mission control
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
                Scroll to bend the emissions curve inside the platform — adapt your net-zero pathway in real time.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {METRICS.map((m) => (
                  <div key={m.label}>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MUTED }}>
                      {m.label}
                    </p>
                    <p className="font-mono text-lg tabular-nums" style={{ color: MINT }}>
                      {formatMetric(m, reduction)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <ScreenFrame tilt={monitorTilt} scale={monitorScale}>
              <CarbonChart reduction={reduction} reveal={chartReveal} />
            </ScreenFrame>
          </div>
        </ChapterSlide>

        {/* Ch 4 — Module hub */}
        <ChapterSlide rise={riseModules} zIndex={50}>
          <div className="flex h-full flex-col justify-center px-6 py-20 sm:px-12" style={{ background: BG_LIGHT, color: TEXT_DARK }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: MUTED_LIGHT }}>
              Interactive hub
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-light sm:text-4xl">Explore SmartZero™ modules</h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {MODULES.map((mod, i) => {
                const active = i === moduleIndex;
                return (
                  <span
                    key={mod}
                    className="rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors"
                    style={{
                      borderColor: active ? ACCENT : "rgba(45,159,111,0.25)",
                      background: active ? ACCENT : "#fff",
                      color: active ? "#fff" : MUTED_LIGHT,
                    }}
                  >
                    {mod}
                  </span>
                );
              })}
            </div>
            <div
              className="mt-10 rounded-xl border p-6 sm:p-8"
              style={{ borderColor: "rgba(45,159,111,0.2)", background: "#fff" }}
            >
              <h3 className="text-xl font-medium">{MODULES[moduleIndex]}</h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed" style={{ color: MUTED_LIGHT }}>
                {moduleIndex < 3
                  ? "Simple navigation across your global enterprise — live site status in under 60 seconds."
                  : moduleIndex < 6
                    ? "Monitoring and management with best-in-sector analytics and clear loss & waste guidance."
                    : "Automated reporting, roadmaps and digital twins — scalable across single sites or enterprise-wide."}
              </p>
              <span
                className="mt-6 inline-block rounded-full px-5 py-2 text-[10px] font-medium uppercase tracking-widest"
                style={{ background: ACCENT, color: "#fff" }}
              >
                Request demo
              </span>
            </div>
          </div>
        </ChapterSlide>

        {/* Ch 5 — 4-step process */}
        <ChapterSlide rise={riseProcess} zIndex={60}>
          <div className="flex h-full flex-col justify-center px-6 py-20 sm:px-12" style={{ background: BG }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT_SOFT }}>
              Phased process
            </p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl" style={{ color: TEXT }}>
              Our 4-step process
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map((step, i) => {
                const active = i === processFocus;
                const reveal = smoothstep(0.5 + i * 0.02, 0.56 + i * 0.02, progress);
                return (
                  <article
                    key={step.num}
                    className="rounded-lg border p-5"
                    style={{
                      borderColor: active ? `${ACCENT_BRIGHT}55` : "rgba(134,239,172,0.12)",
                      background: active ? "rgba(45,159,111,0.12)" : "rgba(255,255,255,0.03)",
                      opacity: reveal,
                      transform: `translateY(${(1 - reveal) * 16}px)`,
                    }}
                  >
                    <span className="font-mono text-3xl font-light" style={{ color: active ? ACCENT_BRIGHT : MUTED }}>
                      {step.num}
                    </span>
                    <h3 className="mt-2 text-lg font-medium" style={{ color: TEXT }}>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: MUTED }}>
                      {step.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </ChapterSlide>

        {/* Ch 6 — Comparison */}
        <ChapterSlide rise={riseCompare} zIndex={70}>
          <div className="flex h-full flex-col justify-center px-6 py-20 sm:px-12" style={{ background: BG_LIGHT, color: TEXT_DARK }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: MUTED_LIGHT }}>
              Reventador vs. Alternatives
            </p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">Why Reventador?</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border p-6" style={{ borderColor: `${ACCENT}44`, background: "#fff" }}>
                <h3 className="font-mono text-xs uppercase tracking-widest" style={{ color: ACCENT }}>
                  Reventador
                </h3>
                <ul className="mt-4 space-y-3">
                  {COMPARE.reventador.map((line) => (
                    <li key={line} className="flex gap-2 text-sm leading-relaxed">
                      <span style={{ color: ACCENT }}>✓</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border p-6" style={{ borderColor: "rgba(0,0,0,0.08)", background: BG_LIGHT_MID }}>
                <h3 className="font-mono text-xs uppercase tracking-widest" style={{ color: MUTED_LIGHT }}>
                  Alternatives
                </h3>
                <ul className="mt-4 space-y-3">
                  {COMPARE.alt.map((line) => (
                    <li key={line} className="flex gap-2 text-sm leading-relaxed" style={{ color: MUTED_LIGHT }}>
                      <span className="opacity-50">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ChapterSlide>

        {/* Ch 7 — Stats */}
        <ChapterSlide rise={riseStats} zIndex={80}>
          <div
            className="flex h-full flex-col justify-center px-6 py-20 sm:px-12"
            style={{ background: `linear-gradient(180deg, ${BG_MID} 0%, ${BG} 100%)` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT_SOFT }}>
              Impact
            </p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl" style={{ color: TEXT }}>
              The experience propelling Reventador forward
            </h2>
            <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
              {STATS.map((s, i) => {
                const reveal = smoothstep(0.7 + i * 0.02, 0.76 + i * 0.02, progress);
                return (
                  <div key={s.label} style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 20}px)` }}>
                    <p className="font-mono text-4xl font-light tabular-nums sm:text-5xl" style={{ color: ACCENT_BRIGHT }}>
                      {s.value}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: MUTED }}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 max-w-xs">
              <ScreenFrame tilt={-2} scale={0.72}>
                <CarbonChart reduction={Math.min(1, reduction + 0.15)} reveal={0.95} />
              </ScreenFrame>
            </div>
          </div>
        </ChapterSlide>

        {/* Ch 8 — CTA */}
        <ChapterSlide rise={riseCta} zIndex={90}>
          <div
            className="flex h-full flex-col items-center justify-center px-6 py-20 text-center sm:px-12"
            style={{ background: BG }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT_SOFT }}>
              Clearance for takeoff
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-light leading-tight sm:text-5xl" style={{ color: TEXT }}>
              Get your clearance for takeoff today
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
              Request your no-obligation personalised sustainability report — free remote desktop study across your sites.
            </p>
            <span
              className="mt-10 inline-block rounded-full px-8 py-3 text-[11px] font-medium uppercase tracking-[0.25em]"
              style={{ background: ACCENT_BRIGHT, color: BG }}
            >
              Request demo
            </span>
            <p className="mt-16 max-w-lg text-xs leading-relaxed" style={{ color: MUTED }}>
              Reventador and SmartZero™ weren&apos;t created out of convenience — they were born out of necessity.
            </p>
          </div>
        </ChapterSlide>

        {/* Chapter progress rail */}
        <div className="pointer-events-none absolute bottom-8 right-6 z-[200] flex flex-col gap-1">
          {[riseBenefits, riseSolutions, riseSmartZero, riseModules, riseProcess, riseCompare, riseStats, riseCta].map((r, i) => (
            <span
              key={i}
              className="h-0.5 rounded-full transition-all"
              style={{
                width: r > 0.5 ? 16 : 8,
                background: r > 0.5 ? ACCENT_BRIGHT : "rgba(134,239,172,0.25)",
              }}
            />
          ))}
        </div>
      </div>
    </LabStickyScroll>
  );
}
