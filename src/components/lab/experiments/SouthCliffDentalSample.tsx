"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import SouthCliffDentalExplore from "./SouthCliffDentalExplore";

const PILLARS = [
  "3D scroll camera — lobby → treatment rooms → practice network overview",
  "Click location pins or list — camera flies to that practice (interactive navigation)",
  "Chapters: treatments · emergency · stats · locations · book CTA",
  "Clean NHS/private dental palette — teal · navy · clinical white",
];

export default function SouthCliffDentalSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col" style={{ background: "#f4f8fb", color: "#1e3a5f" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#f4f8fb]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">South Cliff Dental Group</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">
          NHS & Private
        </span>
      </header>

      <section className="mx-auto flex min-h-[40vh] w-full max-w-[900px] flex-col justify-center px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35">
          South Cliff Dental — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Award winning
          <br />
          <span className="text-[#0d9488]">dental practices</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/50">
          {locale === "ko"
            ? "southcliffdentalgroup.com 레퍼런스처럼 WebGL로 진료소 네트워크를 스크롤·클릭 탐색합니다."
            : "Like the southcliffdentalgroup.com reference, explore the practice network in WebGL through scroll and click."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/30">↓ scroll — 3D practices · click locations</div>
      </section>

      <SouthCliffDentalExplore />

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">southcliffdentalgroup.com ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/25">
            3D scroll · location nav · practice model
          </p>
        </div>
      </footer>
    </div>
  );
}
