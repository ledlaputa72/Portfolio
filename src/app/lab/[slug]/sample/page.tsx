import Link from "next/link";
import { notFound } from "next/navigation";
import { labSites } from "@/data/lab-sites";
import { labExperiments } from "@/components/lab/experiments/registry";

export function generateStaticParams() {
  return labSites
    .filter((site) => labExperiments[site.slug]?.Sample)
    .map((site) => ({ slug: site.slug }));
}

export default async function LabSiteSamplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = labSites.find((s) => s.slug === slug);
  const experiment = labExperiments[slug];

  if (!site || !experiment?.Sample) {
    notFound();
  }

  const Sample = experiment.Sample;

  return (
    <main className="flex flex-1 flex-col">
      <div className="px-6 pt-6">
        <Link
          href={`/lab/${site.slug}`}
          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          ← {site.title} 기술 페이지로
        </Link>
      </div>
      <Sample />
    </main>
  );
}
