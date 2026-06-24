"use client";

import IrisKWaveform from "./IrisKWaveform";
import {
  IrisMusicSheetVector,
  IrisPianoKeysVector,
  IrisWaveformVector,
} from "./LabVectors";

const CREDITS = [
  "Composer — original scores for film & stage",
  "Violinist — classical technique, contemporary voice",
  "Producer — rhythm translated into motion",
];

export default function IrisKSample() {
  return (
    <div className="flex flex-col bg-[#101010] text-[#efefef]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#1a1a1a] bg-[#101010]/90 px-6 py-5 backdrop-blur">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#efefef]/50">
          Iris K
        </span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#efefef]/30 sm:flex">
          <span>Work</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[55vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#efefef]/35">
          Composer · Violinist
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light tracking-tight text-[#ffffff] sm:text-7xl">
          Iris K
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#efefef]/45">
          음악의 리듬이 파형과 소프트 파티클로 번역되는 감성적 경험. 스크롤하면
          화면이 고정되고 Silence → Resonance까지 시각적 내러티브가 전개됩니다.
        </p>
        <p className="mt-8 text-[10px] text-[#efefef]/25">
          For the best experience, use headphones.
        </p>
        <div className="mt-6 text-xs text-[#efefef]/30">↓ scroll — pinned audio-visual scene</div>
      </section>

      <IrisKWaveform />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#efefef]/35">
          About
        </p>
        <ul className="mt-8 space-y-6">
          {CREDITS.map((line) => (
            <li
              key={line}
              className="border-t border-[#1a1a1a] pt-6 text-lg font-light text-[#efefef]/70"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <IrisWaveformVector />
          <IrisMusicSheetVector />
          <IrisPianoKeysVector />
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#efefef]/30">
            theirisk.com ↗
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#efefef]/20">
            Web Audio API / R3F / GSAP ScrollTrigger
          </p>
        </div>
      </footer>
    </div>
  );
}
