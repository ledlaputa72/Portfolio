"use client";

import DigitalistsCardReveal from "./DigitalistsCardReveal";
import {
  DigitalistsCaseVector,
  DigitalistsServiceVector,
  DigitalistsWordPressVector,
} from "./LabVectors";
import { useLocale } from "@/i18n/LocaleProvider";

const SERVICES = [
  "Branding & Design",
  "Websites & E-Commerce",
  "Online Marketing",
  "Plattformen & Entwicklung",
  "KI & Automatisierung",
  "Strategie & Betreuung",
];

const CASES = [
  "UNICEF AT — CS 682",
  "e-dialog — CS 695",
  "AK Wien — CS 566",
  "FiNUM — CS 704",
];

export default function DigitalistsSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#171717] text-[#f2f2f2]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#2a2a2a] bg-[#171717]/90 px-6 py-5 backdrop-blur">
        <span className="text-lg font-bold lowercase tracking-tight">
          digitalists<span className="text-[#f1e500]">.</span>
        </span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#f2f2f2]/35 sm:flex">
          <span>Leistungen</span>
          <span>Referenzen</span>
          <span>Kontakt</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[1000px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#f1e500]">
          digitalists — Style Sample
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Creative digital agency.
          <br />
          <span className="text-[#f2f2f2]/50">Wien · NÖ · Burgenland</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#f2f2f2]/55">
          {locale === "ko"
            ? "WordPress · WooCommerce · 실무적 hover 카드와 scroll reveal 중심 모션. 스크롤하면 서비스 카드가 먼저, 이어 레퍼런스가 순차 등장합니다."
            : "WordPress · WooCommerce · practical motion built around hover cards and scroll reveal. As you scroll, the service cards come first, then the references reveal in sequence."}
        </p>
        <div className="mt-8 text-xs text-[#f2f2f2]/30">↓ scroll — pinned card reveal</div>
      </section>

      <DigitalistsCardReveal />

      <section className="mx-auto w-full max-w-[1000px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f1e500]/80">
          Leistungen
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {SERVICES.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-[#f2f2f2]/15 px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-[#f2f2f2]/55"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1000px] px-6 pb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f1e500]/80">
          Referenzen
        </p>
        <ul className="mt-6 space-y-3">
          {CASES.map((name) => (
            <li
              key={name}
              className="border-t border-[#2a2a2a] pt-4 text-base font-medium text-[#f2f2f2]/75"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[1000px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <DigitalistsServiceVector />
          <DigitalistsCaseVector />
          <DigitalistsWordPressVector />
        </div>
      </section>

      <footer className="border-t border-[#2a2a2a] px-6 py-12">
        <div className="mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs lowercase text-[#f2f2f2]/40">
            digitalists.at ↗
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f2f2f2]/25">
            DOM / GSAP — no WebGL
          </p>
        </div>
      </footer>
    </div>
  );
}
