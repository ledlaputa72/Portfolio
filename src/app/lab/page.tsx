import LabSiteGrid from "@/components/lab/LabSiteGrid";

export default function LabPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-[1200px] px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
          Lab
        </h1>
        <p className="mt-6 max-w-2xl text-text-secondary">
          이곳은 실제 포트폴리오를 만들기 전, Awwwards급 레퍼런스 32곳의
          기법과 컨셉을 분석하고 Three.js / React Three Fiber / GSAP로 직접
          재현해보는 기술 테스트베드입니다. 각 카드는 사이트별 실험 페이지로
          연결되며, 실제 구현은 Cursor에서 단계적으로 진행됩니다.
        </p>
      </section>

      <LabSiteGrid />
    </main>
  );
}
