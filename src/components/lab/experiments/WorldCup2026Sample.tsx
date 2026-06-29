"use client";

import WorldCup2026DataViz from "./WorldCup2026DataViz";

const PILLARS = [
  "Scroll narrative — opener Azteca → stats → champions → hosts → legends → format → MetLife final",
  "SVG host-city map with nation / stadium click filters (signature data-viz interaction)",
  "12-group grid + fixture list reconfigure when team or city is selected",
  "Clay-and-data editorial tone matching sheets.works World Cup 2026",
];

export default function WorldCup2026Sample() {
  return (
    <div className="flex flex-col" style={{ background: "#f3efe6", color: "#1a2332" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#f3efe6]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">World Cup 2026</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">
          sheets.works
        </span>
      </header>

      <section className="mx-auto flex min-h-[40vh] w-full max-w-[900px] flex-col justify-center px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35">
          World Cup 2026 — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Every team,
          <br />
          <span className="text-black/45">every stadium, every match</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/50">
          sheets.works 데이터 스토리텔링 흐름을 재현합니다. 팀·국가·경기장을 클릭하면 픽스처와 그룹이 동적으로 필터링됩니다.
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/30">↓ scroll — map filter · groups · fixtures</div>
      </section>

      <WorldCup2026DataViz />

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">sheets.works/data-viz/world-cup-2026 ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/25">
            host map · group grid · fixture filter
          </p>
        </div>
      </footer>
    </div>
  );
}
