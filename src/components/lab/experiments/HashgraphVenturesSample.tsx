"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import HashgraphVenturesNetwork from "./HashgraphVenturesNetwork";
import {
  HashgraphHexVector,
  HashgraphNetworkVector,
  HashgraphParticleVector,
} from "./LabVectors";

const PILLARS = [
  "Diagonal section wipes between full-viewport chapters",
  "Hexagonal wireframe core splits on pointer hover",
  "900-particle field repulses with hover tension",
  "Scroll expands node/edge graph from compact to wide sphere",
];

export default function HashgraphVenturesSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col text-[#eee]" style={{ background: "#000209" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#9bb8e1]/10 bg-[#000209]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Hashgraph Ventures</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9bb8e1]/70">
          AI & Blockchain VC
        </span>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#5f87b9]">
          Hashgraph Ventures — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-6xl">
          The next wave
          <br />
          <span style={{ color: "#9bb8e1" }}>of venture capital</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#9bb8e1]/90">
          {locale === "ko"
            ? "액자가 아닌 전체 화면 챕터가 스크롤 시 대각선 경계로 밀어 올려지며 전환됩니다. 챕터마다 파티클 형태(샤드·파편·휴머노이드·원뿔)가 교체되고 hover 시 분산됩니다."
            : "Full-viewport chapters — not framed panels — transition as diagonal boundaries push them upward on scroll. Each chapter swaps the particle form (shard, fragment, humanoid, cone) and disperses on hover."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-[#5f87b9]/80">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#5f87b9]/60">↓ scroll — network expansion</div>
      </section>

      <HashgraphVenturesNetwork />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <HashgraphHexVector />
          <HashgraphNetworkVector />
          <HashgraphParticleVector />
        </div>
      </section>

      <footer className="border-t border-[#2c4e73]/40 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#5f87b9]">hashgraphvc.com ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5f87b9]/60">
            diagonal wipe · hex split · particle graph
          </p>
        </div>
      </footer>
    </div>
  );
}
