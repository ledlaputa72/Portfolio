"use client";

import DanzanSlashReveal from "./DanzanSlashReveal";
import {
  DanzanCoreVector,
  DanzanCutVector,
  DanzanShellVector,
} from "./LabVectors";

const FLOW = [
  "노란 3D 히어로 — 샤드 마우스 반응 + 잔상",
  "스크롤 → 히어로가 위로 올라가고 베이지 사무라이 껍질 등장",
  "점선 슬래시 — 껍질이 잘려 뒤의 노란 灵感이 비침 (배경 교체 아님)",
  "절단 후 껍질 peel → 페인트 드립으로 노란→빨강 전환",
];

const DANZAN_LINES = [
  "“폭력의 미학은 절단선 위에서만 드러난다.”",
  "“껍질을 벗기면, 또 다른 진실이 숨어 있다.”",
  "“스크롤 한 번이 칼날 한 자국이다.”",
];

export default function DanzanSample() {
  return (
    <div className="flex flex-col bg-[#f5d800] text-black">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-[#f5d800]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-black uppercase tracking-[0.3em]">DANZAN</span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-black/40 sm:flex">
          <span>Work</span>
          <span>About</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[45vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#e8261a]">
          DANZAN — Style Sample
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          SLASH
          <span className="text-[#e8261a]"> THE </span>
          RULES
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-black/60">
          레퍼런스처럼 껍질(shell)을 절단하면 뒤 레이어가 비치고, 노란→빨강은
          페인트 드립으로 이어집니다. 패널 통째 교체가 아닌 레이어 절단 구조입니다.
        </p>
        <ul className="mx-auto mt-8 max-w-lg space-y-2 text-left text-xs text-black/45">
          {FLOW.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/35">↓ scroll — panel stack</div>
      </section>

      <DanzanSlashReveal />

      <section className="mx-auto w-full max-w-[900px] bg-[#0a0908] px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <DanzanShellVector />
          <DanzanCutVector />
          <DanzanCoreVector />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[700px] bg-[#0a0908] px-6 py-24 text-center text-[#e8dfd2]">
        <div className="space-y-12">
          {DANZAN_LINES.map((line) => (
            <p key={line} className="text-xl font-semibold sm:text-2xl">
              {line}
            </p>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#f5d800] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-black/60">
            DANZAN
          </span>
          <p className="text-xs text-black/40">danzan.jiejoe.com ↗</p>
        </div>
      </footer>
    </div>
  );
}
