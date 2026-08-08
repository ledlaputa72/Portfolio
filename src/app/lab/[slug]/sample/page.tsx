import { notFound } from "next/navigation";
import { labSites } from "@/data/lab-sites";
import { labExperiments } from "@/components/lab/experiments/registry";
import LabSampleBackLink from "@/components/lab/LabSampleBackLink";

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
        <LabSampleBackLink slug={site.slug} title={site.title} />
      </div>
      <Sample />
    </main>
  );
}
