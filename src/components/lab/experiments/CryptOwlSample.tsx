"use client";

import CryptOwlTimeline from "./CryptOwlTimeline";
import {
  CryptOwlGlowVector,
  CryptOwlMetricVector,
  CryptOwlTimelineVector,
} from "./LabVectors";

const NAV = ["Strategy", "Time replay", "Control", "Analytics", "Product proof"];

const FLOW = [
  "Build strategy logic with context, risk, and exits",
  "Replay against market history — Net PnL, ROI, win rate",
  "Campaign-level pause / resume across live strategies",
  "Analytics rollup at user, campaign, and strategy level",
];

export default function CryptOwlSample() {
  return (
    <div className="flex flex-col text-[#f8fdff]" style={{ background: "#07090d" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#7ce6ff]/10 bg-[#07090d]/90 px-6 py-4 backdrop-blur">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#f8fdff]">
          CryptOwl
        </span>
        <div className="hidden gap-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#84949e] sm:flex">
          {NAV.slice(0, 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#96cdde]">
          CryptOwl — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-5xl font-light tracking-tight sm:text-7xl">
          Time
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-[#7ce6ff]">
          Build now · Rewind history · Watch it live
        </p>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#b7c6cf]">
          레퍼런스처럼 스크롤에 따라 3D 타임라인을 따라 카메라가 이동하고, 노드가
          네온 글로우로 활성화됩니다. Net PnL·ROI 메트릭 HUD가 구간별로 갱신됩니다.
        </p>
        <ul className="mt-8 space-y-2 text-xs text-[#84949e]">
          {FLOW.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#84949e]/80">↓ scroll — 3D timeline scrub</div>
      </section>

      <CryptOwlTimeline />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <CryptOwlTimelineVector />
          <CryptOwlGlowVector />
          <CryptOwlMetricVector />
        </div>
      </section>

      <footer className="border-t border-[#7ce6ff]/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#84949e]">cryptowl.io ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#84949e]/60">
            R3F timeline · neon glow · scroll metrics
          </p>
        </div>
      </footer>
    </div>
  );
}
