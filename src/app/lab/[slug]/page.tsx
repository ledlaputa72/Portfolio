import Link from "next/link";
import { notFound } from "next/navigation";
import { labSites } from "@/data/lab-sites";
import { labExperiments } from "@/components/lab/experiments/registry";

export function generateStaticParams() {
  return labSites.map((site) => ({ slug: site.slug }));
}

export default async function LabSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = labSites.find((s) => s.slug === slug);

  if (!site) {
    notFound();
  }

  const experiment = labExperiments[site.slug];

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-[900px] px-6 py-16">
        <Link
          href="/lab"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Lab
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
          {site.title} 스타일 실험
        </h1>

        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-accent hover:text-accent-hover"
        >
          {site.url} ↗
        </a>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
            {site.categoryLabel}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
            {site.confidence}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
            난이도: {site.difficulty}
          </span>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-text-primary">컨셉</h2>
          <p className="mt-2 text-text-secondary">{site.concept}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-text-primary">
            시그니처 인터랙션
          </h2>
          <p className="mt-2 text-text-secondary">{site.signature}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-text-primary">구현할 기술</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {site.techniques.map((technique) => (
              <span
                key={technique}
                className="rounded-full bg-bg-tertiary px-3 py-1 text-sm text-text-primary"
              >
                {technique}
              </span>
            ))}
          </div>
        </div>

        {experiment ? (
          <>
            <div className="mt-10">
              <h2 className="text-lg font-bold text-text-primary">
                핵심 기능 구현
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                스크롤에 따라 변화하는 부분을 실제로 움직여보세요.
              </p>
              <div className="mt-4">
                <experiment.Demo />
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-lg font-bold text-text-primary">
                구현 노트 — 핵심 라이브러리
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {experiment.notes.libraries.map((lib) => (
                  <li key={lib}>{lib}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-text-primary">
                구현 포인트
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
                {experiment.notes.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-text-primary">
                {experiment.notes.snippet.label}
              </h2>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-bg-secondary p-4 text-xs text-text-secondary">
                <code>{experiment.notes.snippet.code}</code>
              </pre>
            </div>
          </>
        ) : (
          <div className="mt-10 flex min-h-[60vh] items-center justify-center rounded-lg border border-dashed border-border bg-bg-secondary text-center">
            <p className="px-6 text-text-muted">
              🚧 구현 예정 — Cursor에서 실제 Three.js/R3F 구현 진행
            </p>
          </div>
        )}

        <Link
          href="/lab"
          className="mt-10 inline-block text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Lab으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
