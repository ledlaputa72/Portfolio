"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const LIGHT = "#f3f3f3";
const WARM = "#fef9ee";
const WARM_PEAK = "#fff4e6";
const NAVY = "#0b1622";
const TEAL = "#2dd4bf";
const TEXT = "#111827";
const MUTED = "#6b7280";

const SCROLL_VH = 3400;

const ESSENTIALS = [
  "Réfrigérateur / congélateur",
  "Internet + routeur",
  "Éclairage de base",
  "Pompe de puisard / circulateur",
  "Appareils essentiels (selon votre priorité)",
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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function rise(p: number, start: number, end: number) {
  return easeInOutCubic(smoothstep(start, end, p));
}

function slideY(t: number, offset = 0) {
  return lerp(108 + offset, 0, t);
}

function HouseHero() {
  return (
    <svg viewBox="0 0 420 320" className="mx-auto h-[min(52vh,380px)] w-full max-w-[480px]" aria-hidden>
      <defs>
        <linearGradient id="cn-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#f3f3f3" />
        </linearGradient>
      </defs>
      <rect width="420" height="320" fill="url(#cn-sky)" />
      <ellipse cx="210" cy="268" rx="150" ry="18" fill="rgba(0,0,0,0.06)" />
      <path d="M 80 230 L 210 120 L 340 230 Z" fill="#3d4450" />
      <rect x="110" y="170" width="200" height="90" fill="#eceff3" stroke="#c5cad3" strokeWidth="1" />
      <rect x="125" y="148" width="170" height="28" fill="#2f3640" rx="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={132 + i * 40} y="152" width="32" height="18" fill="#1e3a5f" opacity="0.85" />
      ))}
      <circle cx="210" cy="138" r="14" fill={TEAL} opacity="0.9" />
      <circle cx="210" cy="138" r="22" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.35" />
      <rect x="155" y="205" width="36" height="55" fill="#8b919c" />
      <rect x="228" y="205" width="36" height="55" fill="#8b919c" />
      <path d="M 60 230 L 360 230 L 380 250 L 40 250 Z" fill="#b8b0a4" />
      <ellipse cx="95" cy="218" rx="22" ry="30" fill="#4a7c59" />
      <ellipse cx="325" cy="218" rx="22" ry="30" fill="#4a7c59" />
    </svg>
  );
}

function SolarSystemIso() {
  return (
    <svg viewBox="0 0 360 280" className="h-[min(42vh,300px)] w-full max-w-[400px]" aria-hidden>
      <defs>
        <linearGradient id="cn-panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect x="40" y="180" width="80" height="24" rx="6" fill="#1f2937" />
      <path d="M 50 100 L 110 70 L 170 100 L 110 130 Z" fill="url(#cn-panel)" stroke="#cbd5e1" />
      <rect x="95" y="85" width="30" height="40" fill="#94a3b8" />
      <path d="M 120 192 L 200 192 L 200 168" stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="200" y="168" width="70" height="36" rx="6" fill="#1f2937" />
      <rect x="212" y="176" width="46" height="20" rx="3" fill="#f8fafc" />
      <circle cx="235" cy="186" r="6" fill="#e2e8f0" stroke="#94a3b8" />
      <path d="M 270 186 L 290 186" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
      <rect x="290" y="120" width="56" height="94" rx="6" fill="#1f2937" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="296" y={126 + i * 28} width="44" height="22" rx="3" fill="#f8fafc" />
          <text x="318" y={141 + i * 28} textAnchor="middle" fontSize="6" fill="#64748b" fontFamily="sans-serif">
            CLIMANOVA
          </text>
        </g>
      ))}
    </svg>
  );
}

function ModuleStack() {
  return (
    <svg viewBox="0 0 120 320" className="h-[min(50vh,340px)] w-auto" aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="20" y={260 - i * 44} width="80" height="38" rx="6" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
          <line x1="28" y1={270 - i * 44} x2="92" y2={270 - i * 44} stroke="#9ca3af" strokeWidth="0.5" />
          <line x1="28" y1={278 - i * 44} x2="92" y2={278 - i * 44} stroke="#9ca3af" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  );
}

function LivingCutaway() {
  return (
    <svg viewBox="0 0 360 280" className="h-[min(42vh,300px)] w-full max-w-[400px]" aria-hidden>
      <rect x="30" y="40" width="300" height="200" fill="#f5efe6" stroke="#e7dfd4" />
      <rect x="30" y="200" width="300" height="50" fill="#d6d3d1" />
      <rect x="50" y="60" width="12" height="140" fill="#e7dfd4" />
      <rect x="50" y="100" width="55" height="70" fill="#f8fafc" stroke="#cbd5e1" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="56" y={106 + i * 20} width="43" height="14" rx="2" fill="#fff" stroke="#e2e8f0" />
      ))}
      <rect x="130" y="150" width="90" height="36" rx="8" fill="#a8a29e" />
      <rect x="240" y="80" width="70" height="90" fill="#bae6fd" opacity="0.5" />
      <ellipse cx="200" cy="230" rx="80" ry="12" fill="rgba(0,0,0,0.05)" />
    </svg>
  );
}

function ClimaLogo({ size = 48 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${TEAL}44 0%, transparent 70%)`,
        boxShadow: `0 0 24px ${TEAL}55`,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <path d="M8 14 Q12 6 16 14 Q12 18 8 14" fill="none" stroke={TEAL} strokeWidth="1.5" />
        <path d="M9 12 Q12 8 15 12" fill="none" stroke={TEAL} strokeWidth="1" opacity="0.6" />
      </svg>
    </div>
  );
}

function ScrollPanel({
  panelRise,
  zIndex,
  bg = LIGHT,
  children,
  gradient,
}: {
  panelRise: number;
  zIndex: number;
  bg?: string;
  children: ReactNode;
  gradient?: string;
}) {
  if (panelRise < 0.002) return null;
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        zIndex,
        transform: `translateY(${slideY(panelRise)}%)`,
        background: gradient ?? bg,
      }}
    >
      {children}
    </div>
  );
}

function SplitBlock({
  textRise,
  visualRise,
  reverse = false,
  dark = false,
  text,
  visual,
}: {
  textRise: number;
  visualRise: number;
  reverse?: boolean;
  dark?: boolean;
  text: ReactNode;
  visual: ReactNode;
}) {
  const textBlock = (
    <div
      className="flex flex-col justify-center px-6 sm:px-10 lg:px-16"
      style={{ transform: `translateY(${slideY(textRise, 8)}%)` }}
    >
      {text}
    </div>
  );
  const visualBlock = (
    <div
      className="flex items-center justify-center px-4 sm:px-8"
      style={{ transform: `translateY(${slideY(visualRise, -6)}%)` }}
    >
      {visual}
    </div>
  );

  return (
    <div
      className={`grid h-full grid-cols-1 items-center gap-6 lg:grid-cols-2 ${reverse ? "lg:[direction:rtl]" : ""}`}
      style={{ color: dark ? "#fff" : TEXT }}
    >
      <div className={reverse ? "lg:[direction:ltr]" : ""}>{textBlock}</div>
      <div className={reverse ? "lg:[direction:ltr]" : ""}>{visualBlock}</div>
    </div>
  );
}

export default function ClimaNovaEnergyFlow() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(p);
  }, []);

  const r = (start: number, end: number) => rise(progress, start, end);

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#111827]"
      hint={locale === "ko" ? "↓ 스크롤 — 섹션이 아래에서 올라옵니다" : "↓ Scroll — sections rise up from below"}
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: LIGHT }}>
        {/* 1 · Hero — stays pinned; later panels slide over */}
        <ScrollPanel panelRise={1} zIndex={10} bg={LIGHT}>
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between px-6 py-5 sm:px-10">
              <span className="text-sm font-bold tracking-[0.2em]" style={{ color: TEXT }}>
                CLIMANOVA
              </span>
              <span className="hidden rounded-full border border-black/10 px-4 py-1.5 text-[10px] sm:inline" style={{ color: MUTED }}>
                Contactez-nous
              </span>
            </header>
            <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16">
              <div style={{ transform: `translateY(${slideY(r(0, 0.08), 12)}%)` }}>
                <HouseHero />
              </div>
              <h1
                className="pointer-events-none absolute inset-x-0 top-[38%] text-center text-3xl font-medium leading-tight sm:text-5xl"
                style={{
                  color: "#fff",
                  textShadow: "0 2px 24px rgba(0,0,0,0.25)",
                  transform: `translateY(${slideY(r(0.01, 0.09), 6)}%)`,
                }}
              >
                Prenez le contrôle
                <br />
                de votre énergie
              </h1>
              <p
                className="mt-auto font-mono text-[10px] uppercase tracking-[0.35em]"
                style={{ color: MUTED, transform: `translateY(${slideY(r(0.02, 0.1), 4)}%)` }}
              >
                Défilez pour vivre l&apos;expérience Climanova
              </p>
            </div>
          </div>
        </ScrollPanel>

        {/* 2 · Jour — texte + iso */}
        <ScrollPanel
          panelRise={r(0.08, 0.18)}
          zIndex={20}
          bg={WARM}
          gradient={`linear-gradient(135deg, ${WARM} 0%, #fef3c7 100%)`}
        >
          <SplitBlock
            textRise={r(0.09, 0.17)}
            visualRise={r(0.1, 0.18)}
            text={
              <p className="max-w-md text-lg leading-relaxed sm:text-xl" style={{ color: TEXT }}>
                Pendant la journée, votre système solaire alimente la maison tout en rechargeant les
                batteries. L&apos;énergie excédentaire est réinjectée au réseau.
              </p>
            }
            visual={<SolarSystemIso />}
          />
        </ScrollPanel>

        {/* 3 · Jour (variant) */}
        <ScrollPanel panelRise={r(0.16, 0.26)} zIndex={30} bg={WARM}>
          <SplitBlock
            reverse
            textRise={r(0.17, 0.25)}
            visualRise={r(0.18, 0.26)}
            text={
              <p className="max-w-md text-lg leading-relaxed sm:text-xl">
                Durant la journée, l&apos;énergie produite par vos panneaux solaires alimente votre maison
                et recharge vos batteries.
              </p>
            }
            visual={<SolarSystemIso />}
          />
        </ScrollPanel>

        {/* 4 · Pointe */}
        <ScrollPanel
          panelRise={r(0.24, 0.34)}
          zIndex={40}
          gradient={`linear-gradient(160deg, #fff 0%, ${WARM_PEAK} 55%, #fed7aa 100%)`}
        >
          <SplitBlock
            textRise={r(0.25, 0.33)}
            visualRise={r(0.26, 0.34)}
            text={
              <p className="max-w-md text-lg leading-relaxed sm:text-xl">
                En soirée ou durant les périodes de pointe, l&apos;énergie stockée alimente
                automatiquement les circuits essentiels de la maison.
              </p>
            }
            visual={<SolarSystemIso />}
          />
        </ScrollPanel>

        {/* 5 · Nuit */}
        <ScrollPanel panelRise={r(0.32, 0.42)} zIndex={50} bg={NAVY}>
          <SplitBlock
            dark
            reverse
            textRise={r(0.33, 0.41)}
            visualRise={r(0.34, 0.42)}
            text={
              <p className="max-w-md text-lg leading-relaxed sm:text-xl text-white/90">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white" />
                Durant la nuit, l&apos;énergie accumulée durant la journée continue d&apos;alimenter votre
                maison.
              </p>
            }
            visual={<SolarSystemIso />}
          />
        </ScrollPanel>

        {/* 6 · Système commence */}
        <ScrollPanel panelRise={r(0.4, 0.5)} zIndex={60} bg={NAVY}>
          <div
            className="flex h-full flex-col items-center justify-center px-6 text-center"
            style={{ transform: `translateY(${slideY(r(0.41, 0.49))}%)` }}
          >
            <h2 className="text-3xl font-medium text-white sm:text-5xl">Votre système commence ici.</h2>
            <p className="mt-8 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
              Pannes de courant, tempêtes, froid extrême. Au Québec, l&apos;électricité n&apos;est pas un
              confort
            </p>
            <p className="mt-4 text-lg font-medium sm:text-xl" style={{ color: TEAL }}>
              C&apos;est une nécessité.
            </p>
          </div>
        </ScrollPanel>

        {/* 7 · Logo + mission */}
        <ScrollPanel panelRise={r(0.48, 0.58)} zIndex={70} bg={NAVY}>
          <div
            className="flex h-full flex-col items-center justify-center px-6 text-center"
            style={{ transform: `translateY(${slideY(r(0.49, 0.57))}%)` }}
          >
            <div className="mb-6 h-16 w-px" style={{ background: `linear-gradient(${TEAL}, transparent)` }} />
            <ClimaLogo size={56} />
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
              Climanova conçoit des systèmes énergétiques capables de maintenir votre maison en vie
              lorsque le réseau tombe.
            </p>
            <div className="mt-6 h-8 w-px opacity-40" style={{ background: TEAL }} />
          </div>
        </ScrollPanel>

        {/* 8 · Tout continue */}
        <ScrollPanel panelRise={r(0.56, 0.66)} zIndex={80} bg={NAVY}>
          <div
            className="flex h-full flex-col items-center justify-center px-6 text-center"
            style={{ transform: `translateY(${slideY(r(0.57, 0.65), 10)}%)` }}
          >
            <div className="mb-4 h-12 w-px" style={{ background: TEAL }} />
            <p className="text-sm text-white/55 sm:text-base">Frigo. Pompes. Cuisine</p>
            <h2 className="mt-4 text-3xl font-medium text-white sm:text-5xl">Tout continue de fonctionner.</h2>
          </div>
        </ScrollPanel>

        {/* 9 · Modules */}
        <ScrollPanel panelRise={r(0.64, 0.74)} zIndex={90} bg={NAVY}>
          <div className="grid h-full grid-cols-1 items-center gap-8 px-6 sm:px-12 lg:grid-cols-2">
            <div style={{ transform: `translateY(${slideY(r(0.65, 0.73), 8)}%)` }}>
              <ClimaLogo size={44} />
              <h2 className="mt-6 text-2xl font-medium text-white sm:text-4xl">
                Chaque module augmente votre autonomie.
              </h2>
              <p className="mt-4 text-sm text-white/50">Votre autonomie se construit module par module.</p>
            </div>
            <div
              className="flex justify-center lg:justify-end"
              style={{ transform: `translateY(${slideY(r(0.66, 0.74), -10)}%)` }}
            >
              <ModuleStack />
            </div>
          </div>
        </ScrollPanel>

        {/* 10 · Panne — essentials */}
        <ScrollPanel panelRise={r(0.72, 0.82)} zIndex={100} bg="#ffffff">
          <SplitBlock
            reverse
            textRise={r(0.73, 0.81)}
            visualRise={r(0.74, 0.82)}
            text={
              <div>
                <h2 className="text-2xl font-medium leading-snug sm:text-3xl">
                  Quand tout s&apos;éteint, votre{" "}
                  <span style={{ color: TEAL }}>énergie stockée</span> prend le relais sur ce qui compte.
                </h2>
                <p className="mt-6 text-sm" style={{ color: MUTED }}>
                  Alimentez les branchements qui assurent votre confort, comme:
                </p>
                <ul className="mt-4 space-y-3">
                  {ESSENTIALS.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <span className="h-4 w-1 rounded-full bg-black" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            }
            visual={<LivingCutaway />}
          />
        </ScrollPanel>

        {/* 11 · Résidentiel */}
        <ScrollPanel
          panelRise={r(0.8, 0.9)}
          zIndex={110}
          gradient={`linear-gradient(180deg, #f2ebe3 0%, #fff 100%)`}
        >
          <div className="grid h-full grid-cols-1 items-center gap-8 px-6 sm:px-12 lg:grid-cols-2">
            <div style={{ transform: `translateY(${slideY(r(0.81, 0.89), 6)}%)` }}>
              <h2 className="text-2xl font-medium leading-snug sm:text-4xl">
                L&apos;énergie résidentielle,
                <br />
                repensée pour les réalités d&apos;ici.
              </h2>
            </div>
            <div
              className="flex justify-center"
              style={{ transform: `translateY(${slideY(r(0.82, 0.9), -8)}%)` }}
            >
              <SolarSystemIso />
            </div>
          </div>
        </ScrollPanel>

        {/* 12 · CTA */}
        <ScrollPanel panelRise={r(0.88, 0.98)} zIndex={120} bg="#ffffff">
          <div
            className="flex h-full flex-col items-center justify-center px-6 text-center"
            style={{ transform: `translateY(${slideY(r(0.89, 0.97))}%)` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: MUTED }}>
              Conçu pour l&apos;imprévu
            </p>
            <h2 className="mt-6 text-3xl font-medium sm:text-5xl">
              Maîtrisez votre énergie.
              <br />
              <span style={{ color: TEAL }}>Sans interruption.</span>
            </h2>
            <span
              className="mt-10 rounded-full border px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ borderColor: TEAL, color: TEAL }}
            >
              Évaluation gratuite
            </span>
          </div>
        </ScrollPanel>

        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ opacity: 1 - smoothstep(0.12, 0.2, progress) }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2937] text-white text-xs">
            ↓
          </div>
        </div>
      </div>
    </LabStickyScroll>
  );
}
