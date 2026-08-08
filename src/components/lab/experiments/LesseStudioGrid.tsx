"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import LesseStudioFloatingObject from "./LesseStudioFloatingObject";
import { useLocale } from "@/i18n/LocaleProvider";
const PROJECTS = [
  { title: "Clarity Systems", category: "Brand Identity", year: "2026", tone: "from-[#e8e6e1] to-[#d4d2cb]" },
  { title: "Intentional UI", category: "Product Design", year: "2025", tone: "from-[#dfe3e8] to-[#c8ced6]" },
  { title: "Motion Craft", category: "Web Experience", year: "2025", tone: "from-[#ece8e4] to-[#d9d3cc]" },
  { title: "Performance First", category: "Design Systems", year: "2024", tone: "from-[#e4e8e6] to-[#cfd5d1]" },
  { title: "Editorial Grid", category: "Art Direction", year: "2024", tone: "from-[#ebe9e4] to-[#d8d5cd]" },
  { title: "Quiet Technology", category: "Creative Dev", year: "2023", tone: "from-[#e2e4ea] to-[#cbcfd8]" },
] as const;

function hoverIn(card: HTMLElement) {
  gsap.to(card.querySelector("[data-thumb]"), { scale: 1.05, duration: 0.65, ease: "power2.out" });
  gsap.to(card.querySelector("[data-meta]"), { y: -3, opacity: 1, duration: 0.4, ease: "power2.out" });
  gsap.to(card.querySelector("[data-line]"), { scaleX: 1, duration: 0.45, ease: "power3.out" });
}

function hoverOut(card: HTMLElement) {
  gsap.to(card.querySelector("[data-thumb]"), { scale: 1, duration: 0.55, ease: "power2.out" });
  gsap.to(card.querySelector("[data-meta]"), { y: 0, opacity: 0.55, duration: 0.35, ease: "power2.out" });
  gsap.to(card.querySelector("[data-line]"), { scaleX: 0, duration: 0.35, ease: "power2.in" });
}

export default function LesseStudioGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [heroFade, setHeroFade] = useState(1);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll("[data-project-card]");
    if (!cards?.length) return;
    gsap.set(cards, { opacity: 0.15, y: 48, scale: 0.96 });
    gsap.set(headlineRef.current, { opacity: 1, y: 0 });
  }, []);

  const handleProgress = (p: number) => {
    const cards = gridRef.current?.querySelectorAll("[data-project-card]");
    if (!cards?.length) return;

    let count = 0;
    cards.forEach((card, i) => {
      const start = i / cards.length;
      const end = (i + 1) / cards.length;
      const t = gsap.utils.clamp(0, 1, (p - start) / (end - start));
      if (t > 0.85) count += 1;
      gsap.set(card, {
        opacity: 0.15 + t * 0.85,
        y: 48 * (1 - t),
        scale: 0.96 + t * 0.04,
      });
    });

    if (headlineRef.current) {
      gsap.set(headlineRef.current, { y: -p * 40, opacity: 1 - p * 0.35 });
    }

    setHeroFade(Math.max(0, 1 - p * 2.8));
    setRevealedCount(count);
  };

  const { locale } = useLocale();

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={350}
      stickyClassName="bg-[#f6f5f1] text-[#1a1a18]"
      hint={locale === "ko" ? "↓ 스크롤 — 중앙 3D 플로팅 → 그리드 카드 순차 reveal" : "↓ Scroll — center 3D floating object → grid cards reveal in sequence"}
      progressLabel="Grid Reveal"
    >
      <div className="relative flex h-full flex-col justify-center px-6 py-10 sm:px-12">
        <LesseStudioFloatingObject
          className="pointer-events-auto absolute inset-0 z-0"
          opacity={heroFade}
        />

        <header ref={headlineRef} className="relative z-10 mb-8 max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#1a1a18]/40">
            Design & Technology
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Clarity, performance,
            <br />
            intentionality.
          </h3>
          <p className="mt-3 text-sm text-[#1a1a18]/55">
            {revealedCount} / {PROJECTS.length} projects revealed
          </p>
        </header>

        <div
          ref={gridRef}
          className="relative z-10 grid max-h-[58vh] grid-cols-2 gap-4 overflow-hidden sm:grid-cols-3 lg:gap-5"
        >
          {PROJECTS.map((project) => (
            <article
              key={project.title}
              data-project-card
              className="cursor-default"
              onMouseEnter={(e) => hoverIn(e.currentTarget)}
              onMouseLeave={(e) => hoverOut(e.currentTarget)}
            >
              <div className="overflow-hidden rounded-md border border-[#e2e0da] bg-[#faf9f6]">
                <div
                  data-thumb
                  className={`aspect-[4/3] bg-gradient-to-br ${project.tone} flex items-end p-3 will-change-transform`}
                >
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#1a1a18]/35">
                    {project.year}
                  </span>
                </div>
                <div className="px-3 py-3">
                  <div
                    data-line
                    className="mb-2 h-px w-full origin-left scale-x-0 bg-[#1a1a18]/20"
                  />
                  <h4 className="text-sm font-medium tracking-tight">{project.title}</h4>
                  <p
                    data-meta
                    className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-[#1a1a18]/55 opacity-55"
                  >
                    {project.category}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </LabStickyScroll>
  );
}
