"use client";

import RazorpaySprintTrack from "./RazorpaySprintTrack";
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

const SPRINT_QUOTES = [
  "“결제는 더 이상 마지막 단계가 아니라, 쇼퍼의 여정 그 자체다.”",
  "“두 가지 색으로도 100개의 순간을 설계할 수 있다.”",
  "“클릭 한 번, 트리거 하나, 그리고 다음 장면.”",
];

export default function RazorpaySprintSample() {
  return (
    <div className="flex flex-col">
      {/* Wireframe top nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg-primary/90 px-6 py-4 backdrop-blur">
        <WireframePlaceholder label="LOGO" className="h-8 w-24" />
        <div className="hidden gap-3 sm:flex">
          <WireframePlaceholder label="PRODUCT" className="h-8 w-20" />
          <WireframePlaceholder label="DEVELOPERS" className="h-8 w-24" />
          <WireframePlaceholder label="SPRINT 26" className="h-8 w-24" />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-[80vh] w-full max-w-[1100px] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Razorpay — Style Sample
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-text-primary sm:text-7xl">
          SPRINT 26
        </h1>
        <p className="mx-auto mt-6 max-w-md text-text-secondary">
          단 2색 팔레트(#0039FF / #151515)와 100개 이상의 스크롤/클릭
          마이크로 인터랙션으로 쇼퍼의 결제 여정을 거대한 오브제 중심으로
          풀어낸 B2B 결제 캠페인.
        </p>
        <div className="mt-10 text-xs text-text-muted">↓ scroll to advance</div>
      </section>

      {/* Full-bleed scroll-driven 3D experience — escapes the max-w container */}
      <FadeInSection className="mx-[calc(50%-50vw)] w-screen">
        <RazorpaySprintTrack />
      </FadeInSection>

      {/* Trigger counter / product wireframe section */}
      <FadeInSection className="mx-auto w-full max-w-[1100px] px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <WireframePlaceholder label="PRODUCT REVEAL GRID" className="h-40" />
          <WireframePlaceholder label="TRIGGER COUNTER" className="h-40" />
          <WireframePlaceholder label="PAYMENT FLOW DIAGRAM" className="h-40" />
        </div>
      </FadeInSection>

      {/* Quote reveal placeholders */}
      <FadeInSection className="mx-auto w-full max-w-[800px] px-6 py-24 text-center">
        <div className="space-y-12">
          {SPRINT_QUOTES.map((quote) => (
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
          label="CLOSING VISUAL / GIANT OBJECT HERO SHOT"
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
