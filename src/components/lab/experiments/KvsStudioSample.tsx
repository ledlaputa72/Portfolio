"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import KvsStudioBreak from "./KvsStudioBreak";
import { KvsGlitchVector, KvsHudVector } from "./LabVectors";

const HUD_TAGS = ["INTERACTIVE TYPE", "GLITCH UI", "COORD HUD", "MICRO-GAME"];

export default function KvsStudioSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#0a0a0a] text-[#f0f0f0]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#222] bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#00ff9c]">
          KVS Studio
        </span>
        <div className="hidden gap-4 font-mono text-[10px] uppercase tracking-widest text-[#f0f0f0]/35 sm:flex">
          <span>Work</span>
          <span>Services</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00ff9c]/70">
          KVS Studio — Style Sample
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">
          Break the
          <span className="text-[#ff00aa]"> Type</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-[#f0f0f0]/50">
          {locale === "ko"
            ? "스크롤하면 글자가 순차 분해되고, 클릭하면 즉시 BREAK됩니다. 좌표 HUD가 함께 표시됩니다."
            : "As you scroll, letters break apart in sequence; click to BREAK instantly. A coordinate HUD tracks alongside."}
        </p>
        <div className="mt-10 font-mono text-xs text-[#f0f0f0]/30">↓ scroll — pinned break sequence</div>
      </section>

      <KvsStudioBreak />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="flex flex-wrap justify-center gap-2">
          {HUD_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[#333] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#f0f0f0]/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <KvsGlitchVector />
          <KvsHudVector />
        </div>
      </section>

      <footer className="border-t border-[#222] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-[10px] text-[#f0f0f0]/30">
            kvs.services ↗
          </span>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#f0f0f0]/20">
            DOM / GSAP — no WebGL
          </p>
        </div>
      </footer>
    </div>
  );
}
