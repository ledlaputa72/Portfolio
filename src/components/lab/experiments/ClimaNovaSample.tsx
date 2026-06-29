"use client";

import ClimaNovaEnergyFlow from "./ClimaNovaEnergyFlow";

const PILLARS = [
  "스크롤마다 패널이 아래→위로 슬라이드업 — 레퍼런스와 동일한 스택 스크롤",
  "텍스트·일러스트 교차 상승 — SplitBlock에서 rise 타이밍 분리",
  "라이트 히어로 → 웜 그라데이션 → 네이비 → 화이트 톤 전환",
  "아이소메트릭 SVG — 주택 · 솔라 시스템 · 모듈 스택 · 컷어웨이",
];

export default function ClimaNovaSample() {
  return (
    <div className="flex flex-col" style={{ background: "#f3f3f3", color: "#111827" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#f3f3f3]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-bold tracking-[0.15em]">CLIMANOVA</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">
          Québec
        </span>
      </header>

      <section className="mx-auto flex min-h-[40vh] w-full max-w-[900px] flex-col justify-center px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35">
          ClimaNova — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Prenez le contrôle
          <br />
          <span className="text-black/45">de votre énergie</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/50">
          climanovaquebec.com 레퍼런스처럼 섹션·텍스트·일러스트가 스크롤에 따라 아래에서 위로 교차 상승합니다.
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/30">↓ scroll — panel slide-up · split parallax</div>
      </section>

      <ClimaNovaEnergyFlow />

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">climanovaquebec.com ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/25">
            slide-up panels · isometric svg · light/dark chapters
          </p>
        </div>
      </footer>
    </div>
  );
}
