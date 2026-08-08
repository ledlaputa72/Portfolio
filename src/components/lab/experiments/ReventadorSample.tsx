"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import ReventadorCarbonCurve from "./ReventadorCarbonCurve";

const PILLARS = [
  "9 scroll chapters — hero → benefits → solutions → SmartZero monitor → modules → process → compare → stats → CTA",
  "Light/dark layout alternation matching reventador.global editorial rhythm",
  "Carbon chart lives inside monitor bezel frame — not full-screen background",
  "Slide-up chapter transitions with scroll-scrubbed metrics and module tabs",
];

export default function ReventadorSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col" style={{ background: "#061612", color: "#ecfdf5" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#061612]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Reventador</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          SmartZero™
        </span>
      </header>

      <section className="mx-auto flex min-h-[45vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
          Reventador — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Industrial
          <br />
          <span style={{ color: ACCENT }}>decarbonisation</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/50">
          {locale === "ko"
            ? "레퍼런스처럼 스크롤마다 전체 화면 챕터가 슬라이드업되며, 탄소 차트는 모니터 액자 안에서만 동작합니다."
            : "Like the reference, full-screen chapters slide up with each scroll, while the carbon chart operates only inside the monitor bezel frame."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-white/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-white/30">↓ scroll — carbon curve · metrics · chapters</div>
      </section>

      <ReventadorCarbonCurve />

      <footer className="border-t border-white/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-white/35">reventador.global ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            carbon curve · count-up · green gradient
          </p>
        </div>
      </footer>
    </div>
  );
}

const ACCENT = "#4ade80";
