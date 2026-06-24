"use client";

import KfcLoyaltyRewards from "./KfcLoyaltyRewards";
import {
  KfcBoxVector,
  KfcBucketVector,
  KfcPointsVector,
} from "./LabVectors";

const PERKS = [
  "50 points every €5 spent",
  "KFC Box from 250 points",
  "Mystery Box powered by AI",
  "Endless bucket web game",
];

export default function KfcLoyaltySample() {
  return (
    <div className="flex flex-col text-[#1a1a1a]" style={{ background: "#FFF8F0" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E4002B]/10 bg-[#FFF8F0]/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-[9px] font-black text-white"
            style={{ background: "#E4002B" }}
          >
            KFC
          </span>
          <span className="text-sm font-bold uppercase tracking-widest">Rewards</span>
        </div>
        <div className="hidden gap-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/40 sm:flex">
          <span>Points</span>
          <span>Boxes</span>
          <span>Play</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#E4002B]">
          KFC Loyalty — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Gamified loyalty,
          <br />
          <span style={{ color: "#E4002B" }}>finger lickin&apos;</span> fun.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#1a1a1a]/60">
          레퍼런스처럼 3D 버킷, 스크롤 포인트 카운터, 바운스 리워드 박스, endless
          게임 구간까지 온보딩 여정을 재현합니다.
        </p>
        <ul className="mt-8 space-y-2 text-xs text-[#1a1a1a]/45">
          {PERKS.map((perk) => (
            <li key={perk}>· {perk}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#1a1a1a]/35">↓ scroll — pinned rewards journey</div>
      </section>

      <KfcLoyaltyRewards />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <KfcBucketVector />
          <KfcPointsVector />
          <KfcBoxVector />
        </div>
      </section>

      <footer className="border-t border-[#E4002B]/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#1a1a1a]/40">kfc.it/loyalty ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/30">
            R3F bucket · GSAP · scroll counters
          </p>
        </div>
      </footer>
    </div>
  );
}
