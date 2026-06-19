"use client";

import HirotoSatoTrack from "./HirotoSatoTrack";
import FadeInSection from "@/components/FadeInSection";

function WireframePlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-border text-center text-xs uppercase tracking-wide text-text-muted ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 14px)",
      }}
    >
      {label}
    </div>
  );
}

const SPORT_QUOTES = [
  "“진전은 항상 보이지 않는 거리부터 시작된다.”",
  "“한 걸음의 기록이 모여 하나의 트랙이 된다.”",
  "“멈추지 않는 한, 모든 거리는 의미가 있다.”",
];

export default function HirotoSatoSample() {
  return (
    <div className="flex flex-col">
      {/* Wireframe top nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg-primary/90 px-6 py-4 backdrop-blur">
        <WireframePlaceholder label="LOGO" className="h-8 w-24" />
        <div className="hidden gap-3 sm:flex">
          <WireframePlaceholder label="WORK" className="h-8 w-16" />
          <WireframePlaceholder label="ABOUT" className="h-8 w-16" />
          <WireframePlaceholder label="CONTACT" className="h-8 w-20" />
        </div>
      </header>

      {/* Hero */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Hiroto Sato — Style Sample
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-text-primary sm:text-7xl">
          TRACK
        </h1>
        <p className="mx-auto mt-6 max-w-md text-text-secondary">
          스크롤 거리에 전진을 연동시킨 내러티브 실험. 아래로 스크롤해
          트랙을 달려보세요.
        </p>
        <div className="mt-10 text-xs text-text-muted">↓ scroll to run</div>
      </section>

      {/* Main scroll-driven 3D experience (the real implementation) */}
      <FadeInSection className="mx-auto w-full max-w-[1100px] px-6">
        <HirotoSatoTrack />
      </FadeInSection>

      {/* Stopwatch / stats wireframe section */}
      <FadeInSection className="mx-auto w-full max-w-[1100px] px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <WireframePlaceholder label="STOPWATCH UI" className="h-40" />
          <WireframePlaceholder label="METER COUNTER" className="h-40" />
          <WireframePlaceholder label="PACE GRAPH" className="h-40" />
        </div>
      </FadeInSection>

      {/* Quote reveal placeholders */}
      <FadeInSection className="mx-auto w-full max-w-[800px] px-6 py-24 text-center">
        <div className="space-y-12">
          {SPORT_QUOTES.map((quote) => (
            <p
              key={quote}
              className="text-2xl font-semibold text-text-primary sm:text-3xl"
            >
              {quote}
            </p>
          ))}
        </div>
      </FadeInSection>

      {/* Closing image placeholder */}
      <FadeInSection className="mx-auto w-full max-w-[1100px] px-6 py-24">
        <WireframePlaceholder
          label="CLOSING VISUAL / RUNNER PORTRAIT"
          className="h-[50vh] w-full"
        />
      </FadeInSection>

      {/* Footer wireframe */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 sm:flex-row">
          <WireframePlaceholder label="LOGO" className="h-8 w-24" />
          <div className="flex gap-3">
            <WireframePlaceholder label="IG" className="h-8 w-8" />
            <WireframePlaceholder label="X" className="h-8 w-8" />
            <WireframePlaceholder label="MAIL" className="h-8 w-8" />
          </div>
        </div>
      </footer>
    </div>
  );
}
