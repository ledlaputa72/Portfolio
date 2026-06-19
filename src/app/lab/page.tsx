import Link from "next/link";
import FadeInSection from "@/components/FadeInSection";
import { labSites, type LabSite } from "@/data/lab-sites";

const CATEGORY_ORDER: LabSite["category"][] = [
  "interactive-portfolio",
  "brand-experience",
  "b2b-tech",
  "data-viz",
];

const difficultyColor: Record<LabSite["difficulty"], string> = {
  상: "bg-red-500/10 text-red-400 border-red-500/30",
  중: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  하: "bg-green-500/10 text-green-400 border-green-500/30",
};

export default function LabPage() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    categoryLabel:
      labSites.find((site) => site.category === category)?.categoryLabel ??
      category,
    sites: labSites.filter((site) => site.category === category),
  }));

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

      {grouped.map(({ category, categoryLabel, sites }) => (
        <FadeInSection
          key={category}
          className="mx-auto w-full max-w-[1200px] px-6 py-12"
        >
          <h2 className="text-xl font-bold text-text-primary">
            {categoryLabel}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Link
                key={site.slug}
                href={`/lab/${site.slug}`}
                className="group flex flex-col rounded-lg border border-border bg-bg-secondary p-5 transition-colors hover:border-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-text-primary group-hover:text-accent">
                    {site.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${difficultyColor[site.difficulty]}`}
                  >
                    {site.difficulty}
                  </span>
                </div>
                <span className="mt-1 inline-block w-fit rounded-full border border-border px-2 py-0.5 text-xs text-text-muted">
                  {site.confidence}
                </span>
                <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
                  {site.concept}
                </p>
              </Link>
            ))}
          </div>
        </FadeInSection>
      ))}
    </main>
  );
}
