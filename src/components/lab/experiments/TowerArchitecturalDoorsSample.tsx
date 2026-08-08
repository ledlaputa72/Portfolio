"use client";

import TowerArchitecturalDoors from "./TowerArchitecturalDoors";
import { useLocale } from "@/i18n/LocaleProvider";

const PILLARS = [
  "0→100% load counter then welcome hero — towerdoors scroll milestones",
  "Sticky WebGL TA8™ door — scroll-scrubbed exploded view (frame, seal, hinge, cladding)",
  "9 editorial chapters crossfade while 3D continuously animates",
  "Vertical % rail (0·15·27·35·55·70·87·95·100) synced to scroll progress",
];

export default function TowerArchitecturalDoorsSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col" style={{ background: "#f7f6f3", color: "#1a1a1a" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#f7f6f3]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Tower Architectural Doors</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">
          TA8™ System
        </span>
      </header>

      <section className="mx-auto flex min-h-[40vh] w-full max-w-[900px] flex-col justify-center px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35">
          Tower Doors — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          The next evolution in
          <br />
          <span style={{ color: ACCENT }}>architectural garage doors</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/50">
          {locale === "ko"
            ? "스크롤에 따라 TA8™ 프레임이 분해도처럼 펼쳐지고, 챕터 카피가 교체됩니다. towerdoors.com.au의 로딩 카운터·마일스톤·3D 스크럽 흐름을 재현합니다."
            : "As you scroll, the TA8™ frame unfolds like an exploded view while chapter copy swaps. Recreates the towerdoors.com.au loading counter, milestones, and 3D scrub flow."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/30">↓ scroll — load · explode · chapters</div>
      </section>

      <TowerArchitecturalDoors />

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">towerdoors.com.au ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">
            exploded view · studio lighting · milestone scrub
          </p>
        </div>
      </footer>
    </div>
  );
}

const ACCENT = "#8a7355";
