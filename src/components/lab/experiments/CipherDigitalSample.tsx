"use client";

import CipherDigitalRackAlign from "./CipherDigitalRackAlign";
import {
  CipherCapacityVector,
  CipherGridVector,
  CipherRackVector,
} from "./LabVectors";
import { useLocale } from "@/i18n/LocaleProvider";

const NAV = ["Infrastructure", "Investor Resources", "About", "Contact"];

const PARTNERS = ["Google", "AWS", "Fluidstack"];

const PILLARS = [
  "Hyperscale data center development & operations",
  "HPC-purpose-built engineering",
  "Power sourcing to real estate expertise",
  "Restrained wireframe visual language",
];

export default function CipherDigitalSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col text-[#eff0f1]" style={{ background: "#0d0e10" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#abd233]/10 bg-[#0d0e10]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Cipher Digital</span>
        <div className="hidden gap-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#939ca2] sm:flex">
          {NAV.slice(0, 2).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#939ca2]">
          Cipher Digital — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Built for
          <br />
          <span style={{ color: "#abd233" }}>Hyperscale.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#c4ccd1]">
          {locale === "ko"
            ? "780vh 스크롤 여정 — hero grid(spacer 압축) → horiz-scroll 액자형 이미지 3장과 copy 패널 교체 → expertise 카드·용량 메트릭 순차 reveal. 레퍼런스 hero-fs-headline + horiz-scroll 블록 구조를 따릅니다."
            : "A 780vh scroll journey — hero grid (spacer compression) → horiz-scroll through three framed images with swapping copy panels → expertise cards and capacity metrics reveal in sequence. Follows the reference hero-fs-headline + horiz-scroll block structure."}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="rounded border border-[#2d3438] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#939ca2]"
            >
              {p}
            </span>
          ))}
        </div>
        <ul className="mt-8 space-y-2 text-xs text-[#5a636a]">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#5a636a]">↓ scroll — hero → framed media → cards</div>
      </section>

      <CipherDigitalRackAlign />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <CipherRackVector />
          <CipherGridVector />
          <CipherCapacityVector />
        </div>
      </section>

      <footer className="border-t border-[#2d3438] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#5a636a]">cipherdigital.com ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5a636a]/80">
            hero grid · horiz-scroll frames · expertise cards
          </p>
        </div>
      </footer>
    </div>
  );
}
