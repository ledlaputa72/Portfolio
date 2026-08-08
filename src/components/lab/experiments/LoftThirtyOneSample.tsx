"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import LoftThirtyOneWalkthrough from "./LoftThirtyOneWalkthrough";
import {
  LoftCameraVector,
  LoftMaterialVector,
  LoftRoomVector,
} from "./LabVectors";

const NAV = ["The Crew", "The Process", "The Proof", "Cool Sh!t", "The Sandbox"];

const PILLARS = [
  "End-to-end delivery: residential & commercial",
  "From concept & 3D to elevations",
  "Full-service beyond interior design",
  "Award-winning design & build",
];

export default function LoftThirtyOneSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#f3efe8] text-[#1c1916]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#1c1916]/8 bg-[#f3efe8]/90 px-6 py-4 backdrop-blur">
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ fontFamily: "Georgia, 'Noto Serif Display', serif" }}
        >
          LOFT THIRTY ONE
        </span>
        <div className="hidden gap-5 text-[10px] uppercase tracking-[0.15em] text-[#1c1916]/40 sm:flex">
          {NAV.slice(0, 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p
          className="text-[10px] uppercase tracking-[0.35em] text-[#1c1916]/40"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          LOFT THIRTY ONE — Style Sample
        </p>
        <h1
          className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
          style={{ fontFamily: "Georgia, 'Noto Serif Display', serif" }}
        >
          We build
          <br />
          <span className="italic">sensational spaces.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#1c1916]/60">
          {locale === "ko"
            ? "레퍼런스처럼 스크롤에 따라 카메라가 로프트 공간을 가로지르며 Living → Kitchen → Dining → Suite로 이동합니다. 룸별 조명 전환과 웜 인테리어 톤을 재현합니다."
            : "Like the reference, the camera travels across the loft as you scroll, moving Living → Kitchen → Dining → Suite. It recreates per-room lighting transitions and warm interior tones."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-[#1c1916]/45">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#1c1916]/35">↓ scroll — 3D loft walkthrough</div>
      </section>

      <LoftThirtyOneWalkthrough />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <LoftRoomVector />
          <LoftCameraVector />
          <LoftMaterialVector />
        </div>
      </section>

      <footer className="border-t border-[#1c1916]/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#1c1916]/40">loftthirtyone.com ↗</span>
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-[#1c1916]/30"
            style={{ fontFamily: "ui-monospace, monospace" }}
          >
            R3F walkthrough · scroll camera · room lighting
          </p>
        </div>
      </footer>
    </div>
  );
}
