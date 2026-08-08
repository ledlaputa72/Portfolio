"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import FabricsProtectionWeave from "./FabricsProtectionWeave";

const PILLARS = [
  "Procedural macro fabric shader replaces background video — weave + wind parallax",
  "Scroll drives lotus effect — liquid beads and rolls off (uProtection 0→1)",
  "Chapters: Fabrics · Applications · Technology · specs · heritage · contact",
  "Awwwards-style minimal nav + large editorial section titles",
];

export default function FabricsProtectionSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col" style={{ background: "#e8e4dc", color: "#1a1814" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#e8e4dc]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Protection</span>
        <nav className="flex gap-5 font-mono text-[9px] uppercase tracking-[0.15em] text-black/40">
          <span>Fabrics</span>
          <span>Applications</span>
          <span>Technology</span>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[40vh] w-full max-w-[900px] flex-col justify-center px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35">
          Fabrics Protection — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Engineered to shade
          <br />
          <span className="text-black/45">designed to inspire</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/50">
          {locale === "ko"
            ? "영상 대신 직물 매크로 셰이더와 스크롤 연동 방수 시뮬레이션으로 en.protection.gr 흐름을 재현합니다."
            : "A procedural fabric macro shader replaces the background video, with a scroll-linked water-repellency simulation that recreates the en.protection.gr flow."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/30">↓ scroll — lotus effect · chapters</div>
      </section>

      <FabricsProtectionWeave />

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">en.protection.gr ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/25">
            fabric shader · water bead · scroll chapters
          </p>
        </div>
      </footer>
    </div>
  );
}
