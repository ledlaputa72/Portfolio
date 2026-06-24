"use client";

import HirotoSatoSignage from "./HirotoSatoSignage";
import {
  HirotoArrowVector,
  HirotoMirrorVector,
  HirotoTagVector,
} from "./LabVectors";

export default function HirotoSatoSample() {
  return (
    <div className="flex flex-col bg-[#eeedea] text-[#111111]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#ddd9d3] bg-[#eeedea]/90 px-6 py-4 backdrop-blur">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#111111]">
          Hiroto Sato
        </span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#111111]/40 sm:flex">
          <span>Work</span>
          <span>Archive</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[60vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#3b82f6]">
          Hiroto Sato — Style Sample
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          SIGNAGE
          <br />
          CLUSTER
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-[#111111]/55">
          표지판형 3D 히어로. 스크롤하면 화면이 고정되고 클러스터가 회전하며
          카메라가 줌인합니다.
        </p>
        <div className="mt-10 text-xs text-[#111111]/35">↓ scroll — pinned 3D scene</div>
      </section>

      <HirotoSatoSignage />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <HirotoMirrorVector />
          <HirotoTagVector />
          <HirotoArrowVector />
        </div>
      </section>

      <footer className="border-t border-[#ddd9d3] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] justify-center">
          <p className="text-xs text-[#111111]/40">hirotos.com ↗</p>
        </div>
      </footer>
    </div>
  );
}
