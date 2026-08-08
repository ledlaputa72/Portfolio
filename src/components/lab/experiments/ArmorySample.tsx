"use client";

import ArmoryRadarScan from "./ArmoryRadarScan";
import {
  ArmoryDroneVector,
  ArmoryRadarVector,
  ArmorySurgeVector,
} from "./LabVectors";
import { useLocale } from "@/i18n/LocaleProvider";

const NAV = ["SURGE", "Samaritan OS", "About", "Contact"];

const CAPABILITIES = [
  "Detect, classify, and track rogue drones in real time",
  "RF jamming & electronic countermeasures",
  "Samaritan OS threat orchestration",
  "Manpack, mounted, and vehicle configurations",
];

export default function ArmorySample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col text-[#ecfdf5]" style={{ background: "#0a100d" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#3dff8b]/10 bg-[#0a100d]/90 px-6 py-4 backdrop-blur">
        <span className="font-mono text-sm font-semibold uppercase tracking-[0.15em]">
          Armory
        </span>
        <div className="hidden gap-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b7c72] sm:flex">
          {NAV.slice(0, 2).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#6b7c72]">
          Armory — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Detect.
          <br />
          <span style={{ color: "#3dff8b" }}>Deter. Destroy.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#8fa89a]">
          {locale === "ko"
            ? "레퍼런스처럼 로딩 시 레이더 스캔 후, 스크롤에 따라 카메라가 원경(위협 지형)에서 근경 드론·SURGE 유닛으로 다이나믹하게 돌리합니다. 근접 이후 capability 콘텐츠 카드가 순차 reveal됩니다."
            : "Like the reference, a radar scan runs on load, then as you scroll the camera dollies dynamically from the far threat terrain to near drones and SURGE units. After the close-up, capability content cards reveal in sequence."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-[#6b7c72]">
          {CAPABILITIES.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#6b7c72]/80">↓ scroll — camera dolly · cards</div>
      </section>

      <ArmoryRadarScan />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <ArmoryRadarVector />
          <ArmoryDroneVector />
          <ArmorySurgeVector />
        </div>
      </section>

      <footer className="border-t border-[#1a5c38]/40 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#6b7c72]">armory.in ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b7c72]/60">
            R3F camera dolly · loading radar · capability cards
          </p>
        </div>
      </footer>
    </div>
  );
}
