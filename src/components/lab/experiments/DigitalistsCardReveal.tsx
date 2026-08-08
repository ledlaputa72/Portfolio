"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const CARDS = [
  {
    kind: "service" as const,
    title: "Branding & Design",
    meta: "Logo · Corporate Design · Markenbotschaft",
    code: "SVC 01",
    tone: "from-[#2a2a2a] to-[#1f1f1f]",
  },
  {
    kind: "service" as const,
    title: "Websites & E-Commerce",
    meta: "WordPress · WooCommerce · SEO",
    code: "SVC 02",
    tone: "from-[#252525] to-[#1a1a1a]",
  },
  {
    kind: "service" as const,
    title: "Online Marketing",
    meta: "Kampagnen · Content · Performance",
    code: "SVC 03",
    tone: "from-[#2d2d2d] to-[#202020]",
  },
  {
    kind: "service" as const,
    title: "Plattformen & Entwicklung",
    meta: "Web Apps · Skalierbar · Performant",
    code: "SVC 04",
    tone: "from-[#282828] to-[#1c1c1c]",
  },
  {
    kind: "case" as const,
    title: "UNICEF AT",
    meta: "Spendenformulare · Print · WordPress",
    code: "CS 682",
    tone: "from-[#303030] to-[#222222]",
  },
  {
    kind: "case" as const,
    title: "e-dialog",
    meta: "Relaunch · Mehrsprachigkeit",
    code: "CS 695",
    tone: "from-[#2e2e2e] to-[#212121]",
  },
  {
    kind: "case" as const,
    title: "AK Wien",
    meta: "Employer Branding · Programmierung",
    code: "CS 566",
    tone: "from-[#2b2b2b] to-[#1e1e1e]",
  },
  {
    kind: "case" as const,
    title: "FiNUM",
    meta: "Screendesign · WordPress",
    code: "CS 704",
    tone: "from-[#292929] to-[#1d1d1d]",
  },
] as const;

function hoverIn(card: HTMLElement) {
  gsap.to(card, { y: -6, duration: 0.45, ease: "power2.out" });
  gsap.to(card.querySelector("[data-thumb]"), { scale: 1.06, duration: 0.55, ease: "power2.out" });
  gsap.to(card.querySelector("[data-accent]"), { scaleY: 1, duration: 0.4, ease: "power3.out" });
  gsap.to(card.querySelector("[data-line]"), { scaleX: 1, duration: 0.45, ease: "power3.out" });
  gsap.to(card.querySelector("[data-meta]"), { y: -2, opacity: 1, duration: 0.35, ease: "power2.out" });
}

function hoverOut(card: HTMLElement) {
  gsap.to(card, { y: 0, duration: 0.45, ease: "power2.out" });
  gsap.to(card.querySelector("[data-thumb]"), { scale: 1, duration: 0.5, ease: "power2.out" });
  gsap.to(card.querySelector("[data-accent]"), { scaleY: 0, duration: 0.3, ease: "power2.in" });
  gsap.to(card.querySelector("[data-line]"), { scaleX: 0, duration: 0.3, ease: "power2.in" });
  gsap.to(card.querySelector("[data-meta]"), { y: 0, opacity: 0.5, duration: 0.3, ease: "power2.out" });
}

export default function DigitalistsCardReveal() {
  const { locale } = useLocale();
  const gridRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<"services" | "references">("services");

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll("[data-card]");
    if (!cards?.length) return;
    gsap.set(cards, { opacity: 0.12, y: 56, scale: 0.94 });
  }, []);

  const handleProgress = (p: number) => {
    const cards = gridRef.current?.querySelectorAll("[data-card]");
    if (!cards?.length) return;

    const isReferences = p > 0.48;
    setPhase(isReferences ? "references" : "services");

    let count = 0;
    cards.forEach((card, i) => {
      const isCase = i >= 4;
      const sectionStart = isCase ? 0.48 : 0;
      const sectionEnd = isCase ? 1 : 0.52;
      const sectionLen = sectionEnd - sectionStart;
      const localP = isCase
        ? gsap.utils.clamp(0, 1, (p - sectionStart) / sectionLen)
        : gsap.utils.clamp(0, 1, p / 0.52);

      const indexInSection = isCase ? i - 4 : i;
      const sectionCount = isCase ? 4 : 4;
      const start = indexInSection / sectionCount;
      const end = (indexInSection + 1) / sectionCount;
      const t = gsap.utils.clamp(0, 1, (localP - start) / Math.max(0.001, end - start));

      if (t > 0.8) count += 1;

      const visible = isCase ? p > 0.42 : true;
      gsap.set(card, {
        opacity: visible ? 0.12 + t * 0.88 : 0.06,
        y: visible ? 56 * (1 - t) : 56,
        scale: visible ? 0.94 + t * 0.06 : 0.94,
      });
    });

    if (headlineRef.current) {
      gsap.set(headlineRef.current, {
        y: -p * 32,
        opacity: 1 - p * 0.25,
      });
    }

    setRevealedCount(count);
  };

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={380}
      stickyClassName="bg-[#171717] text-[#f2f2f2]"
      hint={locale === "ko" ? "↓ 스크롤 — 화면 고정, 서비스·레퍼런스 카드 순차 reveal" : "↓ Scroll — screen locked, service·reference cards reveal in sequence"}
      progressLabel="Reveal"
    >
      <div className="flex h-full flex-col justify-center px-6 py-10 sm:px-12">
        <header ref={headlineRef} className="mb-8 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#f1e500]">
            {phase === "services" ? "Leistungen" : "Referenzen"}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {phase === "services" ? (
              <>
                Maßgeschneiderte Lösungen.
                <span className="text-[#f1e500]"> #kein0815</span>
              </>
            ) : (
              <>
                Starke digitale
                <br />
                Momente.
              </>
            )}
          </h3>
          <p className="mt-3 text-sm text-[#f2f2f2]/50">
            {revealedCount} / {CARDS.length} revealed · {locale === "ko" ? "hover für 카드 모션" : "hover for card motion"}
          </p>
        </header>

        <div
          ref={gridRef}
          className="grid max-h-[56vh] grid-cols-2 gap-3 overflow-hidden sm:grid-cols-4 sm:gap-4"
        >
          {CARDS.map((card) => (
            <article
              key={card.code}
              data-card
              className="will-change-transform"
              onMouseEnter={(e) => hoverIn(e.currentTarget)}
              onMouseLeave={(e) => hoverOut(e.currentTarget)}
            >
              <div className="relative overflow-hidden rounded-sm border border-[#2e2e2e] bg-[#1e1e1e]">
                <div
                  data-accent
                  className="absolute bottom-0 left-0 top-0 z-10 w-1 origin-top scale-y-0 bg-[#f1e500]"
                />
                <div
                  data-thumb
                  className={`relative aspect-[5/4] bg-gradient-to-br ${card.tone} flex items-start justify-between p-2.5 will-change-transform sm:p-3`}
                >
                  <span className="rounded-sm bg-[#f1e500] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-[#171717]">
                    {card.code}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-[#f2f2f2]/30">
                    {card.kind === "service" ? "Service" : "Case"}
                  </span>
                </div>
                <div className="px-3 py-3">
                  <div
                    data-line
                    className="mb-2 h-0.5 w-full origin-left scale-x-0 bg-[#f1e500]"
                  />
                  <h4 className="text-xs font-semibold tracking-tight sm:text-sm">
                    {card.title}
                  </h4>
                  <p
                    data-meta
                    className="mt-1 text-[9px] leading-snug text-[#f2f2f2]/50 opacity-50 sm:text-[10px]"
                  >
                    {card.meta}
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
