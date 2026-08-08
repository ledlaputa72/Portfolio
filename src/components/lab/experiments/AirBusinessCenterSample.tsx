"use client";

import AirBusinessCenterFloors from "./AirBusinessCenterFloors";
import { AirFloorVector, AirTowerVector } from "./LabVectors";
import { useLocale } from "@/i18n/LocaleProvider";

const PILLARS = [
  "Oversized A · I · R letterforms crop viewport edges and slide apart on scroll",
  "Center ribbed metal sculpture (hero) crossfades into three twisted towers",
  "White editorial rhythm — hero copy, then chapter wipes with floor scrub",
  "Camera dollies from typographic framing into facade rise and lobby reveal",
];

export default function AirBusinessCenterSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col" style={{ background: "#f3f1ec", color: "#141414" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-[#f3f1ec]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">AIR business center</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/45">
          Class (A) Premium
        </span>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/40">
          AIR — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          The architecture
          <br />
          <span style={{ color: ACCENT }}>of New Success</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/55">
          {locale === "ko"
            ? "처음에는 거대한 AIR 타이포가 화면을 프레이밍하고, 스크롤에 따라 글자가 벌어지며 중앙 리브 조각이 등장합니다. 이후 타워·층별 전환·로비로 이어지는 aircenter.space식 시네마틱 흐름을 재현합니다."
            : "At first, oversized AIR typography frames the viewport; as you scroll, the letters slide apart and the central ribbed sculpture emerges. It then recreates the aircenter.space cinematic flow through towers, floor-by-floor transitions, and the lobby."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/45">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/35">↓ scroll — AIR typography · sculpture · towers</div>
      </section>

      <AirBusinessCenterFloors />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AirTowerVector />
          <AirFloorVector />
        </div>
      </section>

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">aircenter.space ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">
            twisted towers · floor scrub · lobby reveal
          </p>
        </div>
      </footer>
    </div>
  );
}

const ACCENT = "#3d5a78";
